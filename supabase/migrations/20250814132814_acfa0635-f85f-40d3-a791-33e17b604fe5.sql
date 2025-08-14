-- Adicionar novas categorias para times de futebol
INSERT INTO public.engraving_categories (name, description, sort_order, active) VALUES
('Times Brasileiros', 'Símbolos de times de futebol brasileiros', 2, true),
('Times Internacionais', 'Símbolos de times de futebol internacionais', 3, true);

-- Inserir símbolos de times brasileiros
INSERT INTO public.engraving_symbols (category_id, name, image_url, active) 
SELECT 
  (SELECT id FROM public.engraving_categories WHERE name = 'Times Brasileiros'),
  name,
  image_url,
  true
FROM (VALUES
  ('Atlético Goianiense', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/88/38f1303f11a12e510cfc7e1d325b6338.jpg'),
  ('Atlético Mineiro', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/89/928b2b7dc7d619dc99b4337d6ea06f37.jpg'),
  ('Atlético Paranaense', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/90/9887d5aa129a02d05774bf3510fb4c5c.jpg'),
  ('Avaí', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/91/99ceb3d0b6e548de923190ad8d71986c.jpg'),
  ('Bahia', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/92/4ecbcf131de5be1414aa8d07b90febe7.jpg'),
  ('Botafogo', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/93/a05a6ae95d1053444d6b5ac9fe278b04.jpg'),
  ('Chapecoense', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/94/6d31be6e0c0bb255de56fb4d19b26f81.jpg'),
  ('Corinthians', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/95/8b9200c2db2955e450c04f4ff64b6026.jpg'),
  ('Coritiba', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/96/b83adab4bc0753282f82648f6001b1d3.jpg'),
  ('Cruzeiro', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/97/a4801c7c5019b7f0d5e118ef304dff43.jpg'),
  ('Flamengo', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/98/3dea61643c0af32917b7c8aa0620456b.jpg'),
  ('Fluminense', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/99/67619a8e75535af34c9065c3d9a31dac.jpg'),
  ('Grêmio', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/100/1ce579b604dfb644ef452074c286dfcc.jpg'),
  ('Palmeiras', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/101/562d7d50f853fa3d50ee66a1c78a9550.jpg'),
  ('Ponte Preta', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/102/6d5e62fa2c3c71775ce84f1d6216d201.jpg'),
  ('Santos', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/103/70f472d0ce3e754a5f42d9abdf25e180.jpg'),
  ('São Paulo', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/104/85cdb8fce9b1163a302736c35e13cc9b.jpg'),
  ('Sport', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/105/236044be8ecba8314c7963be68d56099.jpg'),
  ('Vasco', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/106/7334388a114ef43ff27f5e2ce4c239e5.jpg')
) AS v(name, image_url);

-- Inserir símbolos de times internacionais
INSERT INTO public.engraving_symbols (category_id, name, image_url, active) 
SELECT 
  (SELECT id FROM public.engraving_categories WHERE name = 'Times Internacionais'),
  name,
  image_url,
  true
FROM (VALUES
  ('Arsenal', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/108/461071aadb57a36258601aefb41fdf0f.jpg'),
  ('Atlético de Madrid', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/109/7d365fe68e1443d54882b072ccb969b2.jpg'),
  ('Barcelona', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/110/450bd23419edcc6d066bea841e51fe14.jpg'),
  ('Bayern Munich', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/111/316cc6f2c13e129651413f2686ad7e6c.jpg'),
  ('Benfica', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/112/41843ad44a322985530443971f80ee5d.jpg'),
  ('Boca Juniors', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/113/534deeb1547a1f1d6fbe5d5877c5468f.jpg'),
  ('Chelsea', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/114/626c05a92936b75cba1ee7ea9c7b7eaa.jpg'),
  ('Inter de Milão', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/115/c14990ac2bbd9c80b1195bb17c0a1461.jpg'),
  ('Juventus', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/116/45e13583c19fd8380509c14632bba876.jpg'),
  ('Liverpool', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/117/e7272fdb48fd9a6b9257a12451fb6e16.jpg'),
  ('Manchester City', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/118/a89e7685504a383f9c1ecc14bf7e5449.jpg'),
  ('Manchester United', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/119/a4d485317dc46d656fc7a50e1cb84a22.jpg'),
  ('Milan', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/120/f7885ee08b4550a9a81fb452d1653e88.jpg'),
  ('Napoli', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/121/8c6ad5ef4a781966e9ead9aa913c011b.jpg'),
  ('Orlando City', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/122/24587c8df45f17c6f0724a87c13519ec.jpg'),
  ('PSG', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/123/64187b279a4b038143f682669dcd5df9.jpg'),
  ('Real Madrid', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/124/22c64a1d3ab23ae7fb7f68120b975880.jpg'),
  ('River Plate', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/125/3e655fe79f25b5d9d37411098bec0592.jpg'),
  ('Tottenham', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/126/dd4a9ab870e337ec0eb0ed7fe35e088c.jpg'),
  ('West Ham United', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/127/0892367b4387f4181a78e07114bbe657.jpg')
) AS v(name, image_url);