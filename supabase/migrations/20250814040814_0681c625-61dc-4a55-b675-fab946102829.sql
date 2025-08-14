-- Script de Consolidação de Produtos Duplicados
-- Este script identifica produtos que são variações do mesmo produto base
-- e os converte em uma estrutura correta de produto + variantes

-- Primeiro, vamos criar uma tabela temporária para mapear produtos duplicados
CREATE TEMP TABLE product_consolidation AS
WITH product_groups AS (
  SELECT 
    REGEXP_REPLACE(name, ' - \d+mm$', '') as base_name,
    ARRAY_AGG(id ORDER BY created_at) as product_ids,
    ARRAY_AGG(name ORDER BY created_at) as product_names,
    ARRAY_AGG(base_price ORDER BY created_at) as prices,
    ARRAY_AGG(description ORDER BY created_at) as descriptions,
    ARRAY_AGG(sku ORDER BY created_at) as skus,
    ARRAY_AGG(category_id ORDER BY created_at) as category_ids,
    ARRAY_AGG(supplier_id ORDER BY created_at) as supplier_ids,
    COUNT(*) as variant_count
  FROM products 
  WHERE name ~ ' - \d+mm$' 
  GROUP BY REGEXP_REPLACE(name, ' - \d+mm$', '')
  HAVING COUNT(*) > 1
)
SELECT 
  base_name,
  product_ids[1] as main_product_id,
  product_ids[2:] as duplicate_ids,
  product_names,
  prices[1] as main_price,
  descriptions[1] as main_description,
  skus[1] as main_sku,
  category_ids[1] as main_category_id,
  supplier_ids[1] as main_supplier_id,
  variant_count
FROM product_groups;

-- Agora vamos processar cada grupo de produtos duplicados
DO $$
DECLARE
    consolidation_record RECORD;
    duplicate_id UUID;
    variant_width TEXT;
    variant_price NUMERIC;
    variant_sku TEXT;
    i INTEGER;
BEGIN
    -- Para cada grupo de produtos duplicados
    FOR consolidation_record IN 
        SELECT * FROM product_consolidation 
        ORDER BY variant_count DESC
    LOOP
        RAISE NOTICE 'Processando produto: %', consolidation_record.base_name;
        
        -- Atualizar o produto principal com o nome base (sem largura)
        UPDATE products 
        SET name = consolidation_record.base_name,
            updated_at = now()
        WHERE id = consolidation_record.main_product_id;
        
        -- Criar variantes para cada produto duplicado
        FOR i IN 1..array_length(consolidation_record.duplicate_ids, 1)
        LOOP
            duplicate_id := consolidation_record.duplicate_ids[i];
            
            -- Extrair largura do nome do produto
            SELECT REGEXP_REPLACE(name, '.* - (\d+mm)$', '\1')
            INTO variant_width
            FROM products 
            WHERE id = duplicate_id;
            
            -- Obter preço e SKU do produto duplicado
            SELECT base_price, sku
            INTO variant_price, variant_sku
            FROM products 
            WHERE id = duplicate_id;
            
            -- Criar variante
            INSERT INTO product_variants (
                product_id,
                width,
                price_adjustment,
                sku_variant,
                active,
                created_at,
                updated_at
            ) VALUES (
                consolidation_record.main_product_id,
                variant_width,
                variant_price - consolidation_record.main_price,
                variant_sku,
                true,
                now(),
                now()
            );
            
            -- Mover imagens do produto duplicado para o produto principal
            UPDATE product_images 
            SET product_id = consolidation_record.main_product_id,
                variant_id = (
                    SELECT id FROM product_variants 
                    WHERE product_id = consolidation_record.main_product_id 
                    AND width = variant_width 
                    ORDER BY created_at DESC 
                    LIMIT 1
                )
            WHERE product_id = duplicate_id;
            
            -- Mover configurações de gravação
            UPDATE product_engraving_config 
            SET product_id = consolidation_record.main_product_id
            WHERE product_id = duplicate_id;
            
            -- Mover estoque/inventário
            UPDATE inventory 
            SET product_id = consolidation_record.main_product_id,
                variant_id = (
                    SELECT id FROM product_variants 
                    WHERE product_id = consolidation_record.main_product_id 
                    AND width = variant_width 
                    ORDER BY created_at DESC 
                    LIMIT 1
                )
            WHERE product_id = duplicate_id;
            
            RAISE NOTICE 'Criada variante % para produto %', variant_width, consolidation_record.base_name;
        END LOOP;
        
        -- Remover produtos duplicados
        DELETE FROM products 
        WHERE id = ANY(consolidation_record.duplicate_ids);
        
        RAISE NOTICE 'Removidos % produtos duplicados para %', 
                     array_length(consolidation_record.duplicate_ids, 1), 
                     consolidation_record.base_name;
    END LOOP;
    
    RAISE NOTICE 'Consolidação concluída!';
END
$$;

-- Criar variante principal (largura original) para produtos que ficaram sem variante
INSERT INTO product_variants (product_id, width, price_adjustment, sku_variant, active, created_at, updated_at)
SELECT 
    p.id,
    CASE 
        WHEN p.name ~ ' - \d+mm$' THEN REGEXP_REPLACE(p.name, '.* - (\d+mm)$', '\1')
        ELSE '6mm' -- largura padrão
    END as width,
    0 as price_adjustment,
    p.sku || '-' || CASE 
        WHEN p.name ~ ' - \d+mm$' THEN REGEXP_REPLACE(p.name, '.* - (\d+mm)$', '\1')
        ELSE '6MM'
    END as sku_variant,
    true,
    now(),
    now()
FROM products p
WHERE NOT EXISTS (
    SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id
)
AND p.name ~ ' - \d+mm$';

-- Atualizar nomes de produtos que ainda têm largura no nome
UPDATE products 
SET name = REGEXP_REPLACE(name, ' - \d+mm$', ''),
    updated_at = now()
WHERE name ~ ' - \d+mm$';

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_width ON product_variants(width);

-- Estatísticas finais
DO $$
DECLARE
    total_products INTEGER;
    total_variants INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_products FROM products;
    SELECT COUNT(*) INTO total_variants FROM product_variants;
    
    RAISE NOTICE 'CONSOLIDAÇÃO FINALIZADA:';
    RAISE NOTICE 'Total de produtos: %', total_products;
    RAISE NOTICE 'Total de variantes: %', total_variants;
END
$$;