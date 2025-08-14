-- Deletar produtos duplicados incompletos
DELETE FROM public.products WHERE sku IN ('ANT08_NEW', 'ANT116_NEW', 'ANT33_NEW');

-- Inserir os 3 produtos base
INSERT INTO public.products (name, description, sku, base_price, category_id, weight, active) VALUES
(
  'All my life – aliança de tungstênio magnetizado a ouro 18k, acabamento de alto brilho',
  E'Benefícios do tungstênio:\n• Hipoalérgica\n• Não amassa\n• Não enferruja\n• Resistente a riscos\n• O único metal que tem brilho eterno\n• 4x mais duro que o titânio, 10x mais duro que o ouro 18K\n\nMaterial: tungstênio, ouro 18k\nCor: ouro\nAnatômica\nLargura: 8mm\nTamanho: 8 – 36\nPeso: 5g à 18g\n*Valor unitário!',
  'ANT33-LIFE',
  184.00,
  '24691d8d-562d-4012-9f0c-0821ff8887e2',
  0.012,
  true
),
(
  'All Of Me – aliança de tungstênio magnetizada a ouro 18k com swarovski',
  E'Benefícios do tungstênio:\n• Hipoalérgica\n• Não amassa\n• Não enferruja\n• Resistente a riscos\n• O único metal que tem brilho eterno\n• 4x mais duro que o titânio, 10x mais duro que o ouro 18K\n\nMaterial: Tungstênio, Ouro 18k\nCor: Ouro\nLargura: 4mm, 6mm, 8mm\nTamanho: 8 – 36\nPeso: 5g À 18g\nAnatômica\n*Valor Unitário',
  'ANT08-OFME',
  199.00,
  '24691d8d-562d-4012-9f0c-0821ff8887e2',
  0.012,
  true
),
(
  'All we need – luxuosa aliança de tungstênio com inlay de fibra',
  E'Benefícios do tungstênio:\n• Hipoalérgica\n• Não amassa\n• Não enferruja\n• Resistente a riscos\n• O único metal que tem brilho eterno\n• 4x mais duro que o titânio, 10x mais duro que o ouro 18K\n\nMaterial: tungstênio, titânio, fibra, resina\nAnatômica\nCor: preto, vermelho\nLargura: 8mm\nTamanho: 8 – 36\nPeso: 11g à 16g\n*Valor unitário',
  'ANT116-NEED',
  184.00,
  '24691d8d-562d-4012-9f0c-0821ff8887e2',
  0.015,
  true
);