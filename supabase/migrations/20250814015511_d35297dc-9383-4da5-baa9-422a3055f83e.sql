-- Add order_number field to orders table
ALTER TABLE public.orders ADD COLUMN order_number TEXT;

-- Create function to generate sequential order numbers
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  order_number TEXT;
BEGIN
  -- Get the next sequence number based on existing orders
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM '[0-9]+') AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.orders
  WHERE order_number IS NOT NULL;
  
  -- Format as PED-000001
  order_number := 'PED-' || LPAD(next_number::TEXT, 6, '0');
  
  RETURN order_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-generate order numbers
CREATE OR REPLACE FUNCTION public.set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := public.generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_set_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_order_number();

-- Update existing orders with order numbers
UPDATE public.orders 
SET order_number = 'PED-' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 6, '0')
WHERE order_number IS NULL;

-- Create optimized indexes for search
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_customer_cpf ON public.orders (customer_cpf);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_customer_name ON public.orders USING gin(to_tsvector('portuguese', customer_name));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_order_number ON public.orders (order_number);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_status ON public.orders (status);

-- Create composite index for multi-field searches
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_search_composite ON public.orders (customer_cpf, customer_name, order_number, created_at DESC);