-- Inserir os 3 produtos base
INSERT INTO public.products (name, description, sku, base_price, category_id, weight, active) VALUES
(
  'All my life – aliança de tungstênio magnetizado a ouro 18k, acabamento de alto brilho',
  E'Benefícios do tungstênio:\n• Hipoalérgica\n• Não amassa\n• Não enferruja\n• Resistente a riscos\n• O único metal que tem brilho eterno\n• 4x mais duro que o titânio, 10x mais duro que o ouro 18K\n\nMaterial: tungstênio, ouro 18k\nCor: ouro\nAnatômica\nLargura: 8mm\nTamanho: 8 – 36\nPeso: 5g à 18g\n*Valor unitário!',
  'ANT33',
  184.00,
  '24691d8d-562d-4012-9f0c-0821ff8887e2',
  0.012,
  true
),
(
  'All Of Me – aliança de tungstênio magnetizada a ouro 18k com swarovski',
  E'Benefícios do tungstênio:\n• Hipoalérgica\n• Não amassa\n• Não enferruja\n• Resistente a riscos\n• O único metal que tem brilho eterno\n• 4x mais duro que o titânio, 10x mais duro que o ouro 18K\n\nMaterial: Tungstênio, Ouro 18k\nCor: Ouro\nLargura: 4mm, 6mm, 8mm\nTamanho: 8 – 36\nPeso: 5g À 18g\nAnatômica\n*Valor Unitário',
  'ANT08',
  199.00,
  '24691d8d-562d-4012-9f0c-0821ff8887e2',
  0.012,
  true
),
(
  'All we need – luxuosa aliança de tungstênio com inlay de fibra',
  E'Benefícios do tungstênio:\n• Hipoalérgica\n• Não amassa\n• Não enferruja\n• Resistente a riscos\n• O único metal que tem brilho eterno\n• 4x mais duro que o titânio, 10x mais duro que o ouro 18K\n\nMaterial: tungstênio, titânio, fibra, resina\nAnatômica\nCor: preto, vermelho\nLargura: 8mm\nTamanho: 8 – 36\nPeso: 11g à 16g\n*Valor unitário',
  'ANT116',
  184.00,
  '24691d8d-562d-4012-9f0c-0821ff8887e2',
  0.015,
  true
);

-- Criar variantes para o produto "All my life" (29 variantes - tamanhos 8-36)
WITH product_ant33 AS (
  SELECT id FROM public.products WHERE sku = 'ANT33'
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
  SELECT id FROM public.products WHERE sku = 'ANT08'
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
  SELECT id FROM public.products WHERE sku = 'ANT116'
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
WHERE sku IN ('ANT33', 'ANT08', 'ANT116');