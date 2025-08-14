-- Update the "A Thousand Years" product with correct information
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

-- Delete existing variants to recreate them properly
DELETE FROM public.product_variants 
WHERE product_id = (SELECT id FROM public.products WHERE sku = 'ANT14-THOUSAND');

-- Create variants for ANT14 - 6mm width, Ouro color (sizes 8-36)
INSERT INTO public.product_variants (product_id, material_id, size, width, color, price_adjustment, active)
SELECT 
  p.id,
  '9f3bbdf7-10e3-4be1-a589-597bf975d855', -- tungstênio material
  LPAD(s.size_num::text, 2, '0'),
  '6mm',
  'Ouro',
  0,
  true
FROM public.products p
CROSS JOIN (SELECT generate_series(8, 36) AS size_num) s
WHERE p.sku = 'ANT14-THOUSAND';

-- Create variants for ANT14 - 6mm width, Rose color (sizes 8-36)
INSERT INTO public.product_variants (product_id, material_id, size, width, color, price_adjustment, active)
SELECT 
  p.id,
  '9f3bbdf7-10e3-4be1-a589-597bf975d855', -- tungstênio material
  LPAD(s.size_num::text, 2, '0'),
  '6mm',
  'Rose',
  0,
  true
FROM public.products p
CROSS JOIN (SELECT generate_series(8, 36) AS size_num) s
WHERE p.sku = 'ANT14-THOUSAND';

-- Create variants for ANT14 - 8mm width, Ouro color (sizes 8-36) with R$ 10 price adjustment
INSERT INTO public.product_variants (product_id, material_id, size, width, color, price_adjustment, active)
SELECT 
  p.id,
  '9f3bbdf7-10e3-4be1-a589-597bf975d855', -- tungstênio material
  LPAD(s.size_num::text, 2, '0'),
  '8mm',
  'Ouro',
  10.00, -- R$ 194,00 - R$ 184,00 = R$ 10,00 adjustment for 8mm
  true
FROM public.products p
CROSS JOIN (SELECT generate_series(8, 36) AS size_num) s
WHERE p.sku = 'ANT14-THOUSAND';

-- Create variants for ANT14 - 8mm width, Rose color (sizes 8-36) with R$ 10 price adjustment
INSERT INTO public.product_variants (product_id, material_id, size, width, color, price_adjustment, active)
SELECT 
  p.id,
  '9f3bbdf7-10e3-4be1-a589-597bf975d855', -- tungstênio material
  LPAD(s.size_num::text, 2, '0'),
  '8mm',
  'Rose',
  10.00, -- R$ 194,00 - R$ 184,00 = R$ 10,00 adjustment for 8mm
  true
FROM public.products p
CROSS JOIN (SELECT generate_series(8, 36) AS size_num) s
WHERE p.sku = 'ANT14-THOUSAND';