-- Fix the ambiguous column reference in generate_order_number function
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  next_number INTEGER;
  order_number TEXT;
BEGIN
  -- Get the next sequence number based on existing orders
  SELECT COALESCE(MAX(CAST(SUBSTRING(orders.order_number FROM '[0-9]+') AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.orders
  WHERE orders.order_number IS NOT NULL;
  
  -- Format as PED-000001
  order_number := 'PED-' || LPAD(next_number::TEXT, 6, '0');
  
  RETURN order_number;
END;
$function$