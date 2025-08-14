-- Inserir categoria para anéis de formatura se não existir
INSERT INTO public.categories (name, description, active)
VALUES ('Anéis de Formatura', 'Anéis personalizados para formatura em diversas áreas', true)
ON CONFLICT DO NOTHING;

-- Inserir material de tungstênio se não existir
INSERT INTO public.materials (name, description, price_multiplier, active)
VALUES ('Tungstênio', 'Metal hipoalergênico, resistente a riscos e com brilho eterno', 1.00, true)
ON CONFLICT DO NOTHING;

-- Inserir Produto 1: A Thing About You
INSERT INTO public.products (
  name,
  description,
  sku,
  base_price,
  weight,
  active,
  category_id
) VALUES (
  'A Thing About You – Aliança De Tungstênio Magnetizada A Ouro 18k Com Acabamento Fosco E Azul',
  'Benefícios do tungstênio: Hipoalergênica, Não amassa, Não enferruja, Resistente a riscos, O único metal que tem brilho eterno, 4x mais duro que o titânio, 10x mais duro que o ouro 18K. Material: tungstênio, ouro 18k. Cor: ouro. Anatômica. Largura: 8mm. Peso: 5g à 18g.',
  'ANT37',
  184.00,
  0.012,
  true,
  (SELECT id FROM public.categories WHERE name = 'Anéis' LIMIT 1)
);

-- Inserir Produto 2: Administração
INSERT INTO public.products (
  name,
  description,
  sku,
  base_price,
  weight,
  active,
  category_id
) VALUES (
  'Administração – anel de formatura magnetizada a ouro com inlay de fibra',
  'A Administração É A Área Da Ciência Responsável Por Gerir Os Recursos Humanos E Materiais Da Empresa Para Extrair O Maior Valor De Cada Um Deles. Para Isso, Há Quatro Funções Administrativas: Planejar, Organizar, Dirigir E Controlar. Material: Tungstênio, Ouro. Cor: Preto. Largura: 8mm. Peso: 12g À 18g. Anatômico',
  'ANF24',
  450.00,
  0.015,
  true,
  (SELECT id FROM public.categories WHERE name = 'Anéis de Formatura' LIMIT 1)
);

-- Configurar personalização para ambos os produtos
DO $$
DECLARE
  ant37_id UUID;
  anf24_id UUID;
BEGIN
  -- Obter IDs dos produtos
  SELECT id INTO ant37_id FROM public.products WHERE sku = 'ANT37';
  SELECT id INTO anf24_id FROM public.products WHERE sku = 'ANF24';
  
  -- Configurar personalização para ANT37
  IF ant37_id IS NOT NULL THEN
    INSERT INTO public.product_engraving_config (
      product_id,
      supports_engraving,
      max_characters,
      price_adjustment,
      available_fonts
    ) VALUES (
      ant37_id,
      true,
      30,
      15.00,
      ARRAY['arial', 'poiret', 'josefin', 'cinzel', 'handlee', 'tangerine', 'reenie', 'annie']
    );
    
    -- Inserir imagem para ANT37
    INSERT INTO public.product_images (
      product_id,
      image_url,
      is_primary,
      display_order,
      alt_text
    ) VALUES (
      ant37_id,
      'https://fvjowvxlqqmvwkqqqxsb.supabase.co/storage/v1/object/public/product-images/ant37-tungsten-ring.jpg',
      true,
      0,
      'A Thing About You - Aliança de tungstênio magnetizada a ouro 18k com acabamento fosco e azul'
    );
  END IF;
  
  -- Configurar personalização para ANF24
  IF anf24_id IS NOT NULL THEN
    INSERT INTO public.product_engraving_config (
      product_id,
      supports_engraving,
      max_characters,
      price_adjustment,
      available_fonts
    ) VALUES (
      anf24_id,
      true,
      30,
      20.00,
      ARRAY['arial', 'poiret', 'josefin', 'cinzel', 'handlee', 'tangerine', 'reenie', 'annie']
    );
    
    -- Inserir imagem para ANF24
    INSERT INTO public.product_images (
      product_id,
      image_url,
      is_primary,
      display_order,
      alt_text
    ) VALUES (
      anf24_id,
      'https://fvjowvxlqqmvwkqqqxsb.supabase.co/storage/v1/object/public/product-images/anf24-graduation-ring.jpg',
      true,
      0,
      'Administração - anel de formatura magnetizada a ouro com inlay de fibra'
    );
  END IF;
END $$;