-- Remove produtos duplicados e extras identificados
-- Desativar produtos duplicados: Anf24*-1-1, ANF24*-1-1 e ANT437*

UPDATE public.products 
SET active = false, updated_at = now()
WHERE name IN ('Anf24*-1-1', 'ANF24*-1-1', 'ANT437*');

-- Desativar variantes associadas aos produtos duplicados
UPDATE public.product_variants 
SET active = false, updated_at = now()
WHERE product_id IN (
  SELECT id FROM public.products 
  WHERE name IN ('Anf24*-1-1', 'ANF24*-1-1', 'ANT437*')
);

-- Opcional: Limpar imagens dos produtos duplicados
UPDATE public.product_images
SET created_at = now() -- Manter as imagens mas marcar para possível limpeza futura
WHERE product_id IN (
  SELECT id FROM public.products 
  WHERE name IN ('Anf24*-1-1', 'ANF24*-1-1', 'ANT437*')
);