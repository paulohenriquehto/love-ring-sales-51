-- Unificar categorias de times: Times Brasileiros + Times Internacionais = Times
-- Fase 1: Renomear "Times Brasileiros" para "Times" e ajustar ordem
UPDATE public.engraving_categories 
SET 
  name = 'Times',
  sort_order = 2,
  updated_at = now()
WHERE name = 'Times Brasileiros';

-- Fase 2: Migrar todos os símbolos de "Times Internacionais" para a categoria "Times"
UPDATE public.engraving_symbols 
SET 
  category_id = (SELECT id FROM public.engraving_categories WHERE name = 'Times'),
  updated_at = now()
WHERE category_id = (SELECT id FROM public.engraving_categories WHERE name = 'Times Internacionais');

-- Fase 3: Desativar categoria "Times Internacionais" (manter para histórico)
UPDATE public.engraving_categories 
SET 
  active = false,
  updated_at = now()
WHERE name = 'Times Internacionais';

-- Verificar resultado: contar símbolos na categoria Times unificada
-- Deve ter 39 símbolos (19 brasileiros + 20 internacionais)