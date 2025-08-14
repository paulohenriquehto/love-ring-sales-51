-- Produto 1: AF01 - Amor perfeito 2 – Anel Folheado à Ouro 18K com Cristal Swarovski
INSERT INTO public.products (name, sku, description, base_price, category_id, weight, active)
VALUES (
  'Amor perfeito 2 – Anel Folheado à Ouro 18K com Cristal Swarovski',
  'AF01-PERFEITO2',
  'Material: Banhado a ouro 18k, Swarovski
Cor: Dourado
Tamanho: 8-28
Peso: 1g – 3g

Anel elegante folheado a ouro 18k com cristal Swarovski deslumbrante.',
  49.90,
  'f2f0b20f-c439-4b3e-86b4-172d9f35e5c0', -- Categoria Anéis
  0.002, -- Peso médio 2g
  true
);

-- Produto 2: ANT14 - A Thousand Years – Aliança De Tungstênio Magnetizada A Ouro 18k
INSERT INTO public.products (name, sku, description, base_price, category_id, weight, active)
VALUES (
  'A Thousand Years – Aliança De Tungstênio Magnetizada A Ouro 18k',
  'ANT14-THOUSAND',
  'Benefícios do tungstênio:
• Hipoalérgica
• Não amassa
• Não enferruja
• Resistente à riscos
• O único metal que tem brilho eterno
• 4x mais duro que o titânio, 10x mais duro que o ouro 18K

Material: tungstênio, ouro rose, ouro 18k
Cor: ouro, rose
Anatômica
Largura: 6mm, 8mm
Tamanho: 8 – 36
Peso: 5g à 18g
*valor unitário',
  184.00,
  '24691d8d-562d-4012-9f0c-0821ff8887e2', -- Categoria Alianças
  0.012, -- Peso médio 12g
  true
);

-- Produto 3: ANT110 - Away From The Sun – Aliança De Tungstênio Com Acabamento De Alto Brilho
INSERT INTO public.products (name, sku, description, base_price, category_id, weight, active)
VALUES (
  'Away From The Sun – Aliança De Tungstênio Com Acabamento De Alto Brilho',
  'ANT110-AWAYFROMSUN',
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
Largura: 4mm, 6mm, 8mm
Tamanho: 8 – 36
Peso: 5g à 18g
*Valor unitário',
  154.00,
  '24691d8d-562d-4012-9f0c-0821ff8887e2', -- Categoria Alianças
  0.012, -- Peso médio 12g
  true
);

-- Adicionar imagens dos produtos
INSERT INTO public.product_images (product_id, image_url, alt_text, is_primary, display_order)
SELECT 
  id,
  'https://inlovestore.com/wp-content/uploads/2024/04/af01.png',
  'Amor perfeito 2 – Anel Folheado à Ouro 18K com Cristal Swarovski',
  true,
  1
FROM public.products 
WHERE sku = 'AF01-PERFEITO2'

UNION ALL

SELECT 
  id,
  'https://inlovestore.com/wp-content/uploads/2024/06/ANT14.png',
  'A Thousand Years – Aliança De Tungstênio Magnetizada A Ouro 18k',
  true,
  1
FROM public.products 
WHERE sku = 'ANT14-THOUSAND'

UNION ALL

SELECT 
  id,
  'https://inlovestore.com/wp-content/uploads/2024/02/ant110.png',
  'Away From The Sun – Aliança De Tungstênio Com Acabamento De Alto Brilho',
  true,
  1
FROM public.products 
WHERE sku = 'ANT110-AWAYFROMSUN';