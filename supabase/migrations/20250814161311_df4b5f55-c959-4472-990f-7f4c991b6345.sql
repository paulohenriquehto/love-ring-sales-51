-- Create 30 size variants for ANT437 product
DO $$
DECLARE
  product_uuid UUID := 'a5fe313e-df9f-490a-9415-4f4a1e58e5e4';
  variant_uuid UUID;
  warehouse_record RECORD;
  size_num INTEGER;
BEGIN
  -- Create 30 product variants for sizes 08-36
  FOR size_num IN 8..36 LOOP
    INSERT INTO public.product_variants (
      product_id,
      size,
      color,
      width,
      material_id,
      price_adjustment,
      active
    ) VALUES (
      product_uuid,
      LPAD(size_num::text, 2, '0'),
      'Fosco e Dourado',
      '8mm',
      '9f3bbdf7-10e3-4be1-a589-597bf975d855',
      0,
      true
    ) RETURNING id INTO variant_uuid;
    
    -- Create inventory records for each variant in all warehouses
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
        product_uuid,
        variant_uuid,
        warehouse_record.id,
        CASE 
          WHEN warehouse_record.id = (SELECT id FROM public.warehouses WHERE name ILIKE '%principal%' LIMIT 1) THEN 2
          WHEN warehouse_record.id = (SELECT id FROM public.warehouses WHERE name ILIKE '%central%' LIMIT 1) THEN 2
          ELSE 1
        END,
        0,
        2
      ) ON CONFLICT (product_id, variant_id, warehouse_id) DO NOTHING;
    END LOOP;
  END LOOP;
  
  RAISE NOTICE 'Created 30 size variants (08-36) for ANT437 with inventory';
END $$;