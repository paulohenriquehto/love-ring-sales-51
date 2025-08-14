-- Inserir novos produtos de anéis e alianças
INSERT INTO public.products (
  name, 
  description, 
  sku, 
  base_price, 
  category_id, 
  weight, 
  active
) VALUES
-- Produto 1: Administração ANF25*-2
(
  'Administração – anel de formatura magnetizada titânio com inlay de fibra',
  'A Administração É A Área Da Ciência Responsável Por Gerir Os Recursos Humanos E Materiais Da Empresa Para Extrair O Maior Valor De Cada Um Deles. Para Isso, Há Quatro Funções Administrativas: Planejar, Organizar, Dirigir E Controlar.

Material: Tungstênio, Titânio
Cor: Preto
Largura: 8mm
Tamanho: 8 – 36
Peso: 12g À 18g
Anatômico',
  'ANF25*-2',
  399.00,
  '190f6a71-2265-4515-876a-28a7f26b190c', -- Anéis de Formatura
  0.015,
  true
),
-- Produto 2: Administração Anf12
(
  'Administração – anel de tungstênio magnetizado a ouro 18k com acabamento de alto brilho',
  'A Administração É A Área Da Ciência Responsável Por Gerir Os Recursos Humanos E Materiais Da Empresa Para Extrair O Maior Valor De Cada Um Deles. Para Isso, Há Quatro Funções Administrativas: Planejar, Organizar, Dirigir E Controlar.

Material: Tungstênio, Ouro
Cor: Preto
Largura: 8mm
Tamanho: 8 – 36
Peso: 12g À 18g',
  'Anf12*',
  209.00,
  '190f6a71-2265-4515-876a-28a7f26b190c', -- Anéis de Formatura
  0.015,
  true
),
-- Produto 3: Administração ANF11
(
  'Administração – anel de tungstênio magnetizado a titânio com acabamento fosco',
  'A Administração É A Área Da Ciência Responsável Por Gerir Os Recursos Humanos E Materiais Da Empresa Para Extrair O Maior Valor De Cada Um Deles. Para Isso, Há Quatro Funções Administrativas: Planejar, Organizar, Dirigir E Controlar.

Material: Tungstênio, Titânio
Cor: Preto
Largura: 8mm
Tamanho: 8 – 36
Peso: 12g À 18g
Anatômico',
  'ANF11*',
  209.00,
  '190f6a71-2265-4515-876a-28a7f26b190c', -- Anéis de Formatura
  0.015,
  true
),
-- Produto 4: All About Lovin You ANt36*-1
(
  'All About Lovin You – Aliança De Tungstênio Magnetizado A Ouro 18k Com Acabamento Em Alto Brilho',
  'Benefícios do tungstênio:
• Hipoalérgica
• Não amassa
• Não enferruja
• Resistente a riscos
• O único metal que tem brilho eterno
• 4x mais duro que o titânio, 10x mais duro que o ouro 18K

Especificações:
• Material: Tungstênio, Ouro 18k
• Cor: Ouro
• Anatômica
• Largura: 6mm
• Tamanho: 8 – 36
• Peso: 14g à 19g',
  'ANt36*-1',
  199.00,
  '24691d8d-562d-4012-9f0c-0821ff8887e2', -- Alianças
  0.016,
  true
),
-- Produto 5: All About Us ANT115**
(
  'All About Us – Aliança de tungstênio magnetizado a titânio com acabamento em alto brilho',
  'Benefícios do tungstênio:
• Hipoalérgica
• Não amassa
• Não enferruja
• Resistente a riscos
• O único metal que tem brilho eterno
• 4x mais duro que o titânio, 10x mais duro que o ouro 18K

Especificações:
• Material: Tungstênio, Titânio
• Cor: Preto
• Anatômica
• Largura: 8mm
• Tamanho: 8 – 36
• Peso: 5g à 18g',
  'ANT115**',
  174.00,
  '24691d8d-562d-4012-9f0c-0821ff8887e2', -- Alianças
  0.012,
  true
),
-- Produto 6: All I Have ANT39
(
  'All I Have – Aliança de tungstênio com acabamento em brilho',
  'Benefícios do tungstênio:
• Hipoalérgica
• Não amassa
• Não enferruja
• Resistente a riscos
• O único metal que tem brilho eterno
• 4x mais duro que o titânio, 10x mais duro que o ouro 18K

Especificações:
• Material: Tungstênio, Ouro 18k
• Cor: Ouro
• Anatômica
• Largura: 9mm
• Tamanho: 8 – 36
• Peso: 5g à 18g',
  'ANT39*',
  189.00,
  '24691d8d-562d-4012-9f0c-0821ff8887e2', -- Alianças
  0.012,
  true
);