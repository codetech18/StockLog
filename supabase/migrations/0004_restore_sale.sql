-- StockLog — restore a sold device back to stock (customer return).
-- Deletes the sale record and puts the device back to 'in_stock' atomically.
-- Run this once in the Supabase SQL editor after 0001_init.sql.

create policy "sales_delete_own_shop" on sales
  for delete
  using (shop_id in (select id from shops where owner_id = auth.uid()));

create or replace function restore_sale(p_inventory_id uuid) returns void
language plpgsql
security invoker
as $$
declare
  v_status text;
begin
  select status into v_status from inventory where id = p_inventory_id;

  if v_status is null then
    raise exception 'Device not found.';
  end if;

  if v_status != 'sold' then
    raise exception 'This device is not marked as sold.';
  end if;

  delete from sales where inventory_id = p_inventory_id;
  update inventory set status = 'in_stock' where id = p_inventory_id;
end;
$$;

grant execute on function restore_sale(uuid) to authenticated;
