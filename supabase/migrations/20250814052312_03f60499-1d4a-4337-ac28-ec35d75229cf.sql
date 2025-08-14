-- Inserir os 3 produtos base
INSERT INTO public.products (
  id,
  name,
  description,
  sku,
  base_price,
  category_id,
  active,
  created_at,
  updated_at
) VALUES 
(
  gen_random_uuid(),
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
  'ANT33',
  184.00,
  (SELECT id FROM categories WHERE name = 'Alianças' LIMIT 1),
  true,
  now(),
  now()
),
(
  gen_random_uuid(),
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
  'ANT08',
  199.00,
  (SELECT id FROM categories WHERE name = 'Alianças' LIMIT 1),
  true,
  now(),
  now()
),
(
  gen_random_uuid(),
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
  'ANT116',
  184.00,
  (SELECT id FROM categories WHERE name = 'Alianças' LIMIT 1),
  true,
  now(),
  now()
);

-- Variáveis para armazenar os IDs dos produtos
DO $$
DECLARE
  product1_id UUID;
  product2_id UUID;
  product3_id UUID;
  tungsten_material_id UUID;
  size_num INTEGER;
BEGIN
  -- Obter IDs dos produtos criados
  SELECT id INTO product1_id FROM products WHERE sku = 'ANT33';
  SELECT id INTO product2_id FROM products WHERE sku = 'ANT08';
  SELECT id INTO product3_id FROM products WHERE sku = 'ANT116';
  
  -- Obter ID do material tungstênio
  SELECT id INTO tungsten_material_id FROM materials WHERE name = 'Tungstênio';

  -- Criar variantes para Produto 1 (ANT33) - 29 variantes (tamanhos 8-36, largura 8mm)
  FOR size_num IN 8..36 LOOP
    INSERT INTO product_variants (
      product_id,
      size,
      width,
      material_id,
      price_adjustment,
      active
    ) VALUES (
      product1_id,
      LPAD(size_num::text, 2, '0'),
      '8mm',
      tungsten_material_id,
      0,
      true
    );
  END LOOP;

  -- Criar variantes para Produto 2 (ANT08) - 87 variantes (tamanhos 8-36 x larguras 4mm, 6mm, 8mm)
  FOR size_num IN 8..36 LOOP
    -- Largura 4mm (preço base)
    INSERT INTO product_variants (
      product_id,
      size,
      width,
      material_id,
      price_adjustment,
      active
    ) VALUES (
      product2_id,
      LPAD(size_num::text, 2, '0'),
      '4mm',
      tungsten_material_id,
      0,
      true
    );
    
    -- Largura 6mm (+R$ 10)
    INSERT INTO product_variants (
      product_id,
      size,
      width,
      material_id,
      price_adjustment,
      active
    ) VALUES (
      product2_id,
      LPAD(size_num::text, 2, '0'),
      '6mm',
      tungsten_material_id,
      10.00,
      true
    );
    
    -- Largura 8mm (+R$ 20)
    INSERT INTO product_variants (
      product_id,
      size,
      width,
      material_id,
      price_adjustment,
      active
    ) VALUES (
      product2_id,
      LPAD(size_num::text, 2, '0'),
      '8mm',
      tungsten_material_id,
      20.00,
      true
    );
  END LOOP;

  -- Criar variantes para Produto 3 (ANT116) - 58 variantes (tamanhos 8-36 x cores preto, vermelho)
  FOR size_num IN 8..36 LOOP
    -- Cor preta
    INSERT INTO product_variants (
      product_id,
      size,
      width,
      color,
      material_id,
      price_adjustment,
      active
    ) VALUES (
      product3_id,
      LPAD(size_num::text, 2, '0'),
      '8mm',
      'Preto',
      tungsten_material_id,
      0,
      true
    );
    
    -- Cor vermelha
    INSERT INTO product_variants (
      product_id,
      size,
      width,
      color,
      material_id,
      price_adjustment,
      active
    ) VALUES (
      product3_id,
      LPAD(size_num::text, 2, '0'),
      '8mm',
      'Vermelho',
      tungsten_material_id,
      0,
      true
    );
  END LOOP;

  -- Configurar gravação para os 3 produtos
  INSERT INTO product_engraving_config (
    product_id,
    supports_engraving,
    max_characters,
    price_adjustment,
    available_fonts
  ) VALUES 
  (
    product1_id,
    true,
    30,
    0,
    ARRAY['arial', 'poiret', 'josefin', 'cinzel', 'handlee', 'tangerine', 'reenie', 'annie']
  ),
  (
    product2_id,
    true,
    30,
    0,
    ARRAY['arial', 'poiret', 'josefin', 'cinzel', 'handlee', 'tangerine', 'reenie', 'annie']
  ),
  (
    product3_id,
    true,
    30,
    0,
    ARRAY['arial', 'poiret', 'josefin', 'cinzel', 'handlee', 'tangerine', 'reenie', 'annie']
  );

END $$;