-- Criar variantes para o produto "All my life" (29 variantes - tamanhos 8-36)
WITH product_ant33 AS (
  SELECT id FROM public.products WHERE sku = 'ANT33-LIFE'
),
sizes AS (
  SELECT generate_series(8, 36) AS size_num
)
INSERT INTO public.product_variants (product_id, material_id, size, width, price_adjustment, active)
SELECT 
  p.id,
  '9f3bbdf7-10e3-4be1-a589-597bf975d855', -- Material Tungstênio
  LPAD(s.size_num::text, 2, '0'),
  '8mm',
  0,
  true
FROM product_ant33 p
CROSS JOIN sizes s;

-- Criar variantes para o produto "All Of Me" (87 variantes - 29 tamanhos x 3 larguras)
WITH product_ant08 AS (
  SELECT id FROM public.products WHERE sku = 'ANT08-OFME'
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
INSERT INTO public.product_variants (product_id, material_id, size, width, price_adjustment, active)
SELECT 
  p.id,
  '9f3bbdf7-10e3-4be1-a589-597bf975d855', -- Material Tungstênio
  LPAD(s.size_num::text, 2, '0'),
  w.width,
  w.price_adj,
  true
FROM product_ant08 p
CROSS JOIN sizes s
CROSS JOIN widths w;

-- Criar variantes para o produto "All we need" (58 variantes - 29 tamanhos x 2 cores)
WITH product_ant116 AS (
  SELECT id FROM public.products WHERE sku = 'ANT116-NEED'
),
sizes AS (
  SELECT generate_series(8, 36) AS size_num
),
colors AS (
  SELECT color FROM (VALUES ('Preto'), ('Vermelho')) AS c(color)
)
INSERT INTO public.product_variants (product_id, material_id, size, width, color, price_adjustment, active)
SELECT 
  p.id,
  '9f3bbdf7-10e3-4be1-a589-597bf975d855', -- Material Tungstênio
  LPAD(s.size_num::text, 2, '0'),
  '8mm',
  c.color,
  0,
  true
FROM product_ant116 p
CROSS JOIN sizes s
CROSS JOIN colors c;

-- Configurar gravação para todos os 3 produtos
INSERT INTO public.product_engraving_config (product_id, supports_engraving, max_characters, price_adjustment, available_fonts)
SELECT 
  id,
  true,
  30,
  0,
  ARRAY['arial', 'poiret', 'josefin', 'cinzel', 'handlee', 'tangerine', 'reenie', 'annie']
FROM public.products 
WHERE sku IN ('ANT33-LIFE', 'ANT08-OFME', 'ANT116-NEED');