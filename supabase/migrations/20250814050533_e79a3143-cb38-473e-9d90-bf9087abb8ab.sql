-- Inserir os 2 produtos faltantes
INSERT INTO public.products (
  name, 
  description, 
  sku, 
  base_price, 
  category_id, 
  weight, 
  active
) VALUES
-- Produto 7: Administração com inlay de fibra a ouro
(
  'Administração – anel de formatura magnetizada a ouro com inlay de fibra',
  'A Administração É A Área Da Ciência Responsável Por Gerir Os Recursos Humanos E Materiais Da Empresa Para Extrair O Maior Valor De Cada Um Deles. Para Isso, Há Quatro Funções Administrativas: Planejar, Organizar, Dirigir E Controlar.

Material: Tungstênio, Ouro
Cor: Ouro
Largura: 8mm
Tamanho: 8 – 36
Peso: 12g À 18g
Anatômico',
  'ANF24*-1',
  450.00,
  '190f6a71-2265-4515-876a-28a7f26b190c', -- Anéis de Formatura
  0.015,
  true
),
-- Produto 8: A Thing About You
(
  'A Thing About You – Aliança De Tungstênio Magnetizada A Ouro 18k Com Acabamento Fosco E Azul',
  'Benefícios do tungstênio:
• Hipoalérgica
• Não amassa
• Não enferruja
• Resistente a riscos
• O único metal que tem brilho eterno
• 4x mais duro que o titânio, 10x mais duro que o ouro 18K

Especificações:
• Material: Tungstênio, Ouro 18k
• Cor: Azul
• Anatômica
• Largura: 8mm
• Tamanho: 8 – 36
• Peso: 5g à 18g',
  'ANT40*',
  184.00,
  '24691d8d-562d-4012-9f0c-0821ff8887e2', -- Alianças
  0.012,
  true
);

-- Criar variantes de tamanho para todos os produtos (08-36)
-- Primeiro, vamos buscar os IDs dos produtos inseridos

-- Criar variantes para ANF25*-2 (8mm)
INSERT INTO public.product_variants (product_id, size, width, color, price_adjustment, active)
SELECT 
  p.id,
  size_value,
  '8mm',
  'Preto',
  0,
  true
FROM public.products p
CROSS JOIN (
  SELECT unnest(ARRAY['08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36']) as size_value
) sizes
WHERE p.sku = 'ANF25*-2';

-- Criar variantes para Anf12* (8mm)
INSERT INTO public.product_variants (product_id, size, width, color, price_adjustment, active)
SELECT 
  p.id,
  size_value,
  '8mm',
  'Preto',
  0,
  true
FROM public.products p
CROSS JOIN (
  SELECT unnest(ARRAY['08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36']) as size_value
) sizes
WHERE p.sku = 'Anf12*';

-- Criar variantes para ANF11* (8mm)
INSERT INTO public.product_variants (product_id, size, width, color, price_adjustment, active)
SELECT 
  p.id,
  size_value,
  '8mm',
  'Preto',
  0,
  true
FROM public.products p
CROSS JOIN (
  SELECT unnest(ARRAY['08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36']) as size_value
) sizes
WHERE p.sku = 'ANF11*';

-- Criar variantes para ANt36*-1 (6mm)
INSERT INTO public.product_variants (product_id, size, width, color, price_adjustment, active)
SELECT 
  p.id,
  size_value,
  '6mm',
  'Ouro',
  0,
  true
FROM public.products p
CROSS JOIN (
  SELECT unnest(ARRAY['08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36']) as size_value
) sizes
WHERE p.sku = 'ANt36*-1';

-- Criar variantes para ANT115** (8mm)
INSERT INTO public.product_variants (product_id, size, width, color, price_adjustment, active)
SELECT 
  p.id,
  size_value,
  '8mm',
  'Preto',
  0,
  true
FROM public.products p
CROSS JOIN (
  SELECT unnest(ARRAY['08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36']) as size_value
) sizes
WHERE p.sku = 'ANT115**';

-- Criar variantes para ANT39* (9mm)
INSERT INTO public.product_variants (product_id, size, width, color, price_adjustment, active)
SELECT 
  p.id,
  size_value,
  '9mm',
  'Ouro',
  0,
  true
FROM public.products p
CROSS JOIN (
  SELECT unnest(ARRAY['08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36']) as size_value
) sizes
WHERE p.sku = 'ANT39*';

-- Criar variantes para ANF24*-1 (8mm)
INSERT INTO public.product_variants (product_id, size, width, color, price_adjustment, active)
SELECT 
  p.id,
  size_value,
  '8mm',
  'Ouro',
  0,
  true
FROM public.products p
CROSS JOIN (
  SELECT unnest(ARRAY['08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36']) as size_value
) sizes
WHERE p.sku = 'ANF24*-1';

-- Criar variantes para ANT40* (8mm)
INSERT INTO public.product_variants (product_id, size, width, color, price_adjustment, active)
SELECT 
  p.id,
  size_value,
  '8mm',
  'Azul',
  0,
  true
FROM public.products p
CROSS JOIN (
  SELECT unnest(ARRAY['08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36']) as size_value
) sizes
WHERE p.sku = 'ANT40*';