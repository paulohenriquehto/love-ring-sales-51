-- Primeiro, vamos verificar se já existem variantes para estes produtos e removê-las
DELETE FROM public.product_variants 
WHERE product_id IN (
  SELECT id FROM public.products 
  WHERE sku IN ('AF01-PERFEITO2', 'ANT14-THOUSAND', 'ANT110-AWAYFROMSUN')
);

-- Limpar configurações de gravação se existirem
DELETE FROM public.product_engraving_config
WHERE product_id IN (
  SELECT id FROM public.products 
  WHERE sku IN ('AF01-PERFEITO2', 'ANT14-THOUSAND', 'ANT110-AWAYFROMSUN')
);

-- Criar variantes para AF01 (21 variantes: tamanhos 8-28, cor dourado)
INSERT INTO public.product_variants (product_id, size, color, price_adjustment, active)
SELECT 
  p.id,
  LPAD(generate_series(8, 28)::text, 2, '0'),
  'Dourado',
  0,
  true
FROM public.products p
WHERE p.sku = 'AF01-PERFEITO2';

-- Configurar gravação para todos os produtos
INSERT INTO public.product_engraving_config (product_id, supports_engraving, max_characters, price_adjustment, available_fonts)
SELECT 
  id,
  true,
  CASE 
    WHEN sku = 'AF01-PERFEITO2' THEN 20 -- Anéis têm menor limite
    ELSE 30 -- Alianças têm limite padrão
  END,
  0,
  ARRAY['arial', 'poiret', 'josefin', 'cinzel', 'handlee', 'tangerine', 'reenie', 'annie']
FROM public.products 
WHERE sku IN ('AF01-PERFEITO2', 'ANT14-THOUSAND', 'ANT110-AWAYFROMSUN');