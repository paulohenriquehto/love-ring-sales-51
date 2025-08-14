-- Add engraving config and upload product image for ANT437
DO $$
DECLARE
  product_uuid UUID := 'a5fe313e-df9f-490a-9415-4f4a1e58e5e4';
BEGIN
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
  
  -- Add product image
  INSERT INTO public.product_images (
    product_id,
    image_url,
    alt_text,
    is_primary,
    display_order
  ) VALUES (
    product_uuid,
    'https://fvjowvxlqqmvwkqqqxsb.supabase.co/storage/v1/object/public/product-images/ant437-tungsten-ring.jpg',
    'A Certain Romance - Aliança de Tungstênio com Acabamento Fosco e Dourado',
    true,
    1
  );
  
  RAISE NOTICE 'Engraving config and image added for ANT437';
END $$;