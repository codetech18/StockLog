export type Shop = {
  id: string;
  owner_id: string;
  owner_name: string | null;
  shop_name: string;
  created_at: string;
};

export type Condition = 'New' | 'UK Used' | 'NG Used';

export type InventoryStatus = 'in_stock' | 'sold';

export type Inventory = {
  id: string;
  shop_id: string;
  device_name: string;
  brand: string | null;
  imei: string | null;
  color: string | null;
  storage: string | null;
  condition: Condition;
  cost_price: number;
  selling_price: number;
  status: InventoryStatus;
  date_of_entry: string;
  created_at: string;
};

export type PaymentMethod = 'Cash' | 'Transfer';

export type Sale = {
  id: string;
  shop_id: string;
  inventory_id: string;
  buyer_name: string | null;
  buyer_phone: string | null;
  selling_price: number;
  payment_method: PaymentMethod;
  date_of_sale: string;
  created_at: string;
};

export type SaleWithDevice = Sale & {
  inventory: Pick<Inventory, 'device_name' | 'brand' | 'imei' | 'cost_price'> | null;
};
