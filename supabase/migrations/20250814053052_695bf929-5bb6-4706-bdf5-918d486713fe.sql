-- Corrigir o SKU do produto "All we need" para ANT117
UPDATE public.products 
SET sku = 'ANT117-NEED',
    description = 'Luxuosa aliança de tungstênio com inlay de fibra e cristal de swarovski. Hipoalérgica, não amassa, não enferruja, resistente a riscos. 4x mais duro que o titânio, 10x mais duro que o ouro 18K.',
    weight = 13.5
WHERE sku = 'ANT116-NEED';

-- Atualizar a imagem do produto para a imagem correta do ANT117
INSERT INTO public.product_images (product_id, image_url, alt_text, is_primary, display_order)
SELECT 
  id,
  'https://inlovestore.com/wp-content/uploads/2024/02/ant117.png',
  'All we need - Luxuosa aliança de tungstênio com inlay de fibra e cristal de swarovski',
  true,
  1
FROM public.products 
WHERE sku = 'ANT117-NEED'
ON CONFLICT DO NOTHING;