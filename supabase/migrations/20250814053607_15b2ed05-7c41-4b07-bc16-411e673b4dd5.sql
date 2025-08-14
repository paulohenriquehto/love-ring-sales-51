-- Limpar variantes existentes dos novos produtos para evitar duplicatas
DELETE FROM public.product_variants 
WHERE product_id IN (
  SELECT id FROM public.products 
  WHERE sku IN ('AF01-PERFEITO2', 'ANT14-THOUSAND', 'ANT110-AWAYFROMSUN')
);

-- Criar variantes para AF01 (21 variantes: tamanhos 8-28, cor dourado)
WITH product_af01 AS (
  SELECT id FROM public.products WHERE sku = 'AF01-PERFEITO2'
),
sizes AS (
  SELECT generate_series(8, 28) AS size_num
)
INSERT INTO public.product_variants (product_id, size, color, price_adjustment, active)
SELECT 
  p.id,
  LPAD(s.size_num::text, 2, '0'),
  'Dourado',
  0,
  true
FROM product_af01 p
CROSS JOIN sizes s;

-- Criar variantes para ANT14 (116 variantes: 29 tamanhos x 2 larguras x 2 cores)
WITH product_ant14 AS (
  SELECT id FROM public.products WHERE sku = 'ANT14-THOUSAND'
),
sizes AS (
  SELECT generate_series(8, 36) AS size_num
),
widths AS (
  SELECT width, price_adj FROM (VALUES 
    ('6mm', 0),
    ('8mm', 10)
  ) AS w(width, price_adj)
),
colors AS (
  SELECT color FROM (VALUES ('Ouro'), ('Rose')) AS c(color)
)
INSERT INTO public.product_variants (product_id, material_id, size, width, color, price_adjustment, active)
SELECT 
  p.id,
  '9f3bbdf7-10e3-4be1-a589-597bf975d855', -- Material Tungstênio
  LPAD(s.size_num::text, 2, '0'),
  w.width,
  c.color,
  w.price_adj,
  true
FROM product_ant14 p
CROSS JOIN sizes s
CROSS JOIN widths w
CROSS JOIN colors c;

-- Criar variantes para ANT110 (87 variantes: 29 tamanhos x 3 larguras, cor preto)
WITH product_ant110 AS (
  SELECT id FROM public.products WHERE sku = 'ANT110-AWAYFROMSUN'
),
sizes AS (
  SELECT generate_series(8, 36) AS size_num
),
widths AS (
  SELECT width, price_adj FROM (VALUES 
    ('4mm', 0),
    ('6mm', 10),
    ('8mm', 20)
  ) AS w(width, price_adj)
)
INSERT INTO public.product_variants (product_id, material_id, size, width, color, price_adjustment, active)
SELECT 
  p.id,
  '9f3bbdf7-10e3-4be1-a589-597bf975d855', -- Material Tungstênio
  LPAD(s.size_num::text, 2, '0'),
  w.width,
  'Preto',
  w.price_adj,
  true
FROM product_ant110 p
CROSS JOIN sizes s
CROSS JOIN widths w;