-- Primeiro, vamos limpar variantes duplicadas existentes
DELETE FROM product_variants 
WHERE sku_variant IN (
    SELECT sku_variant 
    FROM product_variants 
    GROUP BY sku_variant 
    HAVING COUNT(*) > 1
);

-- Agora executar consolidação simples e segura
DO $$
DECLARE
    duplicate_product RECORD;
    main_product_id UUID;
    variant_counter INTEGER := 1;
    total_removed INTEGER := 0;
BEGIN
    -- Processar produtos com padrão " - Xmm" no final
    FOR duplicate_product IN 
        SELECT 
            id,
            name,
            base_price,
            sku,
            REGEXP_REPLACE(name, ' - \d+mm$', '') as base_name,
            REGEXP_REPLACE(name, '.* - (\d+mm)$', '\1') as width_value
        FROM products 
        WHERE name ~ ' - \d+mm$'
        ORDER BY name, created_at
    LOOP
        -- Verificar se já existe um produto com o nome base
        SELECT id INTO main_product_id
        FROM products 
        WHERE name = duplicate_product.base_name
        AND id != duplicate_product.id;
        
        -- Se não existe produto principal, converter este
        IF main_product_id IS NULL THEN
            -- Atualizar nome removendo largura
            UPDATE products 
            SET name = duplicate_product.base_name,
                updated_at = now()
            WHERE id = duplicate_product.id;
            
            main_product_id := duplicate_product.id;
        END IF;
        
        -- Criar variante para este produto
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
            duplicate_product.width_value,
            CASE 
                WHEN main_product_id = duplicate_product.id THEN 0
                ELSE duplicate_product.base_price - (
                    SELECT base_price FROM products WHERE id = main_product_id
                )
            END,
            COALESCE(duplicate_product.sku, 'PROD-' || LEFT(main_product_id::TEXT, 8)) || '-' || UPPER(duplicate_product.width_value) || '-' || variant_counter,
            true,
            now(),
            now()
        ) ON CONFLICT (sku_variant) DO NOTHING;
        
        -- Se este não é o produto principal, mover dados e remover
        IF main_product_id != duplicate_product.id THEN
            -- Mover imagens
            UPDATE product_images 
            SET product_id = main_product_id
            WHERE product_id = duplicate_product.id;
            
            -- Mover inventário  
            UPDATE inventory 
            SET product_id = main_product_id
            WHERE product_id = duplicate_product.id;
            
            -- Remover configurações duplicadas
            DELETE FROM product_engraving_config 
            WHERE product_id = duplicate_product.id;
            
            -- Remover produto duplicado
            DELETE FROM products WHERE id = duplicate_product.id;
            
            total_removed := total_removed + 1;
            RAISE NOTICE 'Removido: % -> %', duplicate_product.name, duplicate_product.base_name;
        END IF;
        
        variant_counter := variant_counter + 1;
        
        -- Evitar timeout
        IF total_removed >= 100 THEN
            EXIT;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Total de produtos removidos (consolidados): %', total_removed;
END
$$;