-- Create the tungsten ring product "A Certain Romance"
INSERT INTO public.products (
  name,
  description,
  sku,
  base_price,
  category_id,
  weight,
  active
) VALUES (
  'A Certain Romance – Aliança De Tungstênio Com Acabamento Fosco e Dourado',
  'Benefícios do tungstênio:
• Hipoalérgica
• Não amassa
• Não enferruja
• Resistente a riscos
• O único metal que tem brilho eterno
• 4x mais duro que o titânio, 10x mais duro que o ouro 18K

Material: Tungstênio, Ouro 18k
Cor: Ouro
Anatômica
Largura: 8mm
Tamanho: 8 – 36
Peso: 5g À 18g',
  'ANT437',
  179.00,
  '24691d8d-562d-4012-9f0c-0821ff8887e2',
  5.00,
  true
);