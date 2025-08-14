-- Script de Consolidação Simplificado
-- Processar produtos duplicados por largura

DO $$
DECLARE
    base_name_record RECORD;
    product_record RECORD;
    main_product_id UUID;
    variant_counter INTEGER;
    total_consolidated INTEGER := 0;
BEGIN
    -- Para cada nome base que tem duplicatas
    FOR base_name_record IN 
        SELECT 
            REGEXP_REPLACE(name, ' - \d+mm$', '') as base_name,
            COUNT(*) as total_variants
        FROM products 
        WHERE name ~ ' - \d+mm$' 
        GROUP BY REGEXP_REPLACE(name, ' - \d+mm$', '')
        HAVING COUNT(*) > 1
        ORDER BY COUNT(*) DESC
        LIMIT 30
    LOOP
        RAISE NOTICE 'Consolidando: % (% variantes)', base_name_record.base_name, base_name_record.total_variants;
        
        -- Selecionar o primeiro produto como principal
        SELECT id INTO main_product_id
        FROM products 
        WHERE name ~ ('^' || REGEXP_REPLACE(base_name_record.base_name, '([.*+?^${}()|[\]\\])', '\\\1', 'g') || ' - \d+mm$')
        ORDER BY created_at
        LIMIT 1;
        
        -- Atualizar nome do produto principal
        UPDATE products 
        SET name = base_name_record.base_name,
            updated_at = now()
        WHERE id = main_product_id;
        
        variant_counter := 0;
        
        -- Processar cada variante
        FOR product_record IN 
            SELECT 
                id,
                name,
                base_price,
                sku,
                REGEXP_REPLACE(name, '.* - (\d+mm)$', '\1') as width_extracted
            FROM products 
            WHERE name ~ ('^' || REGEXP_REPLACE(base_name_record.base_name, '([.*+?^${}()|[\]\\])', '\\\1', 'g') || ' - \d+mm$')
            ORDER BY created_at
        LOOP
            variant_counter := variant_counter + 1;
            
            -- Criar variante com SKU único
            INSERT INTO product_variants (
                product_id,
                width,
                price_adjustment,
                sku_variant,
                active,
                created_at,
                updated_at
            ) VALUES (
                main_product_id,
                product_record.width_extracted,
                CASE 
                    WHEN product_record.id = main_product_id THEN 0
                    ELSE COALESCE(product_record.base_price, 0) - (
                        SELECT COALESCE(base_price, 0) FROM products WHERE id = main_product_id
                    )
                END,
                COALESCE(product_record.sku, 'PROD') || '-' || UPPER(product_record.width_extracted) || '-' || variant_counter,
                true,
                now(),
                now()
            );
            
            -- Se não for o produto principal, mover dados e remover
            IF product_record.id != main_product_id THEN
                -- Mover imagens
                UPDATE product_images 
                SET product_id = main_product_id,
                    variant_id = (
                        SELECT id FROM product_variants 
                        WHERE product_id = main_product_id 
                        AND width = product_record.width_extracted 
                        ORDER BY created_at DESC 
                        LIMIT 1
                    )
                WHERE product_id = product_record.id;
                
                -- Mover inventário
                UPDATE inventory 
                SET product_id = main_product_id,
                    variant_id = (
                        SELECT id FROM product_variants 
                        WHERE product_id = main_product_id 
                        AND width = product_record.width_extracted 
                        ORDER BY created_at DESC 
                        LIMIT 1
                    )
                WHERE product_id = product_record.id;
                
                -- Remover configurações de gravação duplicadas
                DELETE FROM product_engraving_config 
                WHERE product_id = product_record.id;
                
                -- Remover produto duplicado
                DELETE FROM products WHERE id = product_record.id;
                
                RAISE NOTICE 'Removido produto duplicado: %', product_record.name;
            END IF;
        END LOOP;
        
        total_consolidated := total_consolidated + 1;
        RAISE NOTICE 'Consolidado: % com % variantes', base_name_record.base_name, variant_counter;
        
        -- Evitar timeout - parar após alguns produtos
        IF total_consolidated >= 20 THEN
            EXIT;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Total de produtos consolidados: %', total_consolidated;
END
$$;

-- Verificar resultados
SELECT 
    COUNT(*) as total_products,
    (SELECT COUNT(*) FROM product_variants) as total_variants,
    (SELECT COUNT(*) FROM (
        SELECT REGEXP_REPLACE(name, ' - \d+mm$', '') as base_name
        FROM products 
        WHERE name ~ ' - \d+mm$' 
        GROUP BY REGEXP_REPLACE(name, ' - \d+mm$', '')
        HAVING COUNT(*) > 1
    ) remaining) as remaining_duplicates
FROM products;