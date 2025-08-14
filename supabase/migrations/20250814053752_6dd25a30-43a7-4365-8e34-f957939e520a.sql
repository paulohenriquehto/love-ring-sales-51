-- Verificar e limpar todas as variantes que possam estar causando conflito
DELETE FROM public.product_variants 
WHERE sku_variant LIKE 'ANT14-THOUSAND%' 
   OR sku_variant LIKE 'ANT110-AWAYFROMSUN%'
   OR sku_variant LIKE 'AF01-PERFEITO2%';

-- Agora criar as variantes para ANT14 com SKUs únicos manualmente
-- Variantes para ANT14 6mm Ouro
INSERT INTO public.product_variants (product_id, material_id, size, width, color, price_adjustment, active)
SELECT 
  p.id,
  '9f3bbdf7-10e3-4be1-a589-597bf975d855',
  LPAD(s.size_num::text, 2, '0'),
  '6mm',
  'Ouro',
  0,
  true
FROM public.products p
CROSS JOIN (SELECT generate_series(8, 36) AS size_num) s
WHERE p.sku = 'ANT14-THOUSAND';

-- Variantes para ANT14 6mm Rose
INSERT INTO public.product_variants (product_id, material_id, size, width, color, price_adjustment, active)
SELECT 
  p.id,
  '9f3bbdf7-10e3-4be1-a589-597bf975d855',
  LPAD(s.size_num::text, 2, '0'),
  '6mm',
  'Rose',
  0,
  true
FROM public.products p
CROSS JOIN (SELECT generate_series(8, 36) AS size_num) s
WHERE p.sku = 'ANT14-THOUSAND';