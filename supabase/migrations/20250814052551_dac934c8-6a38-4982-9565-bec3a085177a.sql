-- Remover completamente produtos duplicados e suas variantes
DELETE FROM product_engraving_config WHERE product_id IN (
  SELECT id FROM products WHERE sku LIKE 'ANT%'
);

DELETE FROM product_images WHERE product_id IN (
  SELECT id FROM products WHERE sku LIKE 'ANT%'
);

DELETE FROM product_variants WHERE product_id IN (
  SELECT id FROM products WHERE sku LIKE 'ANT%'
);

DELETE FROM products WHERE sku LIKE 'ANT%';