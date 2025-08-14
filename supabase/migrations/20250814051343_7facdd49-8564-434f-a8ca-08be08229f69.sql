-- Remove produtos duplicados identificados na verificação
-- Desativar produtos duplicados: Anf24*-1-1 e ANF24*-1-1

UPDATE public.products 
SET active = false, updated_at = now()
WHERE name IN ('Anf24*-1-1', 'ANF24*-1-1');

-- Desativar variantes associadas aos produtos duplicados
UPDATE public.product_variants 
SET active = false, updated_at = now()
WHERE product_id IN (
  SELECT id FROM public.products 
  WHERE name IN ('Anf24*-1-1', 'ANF24*-1-1')
);