-- Criar material Tungstênio se não existir
INSERT INTO public.materials (name, description, price_multiplier, active)
VALUES (
  'Tungstênio',
  'Metal extremamente resistente, ideal para alianças duráveis com acabamento premium',
  1.5,
  true
)
ON CONFLICT (name) DO NOTHING;

-- Criar categoria se não existir
INSERT INTO public.categories (name, description, active)
VALUES (
  'Alianças',
  'Alianças e anéis de compromisso',
  true
)
ON CONFLICT (name) DO NOTHING;

-- Criar o produto principal
INSERT INTO public.products (
  name,
  description,
  base_price,
  category_id,
  active,
  sku
) VALUES (
  'A Certain Romance - Aliança De Tungstênio Com Acabamento Fosco e Dourado',
  'Aliança de tungstênio com acabamento fosco e detalhes dourados. Material extremamente resistente a riscos e corrosão, ideal para uso diário. Design moderno e elegante que combina durabilidade com sofisticação.',
  179.00,
  (SELECT id FROM public.categories WHERE name = 'Alianças' LIMIT 1),
  true,
  'ACR-TUNGST-001'
);

-- Obter o ID do produto criado para criar as variantes
DO $$
DECLARE
  product_uuid UUID;
  material_uuid UUID;
  size_number INTEGER;
BEGIN
  -- Obter IDs necessários
  SELECT id INTO product_uuid FROM public.products WHERE sku = 'ACR-TUNGST-001';
  SELECT id INTO material_uuid FROM public.materials WHERE name = 'Tungstênio';
  
  -- Criar variantes para todos os tamanhos (08 a 36)
  FOR size_number IN 8..36 LOOP
    INSERT INTO public.product_variants (
      product_id,
      material_id,
      size,
      width,
      price_adjustment,
      active
    ) VALUES (
      product_uuid,
      material_uuid,
      LPAD(size_number::TEXT, 2, '0'), -- Formatar como "08", "09", etc.
      '8mm',
      0, -- Sem ajuste de preço
      true
    );
  END LOOP;
  
  -- Criar configuração de gravação
  INSERT INTO public.product_engraving_config (
    product_id,
    supports_engraving,
    max_characters,
    price_adjustment,
    available_fonts
  ) VALUES (
    product_uuid,
    true,
    30,
    20.00,
    ARRAY['arial', 'poiret', 'josefin', 'cinzel', 'handlee', 'tangerine', 'reenie', 'annie']
  );
END $$;