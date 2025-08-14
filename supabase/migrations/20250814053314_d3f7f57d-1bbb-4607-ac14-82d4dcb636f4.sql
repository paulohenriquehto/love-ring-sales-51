-- Criar o produto "Amor Perfeito – Anel De Prata 950 Com Deslumbrante Cristal De Swarovski"
INSERT INTO public.products (name, sku, description, base_price, category_id, weight, active)
VALUES (
  'Amor Perfeito – Anel De Prata 950 Com Deslumbrante Cristal De Swarovski',
  'ANPS224-PERFEITO',
  'Material: Prata 950, Swarovski
Cor: Prata, Preto
Tamanho: 8-28
Peso: 1g – 3g

Anel elegante de prata 950 com cristal Swarovski deslumbrante, disponível em cores prata e preto.',
  49.90,
  'f2f0b20f-c439-4b3e-86b4-172d9f35e5c0', -- Categoria Anéis
  0.002, -- Peso médio 2g
  true
);

-- Adicionar imagem do produto
INSERT INTO public.product_images (product_id, image_url, alt_text, is_primary, display_order)
SELECT 
  id,
  'https://inlovestore.com/wp-content/uploads/2024/04/gfugh.png',
  'Amor Perfeito – Anel De Prata 950 Com Deslumbrante Cristal De Swarovski',
  true,
  1
FROM public.products 
WHERE sku = 'ANPS224-PERFEITO';

-- Criar variantes para todos os tamanhos (8-28) e cores (Prata, Preto)
WITH product_anps224 AS (
  SELECT id FROM public.products WHERE sku = 'ANPS224-PERFEITO'
),
sizes AS (
  SELECT generate_series(8, 28) AS size_num
),
colors AS (
  SELECT color FROM (VALUES ('Prata'), ('Preto')) AS c(color)
)
INSERT INTO public.product_variants (product_id, size, color, price_adjustment, active)
SELECT 
  p.id,
  LPAD(s.size_num::text, 2, '0'),
  c.color,
  0,
  true
FROM product_anps224 p
CROSS JOIN sizes s
CROSS JOIN colors c;

-- Configurar gravação para o produto
INSERT INTO public.product_engraving_config (product_id, supports_engraving, max_characters, price_adjustment, available_fonts)
SELECT 
  id,
  true,
  20, -- Menor limite para anéis
  0,
  ARRAY['arial', 'poiret', 'josefin', 'cinzel', 'handlee', 'tangerine', 'reenie', 'annie']
FROM public.products 
WHERE sku = 'ANPS224-PERFEITO';