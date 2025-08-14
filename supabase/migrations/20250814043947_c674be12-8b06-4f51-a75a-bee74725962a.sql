-- Inserir imagem para o produto ANT437
DO $$
DECLARE
  product_uuid UUID;
BEGIN
  -- Obter ID do produto ANT437
  SELECT id INTO product_uuid FROM public.products WHERE sku = 'ANT437';
  
  IF product_uuid IS NOT NULL THEN
    -- Inserir imagem do produto (usando uma imagem placeholder por enquanto)
    INSERT INTO public.product_images (
      product_id,
      image_url,
      is_primary,
      display_order,
      alt_text
    ) VALUES (
      product_uuid,
      'https://fvjowvxlqqmvwkqqqxsb.supabase.co/storage/v1/object/public/product-images/ant437-placeholder.jpg',
      true,
      0,
      'Aliança A Certain Romance - Tungstênio com acabamento fosco e dourado'
    )
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Imagem inserida para o produto ANT437 (ID: %)', product_uuid;
  ELSE
    RAISE NOTICE 'Produto ANT437 não encontrado';
  END IF;
END $$;