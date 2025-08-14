-- Clear all products and related data from the database

-- Delete stock movements
DELETE FROM public.stock_movements;

-- Delete inventory records
DELETE FROM public.inventory;

-- Delete product engraving configurations
DELETE FROM public.product_engraving_config;

-- Delete product images
DELETE FROM public.product_images;

-- Delete product variants
DELETE FROM public.product_variants;

-- Delete products
DELETE FROM public.products;