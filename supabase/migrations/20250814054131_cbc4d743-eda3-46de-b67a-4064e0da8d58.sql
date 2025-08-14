-- Update the "Amor perfeito 2" product with correct information
UPDATE public.products 
SET 
  name = 'Amor Perfeito 2 – Anel Folheado à Ouro 18K com Cristal Swarovski',
  description = 'Material: Banhado a ouro 18k, Swarovski
Cor: Dourado
Tamanho: 8-28
Peso: 1g – 3g

Anel elegante folheado a ouro 18K com cristal Swarovski, disponível em diversos tamanhos.',
  sku = 'AF01-PERFEITO2',
  base_price = 49.90,
  weight = 0.002,
  updated_at = now()
WHERE sku = 'AF01-PERFEITO2' OR name LIKE '%Amor perfeito 2%';

-- Update the product image
UPDATE public.product_images 
SET image_url = 'https://inlovestore.com/wp-content/uploads/2024/04/af01.png'
WHERE product_id = (SELECT id FROM public.products WHERE sku = 'AF01-PERFEITO2');