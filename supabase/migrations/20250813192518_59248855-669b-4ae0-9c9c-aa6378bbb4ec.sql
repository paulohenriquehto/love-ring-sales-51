-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Storage policies for product images
CREATE POLICY "Product images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update product images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete product images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Enable RLS for all product-related tables that don't have it yet
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;

-- RLS policies for admin/manager access to products
CREATE POLICY "Admins and managers can manage products" 
ON public.products 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'manager')
  )
);

CREATE POLICY "Admins and managers can manage product variants" 
ON public.product_variants 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'manager')
  )
);

CREATE POLICY "Admins and managers can manage product images" 
ON public.product_images 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'manager')
  )
);

CREATE POLICY "Admins and managers can manage inventory" 
ON public.inventory 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'manager')
  )
);

CREATE POLICY "Admins and managers can manage materials" 
ON public.materials 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'manager')
  )
);

CREATE POLICY "Admins and managers can manage categories" 
ON public.categories 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'manager')
  )
);

CREATE POLICY "Admins and managers can manage suppliers" 
ON public.suppliers 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'manager')
  )
);

CREATE POLICY "Admins and managers can manage warehouses" 
ON public.warehouses 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'manager')
  )
);

-- Function to automatically create inventory records when product variants are created
CREATE OR REPLACE FUNCTION public.create_inventory_for_variant()
RETURNS TRIGGER AS $$
DECLARE
  warehouse_record RECORD;
BEGIN
  -- Create inventory records for all active warehouses
  FOR warehouse_record IN 
    SELECT id FROM public.warehouses WHERE active = true
  LOOP
    INSERT INTO public.inventory (
      product_id,
      variant_id,
      warehouse_id,
      quantity_available,
      quantity_reserved,
      minimum_stock
    ) VALUES (
      NEW.product_id,
      NEW.id,
      warehouse_record.id,
      0,
      0,
      5
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create inventory when variant is created
CREATE TRIGGER create_inventory_on_variant_insert
  AFTER INSERT ON public.product_variants
  FOR EACH ROW
  EXECUTE FUNCTION public.create_inventory_for_variant();

-- Function to generate SKU variants automatically
CREATE OR REPLACE FUNCTION public.generate_variant_sku()
RETURNS TRIGGER AS $$
DECLARE
  base_sku TEXT;
  variant_suffix TEXT := '';
BEGIN
  -- Get base product SKU
  SELECT sku INTO base_sku FROM public.products WHERE id = NEW.product_id;
  
  -- Build variant suffix
  IF NEW.size IS NOT NULL THEN
    variant_suffix := variant_suffix || '-' || UPPER(NEW.size);
  END IF;
  
  IF NEW.color IS NOT NULL THEN
    variant_suffix := variant_suffix || '-' || UPPER(REPLACE(NEW.color, ' ', ''));
  END IF;
  
  IF NEW.material_id IS NOT NULL THEN
    variant_suffix := variant_suffix || '-' || (
      SELECT UPPER(SUBSTRING(name FROM 1 FOR 3)) 
      FROM public.materials 
      WHERE id = NEW.material_id
    );
  END IF;
  
  -- Set the generated SKU
  NEW.sku_variant := COALESCE(base_sku, 'PROD') || variant_suffix;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to generate SKU variants
CREATE TRIGGER generate_sku_on_variant_insert
  BEFORE INSERT ON public.product_variants
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_variant_sku();