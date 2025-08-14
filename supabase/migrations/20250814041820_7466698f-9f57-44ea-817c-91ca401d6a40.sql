-- Limpeza completa de todos os produtos e dados relacionados
-- Executando na ordem correta para evitar erros de foreign key

-- Fase 1: Remover itens de pedidos que referenciam produtos
DELETE FROM public.order_items;

-- Fase 2: Remover itens de solicitações que referenciam produtos
DELETE FROM public.request_items;

-- Fase 3: Remover movimentações de estoque
DELETE FROM public.stock_movements;

-- Fase 4: Remover registros de inventário
DELETE FROM public.inventory;

-- Fase 5: Remover imagens dos produtos
DELETE FROM public.product_images;

-- Fase 6: Remover configurações de gravação
DELETE FROM public.product_engraving_config;

-- Fase 7: Remover variantes dos produtos
DELETE FROM public.product_variants;

-- Fase 8: Remover produtos principais
DELETE FROM public.products;

-- Log de conclusão
SELECT 
  'Limpeza completa realizada' as status,
  (SELECT COUNT(*) FROM public.products) as produtos_restantes,
  (SELECT COUNT(*) FROM public.product_variants) as variantes_restantes,
  (SELECT COUNT(*) FROM public.product_images) as imagens_restantes,
  (SELECT COUNT(*) FROM public.inventory) as inventario_restante;