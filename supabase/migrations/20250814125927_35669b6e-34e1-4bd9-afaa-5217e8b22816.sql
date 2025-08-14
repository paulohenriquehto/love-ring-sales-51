-- Fix function search path security warnings by updating existing functions
CREATE OR REPLACE FUNCTION public.create_inventory_for_variant()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.generate_variant_sku()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;