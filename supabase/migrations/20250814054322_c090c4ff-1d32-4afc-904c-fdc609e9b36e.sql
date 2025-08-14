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