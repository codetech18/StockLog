import NetInfo from '@react-native-community/netinfo';
import * as Crypto from 'expo-crypto';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';

import { getTodayDateString } from '@/lib/date';
import { storage } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import type { Inventory, PaymentMethod, SaleWithDevice } from '@/lib/types';

type AddInventoryPayload = {
  shop_id: string;
  device_name: string;
  brand: string | null;
  storage: string | null;
  color: string | null;
  imei: string | null;
  condition: Inventory['condition'];
  cost_price: number;
  selling_price: number;
};

type RecordSalePayload = {
  inventory_id: string;
  buyer_name: string | null;
  buyer_phone: string | null;
  selling_price: number;
  payment_method: PaymentMethod;
};

type UpdateInventoryPayload = {
  id: string;
  device_name: string;
  brand: string | null;
  storage: string | null;
  color: string | null;
  imei: string | null;
  condition: Inventory['condition'];
  cost_price: number;
  selling_price: number;
};

type AddInventoryOp = {
  opId: string;
  kind: 'add_inventory';
  createdAt: string;
  payload: AddInventoryPayload & { id: string };
};

type RecordSaleOp = {
  opId: string;
  kind: 'record_sale';
  createdAt: string;
  payload: RecordSalePayload;
};

type UpdateInventoryOp = {
  opId: string;
  kind: 'update_inventory';
  createdAt: string;
  payload: UpdateInventoryPayload;
};

type DeleteInventoryOp = {
  opId: string;
  kind: 'delete_inventory';
  createdAt: string;
  payload: { id: string };
};

type RestoreSaleOp = {
  opId: string;
  kind: 'restore_sale';
  createdAt: string;
  payload: { inventory_id: string };
};

type OutboxOp = AddInventoryOp | RecordSaleOp | UpdateInventoryOp | DeleteInventoryOp | RestoreSaleOp;

const OUTBOX_KEY = 'outbox';
const INVENTORY_CACHE_KEY = 'cache:inventory';
const SALES_CACHE_KEY = 'cache:sales';

function readJSON<T>(key: string, fallback: T): T {
  const raw = storage.getString(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown): void {
  storage.set(key, JSON.stringify(value));
}

// supabase-js returns a PostgrestError with an empty `code` when the failure
// happened before a real HTTP response came back (i.e. no connectivity) —
// a genuine server-side error (duplicate IMEI, bad RPC args, etc.) always has one.
function isNetworkError(error: { code?: string }): boolean {
  return !error.code;
}

function mergeInventory(server: Inventory[], outbox: OutboxOp[]): Inventory[] {
  const soldIds = new Set(
    outbox.filter((op): op is RecordSaleOp => op.kind === 'record_sale').map((op) => op.payload.inventory_id)
  );
  const restoredIds = new Set(
    outbox.filter((op): op is RestoreSaleOp => op.kind === 'restore_sale').map((op) => op.payload.inventory_id)
  );
  const deletedIds = new Set(
    outbox.filter((op): op is DeleteInventoryOp => op.kind === 'delete_inventory').map((op) => op.payload.id)
  );
  // Last queued edit for a given item wins — outbox is in FIFO order.
  const editsById = new Map<string, UpdateInventoryPayload>();
  for (const op of outbox) {
    if (op.kind === 'update_inventory') editsById.set(op.payload.id, op.payload);
  }

  const today = getTodayDateString();
  const pendingAdds: Inventory[] = outbox
    .filter((op): op is AddInventoryOp => op.kind === 'add_inventory')
    .filter((op) => !deletedIds.has(op.payload.id))
    .map((op) => {
      const edit = editsById.get(op.payload.id);
      return {
        id: op.payload.id,
        shop_id: op.payload.shop_id,
        device_name: edit?.device_name ?? op.payload.device_name,
        brand: edit?.brand ?? op.payload.brand,
        imei: edit?.imei ?? op.payload.imei,
        color: edit?.color ?? op.payload.color,
        storage: edit?.storage ?? op.payload.storage,
        condition: edit?.condition ?? op.payload.condition,
        cost_price: edit?.cost_price ?? op.payload.cost_price,
        selling_price: edit?.selling_price ?? op.payload.selling_price,
        status: 'in_stock',
        date_of_entry: today,
        created_at: op.createdAt,
      };
    });

  const serverAdjusted = server
    .filter((item) => !deletedIds.has(item.id))
    .map((item) => {
      const next = restoredIds.has(item.id)
        ? { ...item, status: 'in_stock' as const }
        : soldIds.has(item.id)
          ? { ...item, status: 'sold' as const }
          : item;
      const edit = editsById.get(item.id);
      return edit ? { ...next, ...edit } : next;
    });

  return [...pendingAdds, ...serverAdjusted].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

function mergeSales(
  server: SaleWithDevice[],
  outbox: OutboxOp[],
  inventoryById: Map<string, Inventory>
): SaleWithDevice[] {
  const restoredIds = new Set(
    outbox.filter((op): op is RestoreSaleOp => op.kind === 'restore_sale').map((op) => op.payload.inventory_id)
  );

  const today = getTodayDateString();
  const pending: SaleWithDevice[] = outbox
    .filter((op): op is RecordSaleOp => op.kind === 'record_sale')
    .filter((op) => !restoredIds.has(op.payload.inventory_id))
    .map((op) => {
      const item = inventoryById.get(op.payload.inventory_id);
      return {
        id: `pending-${op.opId}`,
        shop_id: item?.shop_id ?? '',
        inventory_id: op.payload.inventory_id,
        buyer_name: op.payload.buyer_name,
        buyer_phone: op.payload.buyer_phone,
        selling_price: op.payload.selling_price,
        payment_method: op.payload.payment_method,
        date_of_sale: today,
        created_at: op.createdAt,
        inventory: item
          ? { device_name: item.device_name, brand: item.brand, imei: item.imei, cost_price: item.cost_price }
          : null,
      };
    });

  const serverFiltered = server.filter((sale) => !restoredIds.has(sale.inventory_id));

  return [...pending, ...serverFiltered].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

type OfflineContextValue = {
  isOnline: boolean;
  inventory: Inventory[];
  sales: SaleWithDevice[];
  pendingCount: number;
  syncError: string | null;
  fetchError: string | null;
  isRefreshing: boolean;
  refresh: () => Promise<void>;
  addInventory: (payload: AddInventoryPayload) => Promise<{ error: string | null; queued: boolean }>;
  recordSale: (payload: RecordSalePayload) => Promise<{ error: string | null; queued: boolean }>;
  updateInventory: (payload: UpdateInventoryPayload) => Promise<{ error: string | null; queued: boolean }>;
  deleteInventory: (id: string) => Promise<{ error: string | null; queued: boolean }>;
  restoreSale: (inventoryId: string) => Promise<{ error: string | null; queued: boolean }>;
};

const OfflineContext = createContext<OfflineContextValue | null>(null);

export function OfflineProvider({ children }: PropsWithChildren) {
  const [isOnline, setIsOnline] = useState(true);
  const [serverInventory, setServerInventory] = useState<Inventory[]>(() => readJSON(INVENTORY_CACHE_KEY, []));
  const [serverSales, setServerSales] = useState<SaleWithDevice[]>(() => readJSON(SALES_CACHE_KEY, []));
  const [outbox, setOutbox] = useState<OutboxOp[]>(() => readJSON(OUTBOX_KEY, []));
  const [syncError, setSyncError] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const outboxRef = useRef(outbox);
  outboxRef.current = outbox;
  const isFlushingRef = useRef(false);

  const updateOutbox = useCallback((next: OutboxOp[]) => {
    setOutbox(next);
    writeJSON(OUTBOX_KEY, next);
  }, []);

  const refresh = useCallback(async () => {
    const state = await NetInfo.fetch();
    const online = state.isConnected === true && state.isInternetReachable !== false;
    if (!online) return;

    setIsRefreshing(true);
    const [invResult, salesResult] = await Promise.all([
      supabase.from('inventory').select('*').order('created_at', { ascending: false }),
      supabase
        .from('sales')
        .select('*, inventory(device_name, brand, imei, cost_price)')
        .order('created_at', { ascending: false }),
    ]);
    if (!invResult.error && invResult.data) {
      setServerInventory(invResult.data as Inventory[]);
      writeJSON(INVENTORY_CACHE_KEY, invResult.data);
    }
    if (!salesResult.error && salesResult.data) {
      setServerSales(salesResult.data as SaleWithDevice[]);
      writeJSON(SALES_CACHE_KEY, salesResult.data);
    }
    const realFetchError = [invResult.error, salesResult.error].find((error) => error && !isNetworkError(error));
    setFetchError(realFetchError ? "Couldn't load the latest data. Showing what's saved on your device." : null);
    setIsRefreshing(false);
  }, []);

  const flush = useCallback(async () => {
    if (isFlushingRef.current) return;
    isFlushingRef.current = true;
    setSyncError(null);

    let queue = outboxRef.current;
    while (queue.length > 0) {
      const op = queue[0];
      try {
        if (op.kind === 'add_inventory') {
          const { id, ...rest } = op.payload;
          const { error } = await supabase.from('inventory').insert({ id, ...rest });
          if (error && error.code === '23505') {
            if (error.message?.toLowerCase().includes('imei')) {
              setSyncError(`"${rest.device_name}" couldn't sync — that IMEI is already logged under another device.`);
            }
            // Otherwise this is our own id from a retried op that already landed — drop it either way.
          } else if (error) {
            throw error;
          }
        } else if (op.kind === 'record_sale') {
          const { error } = await supabase.rpc('record_sale', {
            p_inventory_id: op.payload.inventory_id,
            p_buyer_name: op.payload.buyer_name,
            p_buyer_phone: op.payload.buyer_phone,
            p_selling_price: op.payload.selling_price,
            p_payment_method: op.payload.payment_method,
          });
          if (error) throw error;
        } else if (op.kind === 'update_inventory') {
          const { id, ...rest } = op.payload;
          const { error } = await supabase.from('inventory').update(rest).eq('id', id);
          if (error && error.code === '23505') {
            setSyncError(`"${rest.device_name}" couldn't sync — that IMEI is already logged under another device.`);
          } else if (error) {
            throw error;
          }
        } else if (op.kind === 'delete_inventory') {
          const { error } = await supabase.from('inventory').delete().eq('id', op.payload.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.rpc('restore_sale', { p_inventory_id: op.payload.inventory_id });
          if (error) throw error;
        }
        queue = queue.slice(1);
        updateOutbox(queue);
      } catch (err) {
        setSyncError(err instanceof Error ? err.message : 'Sync failed. Will retry when back online.');
        break;
      }
    }

    isFlushingRef.current = false;
    await refresh();
  }, [refresh, updateOutbox]);

  useEffect(() => {
    let previousOnline: boolean | null = null;
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = state.isConnected === true && state.isInternetReachable !== false;
      setIsOnline(online);
      const justReconnected = previousOnline === false && online;
      const startupWithPending = previousOnline === null && online && outboxRef.current.length > 0;
      if (justReconnected || startupWithPending) {
        void flush();
      }
      previousOnline = online;
    });
    return unsubscribe;
  }, [flush]);

  const addInventory = useCallback<OfflineContextValue['addInventory']>(
    async (payload) => {
      if (isOnline) {
        const { error } = await supabase.from('inventory').insert(payload);
        if (!error) {
          void refresh();
          return { error: null, queued: false };
        }
        if (error.code === '23505') {
          return { error: 'This IMEI is already logged. Check the device or enter a different IMEI.', queued: false };
        }
        if (!isNetworkError(error)) {
          return { error: error.message, queued: false };
        }
      }

      const op: AddInventoryOp = {
        opId: Crypto.randomUUID(),
        kind: 'add_inventory',
        createdAt: new Date().toISOString(),
        payload: { ...payload, id: Crypto.randomUUID() },
      };
      updateOutbox([...outboxRef.current, op]);
      return { error: null, queued: true };
    },
    [isOnline, refresh, updateOutbox]
  );

  const recordSale = useCallback<OfflineContextValue['recordSale']>(
    async (payload) => {
      if (isOnline) {
        const { error } = await supabase.rpc('record_sale', {
          p_inventory_id: payload.inventory_id,
          p_buyer_name: payload.buyer_name,
          p_buyer_phone: payload.buyer_phone,
          p_selling_price: payload.selling_price,
          p_payment_method: payload.payment_method,
        });
        if (!error) {
          void refresh();
          return { error: null, queued: false };
        }
        if (!isNetworkError(error)) {
          return { error: error.message, queued: false };
        }
      }

      const op: RecordSaleOp = {
        opId: Crypto.randomUUID(),
        kind: 'record_sale',
        createdAt: new Date().toISOString(),
        payload,
      };
      updateOutbox([...outboxRef.current, op]);
      return { error: null, queued: true };
    },
    [isOnline, refresh, updateOutbox]
  );

  const updateInventory = useCallback<OfflineContextValue['updateInventory']>(
    async (payload) => {
      const { id, ...rest } = payload;
      if (isOnline) {
        const { error } = await supabase.from('inventory').update(rest).eq('id', id);
        if (!error) {
          void refresh();
          return { error: null, queued: false };
        }
        if (error.code === '23505') {
          return { error: 'This IMEI is already logged. Check the device or enter a different IMEI.', queued: false };
        }
        if (!isNetworkError(error)) {
          return { error: error.message, queued: false };
        }
      }

      const op: UpdateInventoryOp = {
        opId: Crypto.randomUUID(),
        kind: 'update_inventory',
        createdAt: new Date().toISOString(),
        payload,
      };
      updateOutbox([...outboxRef.current, op]);
      return { error: null, queued: true };
    },
    [isOnline, refresh, updateOutbox]
  );

  const deleteInventory = useCallback<OfflineContextValue['deleteInventory']>(
    async (id) => {
      const isStillPendingAdd = outboxRef.current.some((op) => op.kind === 'add_inventory' && op.payload.id === id);

      // Drop any queued add/update/delete ops for this id — superseded by the delete either way.
      const withoutStaleOps = (queue: OutboxOp[]) =>
        queue.filter((op) => {
          if (op.kind === 'add_inventory' || op.kind === 'update_inventory' || op.kind === 'delete_inventory') {
            return op.payload.id !== id;
          }
          return true;
        });

      if (isStillPendingAdd) {
        // Never reached the server — nothing to sync, just forget it ever happened.
        updateOutbox(withoutStaleOps(outboxRef.current));
        return { error: null, queued: false };
      }

      if (isOnline) {
        const { error } = await supabase.from('inventory').delete().eq('id', id);
        if (!error) {
          updateOutbox(withoutStaleOps(outboxRef.current));
          // Remove it from local state immediately — waiting on refresh() alone left a
          // window (and sometimes a visible "it's still there" flash) where the deleted
          // item kept showing until the refetch round-trip finished.
          setServerInventory((prev) => {
            const next = prev.filter((item) => item.id !== id);
            writeJSON(INVENTORY_CACHE_KEY, next);
            return next;
          });
          void refresh();
          return { error: null, queued: false };
        }
        if (!isNetworkError(error)) {
          return { error: error.message, queued: false };
        }
      }

      const op: DeleteInventoryOp = {
        opId: Crypto.randomUUID(),
        kind: 'delete_inventory',
        createdAt: new Date().toISOString(),
        payload: { id },
      };
      updateOutbox([...withoutStaleOps(outboxRef.current), op]);
      return { error: null, queued: true };
    },
    [isOnline, refresh, updateOutbox]
  );

  const restoreSale = useCallback<OfflineContextValue['restoreSale']>(
    async (inventoryId) => {
      if (isOnline) {
        const { error } = await supabase.rpc('restore_sale', { p_inventory_id: inventoryId });
        if (!error) {
          // Optimistic local update — the RPC already deleted the sale and flipped the
          // device back to in_stock server-side; reflect that immediately rather than
          // waiting on the refetch round-trip (same lesson as the delete-item fix above).
          setServerInventory((prev) => {
            const next = prev.map((item) => (item.id === inventoryId ? { ...item, status: 'in_stock' as const } : item));
            writeJSON(INVENTORY_CACHE_KEY, next);
            return next;
          });
          setServerSales((prev) => {
            const next = prev.filter((sale) => sale.inventory_id !== inventoryId);
            writeJSON(SALES_CACHE_KEY, next);
            return next;
          });
          void refresh();
          return { error: null, queued: false };
        }
        if (!isNetworkError(error)) {
          return { error: error.message, queued: false };
        }
      }

      const op: RestoreSaleOp = {
        opId: Crypto.randomUUID(),
        kind: 'restore_sale',
        createdAt: new Date().toISOString(),
        payload: { inventory_id: inventoryId },
      };
      updateOutbox([...outboxRef.current, op]);
      return { error: null, queued: true };
    },
    [isOnline, refresh, updateOutbox]
  );

  const inventory = useMemo(() => mergeInventory(serverInventory, outbox), [serverInventory, outbox]);
  const inventoryById = useMemo(() => new Map(inventory.map((item) => [item.id, item])), [inventory]);
  const sales = useMemo(() => mergeSales(serverSales, outbox, inventoryById), [serverSales, outbox, inventoryById]);

  const value = useMemo<OfflineContextValue>(
    () => ({
      isOnline,
      inventory,
      sales,
      pendingCount: outbox.length,
      syncError,
      fetchError,
      isRefreshing,
      refresh,
      addInventory,
      recordSale,
      updateInventory,
      deleteInventory,
      restoreSale,
    }),
    [
      isOnline,
      inventory,
      sales,
      outbox.length,
      syncError,
      fetchError,
      isRefreshing,
      refresh,
      addInventory,
      recordSale,
      updateInventory,
      deleteInventory,
      restoreSale,
    ]
  );

  return <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>;
}

export function useOffline() {
  const ctx = useContext(OfflineContext);
  if (!ctx) throw new Error('useOffline must be used within an OfflineProvider');
  return ctx;
}
