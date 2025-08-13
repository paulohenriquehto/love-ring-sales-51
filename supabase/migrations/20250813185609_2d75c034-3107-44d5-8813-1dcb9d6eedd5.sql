-- Inserir alguns produtos de exemplo para testar o sistema

-- Buscar IDs das categorias e materiais
DO $$
DECLARE
  cat_aneis_id UUID;
  cat_colares_id UUID;
  cat_brincos_id UUID;
  mat_ouro_id UUID;
  mat_prata_id UUID;
  mat_titanio_id UUID;
  supplier_id UUID;
  warehouse_id UUID;
  product_id1 UUID;
  product_id2 UUID;
  product_id3 UUID;
BEGIN
  -- Obter IDs das categorias
  SELECT id INTO cat_aneis_id FROM public.categories WHERE name = 'Anéis' LIMIT 1;
  SELECT id INTO cat_colares_id FROM public.categories WHERE name = 'Colares' LIMIT 1;
  SELECT id INTO cat_brincos_id FROM public.categories WHERE name = 'Brincos' LIMIT 1;
  
  -- Obter IDs dos materiais
  SELECT id INTO mat_ouro_id FROM public.materials WHERE name = 'Ouro 18k' LIMIT 1;
  SELECT id INTO mat_prata_id FROM public.materials WHERE name = 'Prata 925' LIMIT 1;
  SELECT id INTO mat_titanio_id FROM public.materials WHERE name = 'Titânio' LIMIT 1;
  
  -- Obter fornecedor
  SELECT id INTO supplier_id FROM public.suppliers LIMIT 1;
  
  -- Obter armazém
  SELECT id INTO warehouse_id FROM public.warehouses LIMIT 1;
  
  -- Inserir produtos de exemplo
  INSERT INTO public.products (name, description, sku, category_id, base_price, weight, supplier_id, active)
  VALUES 
    ('Aliança Clássica', 'Aliança tradicional em ouro 18k', 'ALI-001', cat_aneis_id, 850.00, 5.2, supplier_id, true),
    ('Colar Pérola', 'Colar delicado com pérolas', 'COL-001', cat_colares_id, 450.00, 15.0, supplier_id, true),
    ('Brincos Argola', 'Brincos de argola em prata', 'BRI-001', cat_brincos_id, 180.00, 3.5, supplier_id, true);
  
  -- Obter IDs dos produtos inseridos
  SELECT id INTO product_id1 FROM public.products WHERE sku = 'ALI-001';
  SELECT id INTO product_id2 FROM public.products WHERE sku = 'COL-001';
  SELECT id INTO product_id3 FROM public.products WHERE sku = 'BRI-001';
  
  -- Inserir variações de produtos
  INSERT INTO public.product_variants (product_id, material_id, size, width, price_adjustment, active)
  VALUES 
    -- Variações da aliança
    (product_id1, mat_ouro_id, '16', '4mm', 0, true),
    (product_id1, mat_ouro_id, '18', '4mm', 0, true),
    (product_id1, mat_ouro_id, '20', '4mm', 0, true),
    (product_id1, mat_ouro_id, '16', '6mm', 50.00, true),
    (product_id1, mat_ouro_id, '18', '6mm', 50.00, true),
    (product_id1, mat_ouro_id, '20', '6mm', 50.00, true),
    -- Variações do colar
    (product_id2, mat_prata_id, '40cm', null, 0, true),
    (product_id2, mat_prata_id, '45cm', null, 0, true),
    (product_id2, mat_prata_id, '50cm', null, 0, true),
    -- Variações dos brincos
    (product_id3, mat_prata_id, 'Único', null, 0, true),
    (product_id3, mat_titanio_id, 'Único', null, -30.00, true);
  
  -- Inserir imagens de exemplo (usando placeholders)
  INSERT INTO public.product_images (product_id, image_url, alt_text, is_primary, display_order)
  VALUES 
    (product_id1, '/placeholder.svg', 'Aliança Clássica em Ouro', true, 0),
    (product_id2, '/placeholder.svg', 'Colar de Pérolas', true, 0),
    (product_id3, '/placeholder.svg', 'Brincos de Argola', true, 0);
  
  -- Inserir estoque básico
  INSERT INTO public.inventory (product_id, warehouse_id, quantity_available, minimum_stock)
  SELECT p.id, warehouse_id, 10, 2
  FROM public.products p
  WHERE p.sku IN ('ALI-001', 'COL-001', 'BRI-001');
  
END $$;