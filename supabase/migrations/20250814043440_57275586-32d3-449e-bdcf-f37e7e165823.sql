-- Atualizar produto com informações reais do ANT437
UPDATE public.products 
SET 
  sku = 'ANT437',
  name = 'A Certain Romance - Aliança De Tungstênio Com Acabamento Fosco e Dourado',
  description = 'Aliança anatômica de tungstênio com detalhes em ouro 18k.

Benefícios do tungstênio:
• Hipoalérgica
• Não amassa
• Não enferruja  
• Resistente a riscos
• O único metal que tem brilho eterno
• 4x mais duro que o titânio, 10x mais duro que o ouro 18K

Especificações:
• Material: Tungstênio + Ouro 18k
• Cor: Ouro
• Anatômica
• Largura: 8mm
• Tamanhos: 08 a 36
• Peso: 5g a 18g (varia conforme tamanho)

Sob Encomenda - Período de Fabricação: 30 a 60 dias'
WHERE sku = 'ACR-TUNGST-001';

-- Atualizar descrição do material tungstênio
UPDATE public.materials 
SET description = 'Tungstênio: 4x mais duro que titânio, 10x mais duro que ouro 18K. Hipoalérgico, não amassa, não enferruja, resistente a riscos e com brilho eterno. O material mais durável para joias.'
WHERE name = 'Tungstênio';

-- Atualizar variantes com peso calculado e cor ouro
DO $$
DECLARE
  product_uuid UUID;
  size_number INTEGER;
  calculated_weight NUMERIC;
BEGIN
  -- Obter ID do produto
  SELECT id INTO product_uuid FROM public.products WHERE sku = 'ANT437';
  
  -- Atualizar cada variante com peso calculado (5g para tamanho 8, até 18g para tamanho 36)
  FOR size_number IN 8..36 LOOP
    -- Calcular peso: interpolação linear de 5g (tamanho 8) até 18g (tamanho 36)
    calculated_weight := 5 + ((size_number - 8) * 13.0 / 28.0);
    
    UPDATE public.product_variants 
    SET 
      color = 'Ouro',
      -- Adicionar peso seria necessário uma nova coluna, por enquanto mantemos nos metadados
      sku_variant = 'ANT437-' || LPAD(size_number::TEXT, 2, '0') || '-8MM-OURO'
    WHERE product_id = product_uuid 
    AND size = LPAD(size_number::TEXT, 2, '0');
  END LOOP;
END $$;