-- Recriar tabelas para símbolos de gravação
CREATE TABLE public.engraving_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.engraving_symbols (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.engraving_categories(id),
  name TEXT NOT NULL,
  unicode_char TEXT,
  svg_content TEXT,
  image_url TEXT,
  icon_path TEXT,
  price_adjustment NUMERIC DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.engraving_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engraving_symbols ENABLE ROW LEVEL SECURITY;

-- Create policies for categories
CREATE POLICY "Everyone can view active categories" ON public.engraving_categories
FOR SELECT USING (active = true);

CREATE POLICY "Admins and managers can manage categories" ON public.engraving_categories
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'manager')
  )
);

-- Create policies for symbols
CREATE POLICY "Everyone can view active symbols" ON public.engraving_symbols
FOR SELECT USING (active = true);

CREATE POLICY "Admins and managers can manage symbols" ON public.engraving_symbols
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'manager')
  )
);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_engraving_categories_updated_at
BEFORE UPDATE ON public.engraving_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_engraving_symbols_updated_at
BEFORE UPDATE ON public.engraving_symbols
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert category
INSERT INTO public.engraving_categories (name, description, icon, sort_order)
VALUES ('Signos', 'Símbolos dos signos do zodíaco', 'stars', 1);

-- Insert symbols with the provided URLs and codes
WITH category AS (SELECT id FROM public.engraving_categories WHERE name = 'Signos')
INSERT INTO public.engraving_symbols (category_id, name, image_url, icon_path)
SELECT 
  category.id,
  symbol_data.name,
  symbol_data.image_url,
  symbol_data.icon_path
FROM category,
(VALUES
  ('Aquário 1', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/51/c745ae17efd39e8a4e25526a2bf6d1fb.jpg', '(*aquario1*)'),
  ('Áries 1', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/52/a33cb849883b20969b76d17bdab8db33.jpg', '(*aries1*)'),
  ('Câncer 1', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/53/fe7054a6836d4735419041f9b0cabf0f.jpg', '(*cancer1*)'),
  ('Capricórnio 1', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/54/7ca4e5a01bf8f3e79908adaf74745cfd.jpg', '(*capricornio1*)'),
  ('Escorpião 1', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/55/7a0b43c1cd0cf00c0c309c8dcdeae8be.jpg', '(*escorpiao1*)'),
  ('Gêmeos 1', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/56/1c61372c82c50b8a628a1335e9c51a8a.jpg', '(*gemeos1*)'),
  ('Leão 1', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/57/f0e0437e5fe36bc646ed1985de17bf37.jpg', '(*leao1*)'),
  ('Libra 1', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/58/6e278a17aeb1dab9914a4a6cf2dad5bc.jpg', '(*libra1*)'),
  ('Peixes 1', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/59/46f9ae13dcde4c97ad09d4affd9e0c9b.jpg', '(*peixes1*)'),
  ('Sagitário 1', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/60/9db44c059ee60672c08804db0df9526a.jpg', '(*sargitario1*)'),
  ('Sagitário 2', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/61/a83b0702e34e184a0bcda174b8db567f.jpg', '(*sargitario2*)'),
  ('Touro 1', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/62/bc255f20361be102bcba823a79bd3b35.jpg', '(*touro1*)'),
  ('Virgem 1', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/63/98d4b5a147b379384b5c9ad0c9f3f6ba.jpg', '(*virgem1*)'),
  ('Aquário 2', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/64/a0b80c523b958fb5885f371ee8740bba.jpg', '(*aquario2*)'),
  ('Áries 2', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/65/36ba365e3a380f2325ecfabedcb02e2e.jpg', '(*aries2*)'),
  ('Câncer 2', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/66/a874edcc70ce166670ada01b0f470694.jpg', '(*cancer2*)'),
  ('Capricórnio 2', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/67/8d5b4b3c9811333f2d8ac72545227a0b.jpg', '(*capricornio2*)'),
  ('Escorpião 2', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/68/a23369417a8aaeab3a56a015d11aab41.jpg', '(*escorpiao2*)'),
  ('Gêmeos 2', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/69/6fe2ddd742c24942532b3375b7e82ee1.jpg', '(*gemeos2*)'),
  ('Leão 2', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/70/187de4b2ca6a1cd3dfe5178af2c22df1.jpg', '(*leao2*)'),
  ('Libra 2', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/71/d7fdf11e20c2e23cfabb31303f6a12d3.jpg', '(*libra2*)'),
  ('Peixes 2', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/72/0a746870c13907847fff18fcc0e1b52f.jpg', '(*peixes2*)'),
  ('Sagitário 3', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/73/da0b500932ff973821b40d98fa8dd5ab.jpg', '(*sargitario3*)'),
  ('Touro 2', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/74/2bd870bf8d119071a6ec5f9fe81af3b5.jpg', '(*touro2*)'),
  ('Virgem 2', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/75/cc4d991e0400b49b811da6c4620a59c1.jpg', '(*virgem2*)'),
  ('Aquário 3', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/76/e49dfec80daa44c40cf59e0d12a5db8c.jpg', '(*aquario3*)'),
  ('Áries 3', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/77/24cd97f82a3806b6d4dee960db3f87ce.jpg', '(*aries3*)'),
  ('Câncer 3', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/78/6b5d3b198619b2fafd858a68e7f0bb9e.jpg', '(*cancer3*)'),
  ('Capricórnio 3', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/79/de3b4ca05d8d3bfda91f3da41651a29b.jpg', '(*capricornio3*)'),
  ('Escorpião 3', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/80/f5d77797e2dcdd1aab24ab16970a61a6.jpg', '(*escorpiao3*)'),
  ('Gêmeos 3', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/81/46786147c47c9f5690a49e2d7250a1ad.jpg', '(*gemeos3*)'),
  ('Leão 3', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/82/47f370e1845ceeabe3ee2d5494f86ff2.jpg', '(*leao3*)'),
  ('Libra 3', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/83/9b9ea0d1dd4e6182dc93a19301cf858b.jpg', '(*libra3*)'),
  ('Peixes 3', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/84/50f5563a50d1ba528e3b24d90022e38d.jpg', '(*peixes3*)'),
  ('Sagitário 4', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/85/d750883ad1e630c6bf1b60b77d0339da.jpg', '(*sargitario4*)'),
  ('Touro 3', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/86/94f3a5506881e7237a9231b3eb53f02c.jpg', '(*touro3*)'),
  ('Virgem 3', 'https://www.novissajoias.com.br/uploads/img/gravacoes_simbolos/87/04c617c7d604e73e1eff48011c58e1b8.jpg', '(*virgem3*)')
) AS symbol_data(name, image_url, icon_path);