-- Atualizar o SKU do produto ANF24 para ANF24*-1-1
UPDATE public.products 
SET sku = 'ANF24*-1-1' 
WHERE sku = 'ANF24' AND name = 'Administração – anel de formatura magnetizada a ouro com inlay de fibra';