-- Criar os 3 produtos únicos
INSERT INTO public.products (
  name,
  description,
  sku,
  base_price,
  category_id,
  active
) VALUES 
(
  'All my life – aliança de tungstênio magnetizado a ouro 18k, acabamento de alto brilho',
  'Benefícios do tungstênio:
• Hipoalérgica
• Não amassa
• Não enferruja
• Resistente a riscos
• O único metal que tem brilho eterno
• 4x mais duro que o titânio, 10x mais duro que o ouro 18K

Material: tungstênio, ouro 18k
Cor: ouro
Anatômica
Largura: 8mm
Tamanho: 8 – 36
Peso: 5g à 18g
*Valor unitário!',
  'ALV001',
  184.00,
  (SELECT id FROM categories WHERE name = 'Alianças' LIMIT 1),
  true
),
(
  'All Of Me – aliança de tungstênio magnetizada a ouro 18k com swarovski',
  'Benefícios do tungstênio:
• Hipoalérgica
• Não amassa
• Não enferruja
• Resistente a riscos
• O único metal que tem brilho eterno
• 4x mais duro que o titânio, 10x mais duro que o ouro 18K

Material: Tungstênio, Ouro 18k
Cor: Ouro
Largura: 4mm, 6mm, 8mm
Tamanho: 8 – 36
Peso: 5g À 18g
Anatômica
*Valor Unitário',
  'ALV002',
  199.00,
  (SELECT id FROM categories WHERE name = 'Alianças' LIMIT 1),
  true
),
(
  'All we need – luxuosa aliança de tungstênio com inlay de fibra',
  'Benefícios do tungstênio:
• Hipoalérgica
• Não amassa
• Não enferruja
• Resistente a riscos
• O único metal que tem brilho eterno
• 4x mais duro que o titânio, 10x mais duro que o ouro 18K

Material: tungstênio, titânio, fibra, resina
Anatômica
Cor: preto, vermelho
Largura: 8mm
Tamanho: 8 – 36
Peso: 11g à 16g
*Valor unitário',
  'ALV003',
  184.00,
  (SELECT id FROM categories WHERE name = 'Alianças' LIMIT 1),
  true
);