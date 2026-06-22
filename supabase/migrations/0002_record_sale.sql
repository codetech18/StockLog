-- StockLog — record a sale atomically (insert into sales, mark inventory sold).
-- Run this once in the Supabase SQL editor after 0001_init.sql.

create or replace function record_sale(
  p_inventory_id uuid,
  p_buyer_name text,
  p_buyer_phone text,
  p_selling_price integer,
  p_payment_method text
) returns sales
language plpgsql
security invoker
as $$
declare
  v_shop_id uuid;
  v_status text;
  v_result sales;
begin
  if p_selling_price is null or p_selling_price < 0 then
    raise exception 'Enter a valid selling price.';
  end if;

  select shop_id, status into v_shop_id, v_status
  from inventory
  where id = p_inventory_id;

  if v_shop_id is null then
    raise exception 'Device not found.';
  end if;

  if v_status = 'sold' then
    raise exception 'This device has already been sold.';
  end if;

  update inventory set status = 'sold' where id = p_inventory_id;

  insert into sales (shop_id, inventory_id, buyer_name, buyer_phone, selling_price, payment_method)
  values (v_shop_id, p_inventory_id, p_buyer_name, p_buyer_phone, p_selling_price, p_payment_method)
  returning * into v_result;

  return v_result;
end;
$$;

grant execute on function record_sale(uuid, text, text, integer, text) to authenticated;
