-- Criar o produto "Love me harder - aliança de tungstênio com acabamento de alto brilho e inlay black"
INSERT INTO public.products (name, sku, description, base_price, category_id, weight, active)
VALUES (
  'Love me harder – aliança de tungstênio com acabamento de alto brilho e inlay black',
  'ANT149-HARDER',
  'Benefícios do tungstênio:
• Hipoalérgica
• Não amassa
• Não enferruja
• Resistente a riscos
• O único metal que tem brilho eterno
• 4x mais duro que o titânio, 10x mais duro que o ouro 18K

Material: tungstênio
Cor: prata
Anatômica
Largura: 8mm
Tamanho: 8 – 36
Peso: 5g à 18g
*Valor unitário',
  169.00,
  '24691d8d-562d-4012-9f0c-0821ff8887e2', -- Categoria Alianças
  0.012, -- Peso médio 12g
  true
);

-- Adicionar imagem do produto
INSERT INTO public.product_images (product_id, image_url, alt_text, is_primary, display_order)
SELECT 
  id,
  'https://inlovestore.com/wp-content/uploads/2024/02/ant149.png',
  'Love me harder – aliança de tungstênio com acabamento de alto brilho e inlay black',
  true,
  1
FROM public.products 
WHERE sku = 'ANT149-HARDER';

-- Criar 29 variantes para todos os tamanhos (08-36)
WITH product_ant149 AS (
  SELECT id FROM public.products WHERE sku = 'ANT149-HARDER'
),
sizes AS (
  SELECT generate_series(8, 36) AS size_num
)
INSERT INTO public.product_variants (product_id, material_id, size, width, color, price_adjustment, active)
SELECT 
  p.id,
  '9f3bbdf7-10e3-4be1-a589-597bf975d855', -- Material Tungstênio
  LPAD(s.size_num::text, 2, '0'),
  '8mm',
  'Prata',
  0,
  true
FROM product_ant149 p
CROSS JOIN sizes s;

-- Configurar gravação para o produto
INSERT INTO public.product_engraving_config (product_id, supports_engraving, max_characters, price_adjustment, available_fonts)
SELECT 
  id,
  true,
  30,
  0,
  ARRAY['arial', 'poiret', 'josefin', 'cinzel', 'handlee', 'tangerine', 'reenie', 'annie']
FROM public.products 
WHERE sku = 'ANT149-HARDER';