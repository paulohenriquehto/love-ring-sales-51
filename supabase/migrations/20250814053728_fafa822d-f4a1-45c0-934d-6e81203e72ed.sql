-- Criar variantes para ANT14 em lotes para evitar problemas de memória
-- Primeiro lote: ANT14 com largura 6mm
INSERT INTO public.product_variants (product_id, material_id, size, width, color, price_adjustment, active)
SELECT 
  p.id,
  '9f3bbdf7-10e3-4be1-a589-597bf975d855', -- Material Tungstênio
  LPAD(s.size_num::text, 2, '0'),
  '6mm',
  c.color,
  0, -- Sem ajuste para 6mm
  true
FROM public.products p
CROSS JOIN (SELECT generate_series(8, 36) AS size_num) s
CROSS JOIN (SELECT unnest(ARRAY['Ouro', 'Rose']) AS color) c
WHERE p.sku = 'ANT14-THOUSAND';

-- Segundo lote: ANT14 com largura 8mm (com ajuste de preço)
INSERT INTO public.product_variants (product_id, material_id, size, width, color, price_adjustment, active)
SELECT 
  p.id,
  '9f3bbdf7-10e3-4be1-a589-597bf975d855', -- Material Tungstênio
  LPAD(s.size_num::text, 2, '0'),
  '8mm',
  c.color,
  10, -- Ajuste de R$ 10 para 8mm
  true
FROM public.products p
CROSS JOIN (SELECT generate_series(8, 36) AS size_num) s
CROSS JOIN (SELECT unnest(ARRAY['Ouro', 'Rose']) AS color) c
WHERE p.sku = 'ANT14-THOUSAND';