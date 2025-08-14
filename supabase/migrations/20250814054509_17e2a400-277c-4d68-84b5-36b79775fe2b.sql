-- Delete any existing variants for ANT110 to avoid duplicates
DELETE FROM public.product_variants 
WHERE product_id IN (SELECT id FROM public.products WHERE sku = 'ANT110');

-- Delete existing product if it exists
DELETE FROM public.product_images 
WHERE product_id IN (SELECT id FROM public.products WHERE sku = 'ANT110');

DELETE FROM public.products WHERE sku = 'ANT110';

-- Create product ANT110 - Away From The Sun
INSERT INTO public.products (sku, name, description, base_price, category_id, active)
VALUES (
  'ANT110',
  'Away From The Sun - Aliança De Tungstênio Com Acabamento De Alto Brilho',
  'Benefícios do tungstênio:
• Hipoalérgica
• Não amassa
• Não enferruja
• Resistente a riscos
• O único metal que tem brilho eterno
• 4x mais duro que o titânio, 10x mais duro que o ouro 18K

Material: tungstênio, titânio
Cor: preto
Anatômica
Peso: 5g à 18g',
  154.00,
  (SELECT id FROM public.categories WHERE name = 'Anéis' LIMIT 1),
  true
);

-- Add product image
INSERT INTO public.product_images (product_id, image_url, alt_text, is_primary, display_order)
SELECT 
  p.id,
  'https://inlovestore.com/wp-content/uploads/2024/02/ant110.png',
  'Away From The Sun - Aliança De Tungstênio Com Acabamento De Alto Brilho',
  true,
  0
FROM public.products p
WHERE p.sku = 'ANT110';

-- Create variants for ANT110 - 4mm width, preto color (sizes 8-36) - base price
INSERT INTO public.product_variants (product_id, material_id, size, width, color, price_adjustment, active)
SELECT 
  p.id,
  '9f3bbdf7-10e3-4be1-a589-597bf975d855', -- tungstênio material
  LPAD(s.size_num::text, 2, '0'),
  '4mm',
  'Preto',
  0,
  true
FROM public.products p
CROSS JOIN (SELECT generate_series(8, 36) AS size_num) s
WHERE p.sku = 'ANT110';

-- Create variants for ANT110 - 6mm width, preto color (sizes 8-36) - +R$ 10
INSERT INTO public.product_variants (product_id, material_id, size, width, color, price_adjustment, active)
SELECT 
  p.id,
  '9f3bbdf7-10e3-4be1-a589-597bf975d855', -- tungstênio material
  LPAD(s.size_num::text, 2, '0'),
  '6mm',
  'Preto',
  10,
  true
FROM public.products p
CROSS JOIN (SELECT generate_series(8, 36) AS size_num) s
WHERE p.sku = 'ANT110';

-- Create variants for ANT110 - 8mm width, preto color (sizes 8-36) - +R$ 20
INSERT INTO public.product_variants (product_id, material_id, size, width, color, price_adjustment, active)
SELECT 
  p.id,
  '9f3bbdf7-10e3-4be1-a589-597bf975d855', -- tungstênio material
  LPAD(s.size_num::text, 2, '0'),
  '8mm',
  'Preto',
  20,
  true
FROM public.products p
CROSS JOIN (SELECT generate_series(8, 36) AS size_num) s
WHERE p.sku = 'ANT110';