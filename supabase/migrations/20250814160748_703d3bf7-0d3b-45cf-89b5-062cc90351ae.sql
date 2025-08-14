-- Create the tungsten ring product "A Certain Romance"
INSERT INTO public.products (
  id,
  name,
  description,
  sku,
  base_price,
  category_id,
  weight,
  active,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'A Certain Romance – Aliança De Tungstênio Com Acabamento Fosco e Dourado',
  'Benefícios do tungstênio:
• Hipoalérgica
• Não amassa
• Não enferruja
• Resistente a riscos
• O único metal que tem brilho eterno
• 4x mais duro que o titânio, 10x mais duro que o ouro 18K

Material: Tungstênio, Ouro 18k
Cor: Ouro
Anatômica
Largura: 8mm
Tamanho: 8 – 36
Peso: 5g À 18g',
  'ANT437',
  179.00,
  '24691d8d-562d-4012-9f0c-0821ff8887e2',
  5.00,
  true,
  now(),
  now()
);

-- Get the product ID for further operations
DO $$
DECLARE
  product_uuid UUID;
  variant_uuid UUID;
  warehouse_record RECORD;
  size_num INTEGER;
BEGIN
  -- Get the product ID
  SELECT id INTO product_uuid FROM public.products WHERE sku = 'ANT437';
  
  -- Create engraving configuration
  INSERT INTO public.product_engraving_config (
    product_id,
    supports_engraving,
    max_characters,
    price_adjustment,
    available_fonts
  ) VALUES (
    product_uuid,
    true,
    30,
    0,
    ARRAY['arial', 'poiret', 'josefin', 'cinzel', 'handlee', 'tangerine', 'reenie', 'annie']
  );
  
  -- Create 30 product variants for sizes 08-36
  FOR size_num IN 8..36 LOOP
    INSERT INTO public.product_variants (
      id,
      product_id,
      size,
      color,
      width,
      material_id,
      price_adjustment,
      active,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      product_uuid,
      LPAD(size_num::text, 2, '0'),
      'Fosco e Dourado',
      '8mm',
      '9f3bbdf7-10e3-4be1-a589-597bf975d855',
      0,
      true,
      now(),
      now()
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
        minimum_stock,
        created_at,
        updated_at
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
        2,
        now(),
        now()
      );
    END LOOP;
  END LOOP;
  
  RAISE NOTICE 'Product ANT437 created successfully with 30 variants and inventory records';
END $$;