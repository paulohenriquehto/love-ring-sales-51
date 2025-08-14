-- Script de Consolidação de Produtos Duplicados (Versão Corrigida)
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

-- Função para gerar SKU único para variante
CREATE OR REPLACE FUNCTION generate_unique_variant_sku(base_sku TEXT, width_text TEXT, product_id UUID)
RETURNS TEXT AS $$
DECLARE
  new_sku TEXT;
  counter INTEGER := 1;
BEGIN
  -- Se base_sku for NULL ou vazio, usar ID do produto
  IF base_sku IS NULL OR base_sku = '' THEN
    base_sku := 'PROD-' || LEFT(product_id::TEXT, 8);
  END IF;
  
  -- Construir SKU inicial
  new_sku := base_sku || '-' || UPPER(width_text);
  
  -- Verificar se já existe e adicionar contador se necessário
  WHILE EXISTS (SELECT 1 FROM product_variants WHERE sku_variant = new_sku) LOOP
    new_sku := base_sku || '-' || UPPER(width_text) || '-' || counter;
    counter := counter + 1;
  END LOOP;
  
  RETURN new_sku;
END;
$$ LANGUAGE plpgsql;

-- Agora vamos processar cada grupo de produtos duplicados
DO $$
DECLARE
    consolidation_record RECORD;
    duplicate_id UUID;
    variant_width TEXT;
    variant_price NUMERIC;
    variant_sku TEXT;
    unique_variant_sku TEXT;
    i INTEGER;
    total_processed INTEGER := 0;
BEGIN
    -- Para cada grupo de produtos duplicados
    FOR consolidation_record IN 
        SELECT * FROM product_consolidation 
        ORDER BY variant_count DESC
        LIMIT 50  -- Processar em lotes para evitar timeouts
    LOOP
        RAISE NOTICE 'Processando produto: % (% variantes)', 
                     consolidation_record.base_name, 
                     consolidation_record.variant_count;
        
        -- Atualizar o produto principal com o nome base (sem largura)
        UPDATE products 
        SET name = consolidation_record.base_name,
            updated_at = now()
        WHERE id = consolidation_record.main_product_id;
        
        -- Primeiro, criar uma variante para o produto principal
        SELECT REGEXP_REPLACE(product_names[1], '.* - (\d+mm)$', '\1')
        INTO variant_width;
        
        unique_variant_sku := generate_unique_variant_sku(
            consolidation_record.main_sku, 
            variant_width, 
            consolidation_record.main_product_id
        );
        
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
            0, -- Sem ajuste para produto principal
            unique_variant_sku,
            true,
            now(),
            now()
        ) ON CONFLICT (sku_variant) DO NOTHING;
        
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
            
            -- Gerar SKU único para a variante
            unique_variant_sku := generate_unique_variant_sku(
                COALESCE(variant_sku, consolidation_record.main_sku), 
                variant_width, 
                consolidation_record.main_product_id
            );
            
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
                COALESCE(variant_price, 0) - COALESCE(consolidation_record.main_price, 0),
                unique_variant_sku,
                true,
                now(),
                now()
            ) ON CONFLICT (sku_variant) DO NOTHING;
            
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
            
            -- Mover configurações de gravação (com verificação)
            UPDATE product_engraving_config 
            SET product_id = consolidation_record.main_product_id
            WHERE product_id = duplicate_id
            AND NOT EXISTS (
                SELECT 1 FROM product_engraving_config 
                WHERE product_id = consolidation_record.main_product_id
            );
            
            -- Remover configurações duplicadas
            DELETE FROM product_engraving_config 
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
            
            RAISE NOTICE 'Criada variante % (%)', variant_width, unique_variant_sku;
        END LOOP;
        
        -- Remover produtos duplicados
        DELETE FROM products 
        WHERE id = ANY(consolidation_record.duplicate_ids);
        
        total_processed := total_processed + 1;
        
        RAISE NOTICE 'Consolidado produto % - Removidos % duplicados', 
                     consolidation_record.base_name,
                     array_length(consolidation_record.duplicate_ids, 1);
    END LOOP;
    
    RAISE NOTICE 'Lote processado: % grupos consolidados', total_processed;
END
$$;

-- Limpar função temporária
DROP FUNCTION IF EXISTS generate_unique_variant_sku(TEXT, TEXT, UUID);

-- Estatísticas finais
DO $$
DECLARE
    total_products INTEGER;
    total_variants INTEGER;
    remaining_duplicates INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_products FROM products;
    SELECT COUNT(*) INTO total_variants FROM product_variants;
    SELECT COUNT(*) INTO remaining_duplicates 
    FROM (
        SELECT REGEXP_REPLACE(name, ' - \d+mm$', '') as base_name
        FROM products 
        WHERE name ~ ' - \d+mm$' 
        GROUP BY REGEXP_REPLACE(name, ' - \d+mm$', '')
        HAVING COUNT(*) > 1
    ) remaining;
    
    RAISE NOTICE '=== CONSOLIDAÇÃO PARCIAL FINALIZADA ===';
    RAISE NOTICE 'Total de produtos: %', total_products;
    RAISE NOTICE 'Total de variantes: %', total_variants;
    RAISE NOTICE 'Grupos duplicados restantes: %', remaining_duplicates;
END
$$;