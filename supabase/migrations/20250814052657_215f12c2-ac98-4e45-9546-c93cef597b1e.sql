-- Criar os 3 produtos únicos com SKUs únicos
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
  'ALLMYLIFE-TNG-001',
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
  'ALLOFME-TNG-002',
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
  'ALLWENEED-TNG-003',
  184.00,
  (SELECT id FROM categories WHERE name = 'Alianças' LIMIT 1),
  true
);

-- Criar apenas algumas variantes de exemplo para cada produto (para evitar conflitos)
DO $$
DECLARE
  product1_id UUID;
  product2_id UUID;
  product3_id UUID;
  tungsten_material_id UUID;
BEGIN
  -- Obter IDs dos produtos
  SELECT id INTO product1_id FROM products WHERE sku = 'ALLMYLIFE-TNG-001';
  SELECT id INTO product2_id FROM products WHERE sku = 'ALLOFME-TNG-002';
  SELECT id INTO product3_id FROM products WHERE sku = 'ALLWENEED-TNG-003';
  
  -- Obter ID do material
  SELECT id INTO tungsten_material_id FROM materials WHERE name = 'Tungstênio';

  -- Produto 1: Algumas variantes de exemplo
  INSERT INTO product_variants (product_id, size, width, material_id, price_adjustment, active) VALUES 
  (product1_id, '08', '8mm', tungsten_material_id, 0, true),
  (product1_id, '10', '8mm', tungsten_material_id, 0, true),
  (product1_id, '12', '8mm', tungsten_material_id, 0, true);

  -- Produto 2: Variantes com diferentes larguras
  INSERT INTO product_variants (product_id, size, width, material_id, price_adjustment, active) VALUES 
  (product2_id, '08', '4mm', tungsten_material_id, 0, true),
  (product2_id, '08', '6mm', tungsten_material_id, 10, true),
  (product2_id, '08', '8mm', tungsten_material_id, 20, true);

  -- Produto 3: Variantes com diferentes cores
  INSERT INTO product_variants (product_id, size, width, color, material_id, price_adjustment, active) VALUES 
  (product3_id, '08', '8mm', 'Preto', tungsten_material_id, 0, true),
  (product3_id, '08', '8mm', 'Vermelho', tungsten_material_id, 0, true);

  -- Configurações de gravação
  INSERT INTO product_engraving_config (product_id, supports_engraving, max_characters, price_adjustment) VALUES 
  (product1_id, true, 30, 0),
  (product2_id, true, 30, 0),
  (product3_id, true, 30, 0);

END $$;