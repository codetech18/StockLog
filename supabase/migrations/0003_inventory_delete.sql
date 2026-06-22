-- StockLog — allow deleting an inventory item (in-stock items only, enforced in the app;
-- the DB still blocks deleting a sold item via the existing sales.inventory_id FK, which
-- has no ON DELETE CASCADE, so a delete of a referenced row is rejected automatically).
-- Run this once in the Supabase SQL editor after 0001_init.sql/0002_record_sale.sql.

create policy "inventory_delete_own_shop" on inventory
  for delete
  using (shop_id in (select id from shops where owner_id = auth.uid()));
