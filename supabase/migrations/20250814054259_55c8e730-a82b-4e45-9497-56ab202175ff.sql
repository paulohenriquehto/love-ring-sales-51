-- Clear all existing variants for ANT14 that might be causing conflicts
DELETE FROM public.inventory 
WHERE variant_id IN (
  SELECT id FROM public.product_variants 
  WHERE product_id = (SELECT id FROM public.products WHERE sku = 'ANT14-THOUSAND')
);

-- Now delete the variants
DELETE FROM public.product_variants 
WHERE product_id = (SELECT id FROM public.products WHERE sku = 'ANT14-THOUSAND');

-- Update the product information
UPDATE public.products 
SET 
  name = 'A Thousand Years – Aliança de Tungstênio Magnetizada a Ouro 18k',
  description = 'Benefícios do tungstênio:
• Hipoalérgica
• Não amassa
• Não enferruja
• Resistente a riscos
• O único metal que tem brilho eterno
• 4x mais duro que o titânio, 10x mais duro que o ouro 18K

Material: Tungstênio, Ouro rose, Ouro 18k
Cor: Ouro, Rose
Anatômica
Largura: 6mm, 8mm
Tamanho: 8 – 36
Peso: 5g à 18g
*Valor unitário',
  sku = 'ANT14-THOUSAND',
  base_price = 184.00,
  weight = 0.012,
  updated_at = now()
WHERE sku = 'ANT14-THOUSAND' OR name LIKE '%A Thousand Years%';

-- Update the product image
UPDATE public.product_images 
SET image_url = 'https://inlovestore.com/wp-content/uploads/2024/06/ANT14.png'
WHERE product_id = (SELECT id FROM public.products WHERE sku = 'ANT14-THOUSAND');