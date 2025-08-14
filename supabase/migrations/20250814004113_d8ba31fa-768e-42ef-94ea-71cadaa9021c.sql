-- Create engraving categories table
CREATE TABLE public.engraving_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create engraving symbols table
CREATE TABLE public.engraving_symbols (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES public.engraving_categories(id),
  icon_path TEXT,
  unicode_char TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  price_adjustment NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.engraving_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engraving_symbols ENABLE ROW LEVEL SECURITY;

-- Create policies for categories
CREATE POLICY "Everyone can view active categories"
ON public.engraving_categories
FOR SELECT
USING (active = true);

CREATE POLICY "Admins and managers can manage categories"
ON public.engraving_categories
FOR ALL
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = ANY(ARRAY['admin', 'manager'])
));

-- Create policies for symbols
CREATE POLICY "Everyone can view active symbols"
ON public.engraving_symbols
FOR SELECT
USING (active = true);

CREATE POLICY "Admins and managers can manage symbols"
ON public.engraving_symbols
FOR ALL
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = ANY(ARRAY['admin', 'manager'])
));

-- Add triggers for updated_at
CREATE TRIGGER update_engraving_categories_updated_at
  BEFORE UPDATE ON public.engraving_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_engraving_symbols_updated_at
  BEFORE UPDATE ON public.engraving_symbols
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories
INSERT INTO public.engraving_categories (name, icon, sort_order) VALUES
('Símbolos', '⭐', 1),
('Signos', '♌', 2),
('Times', '⚽', 3);

-- Insert default symbols
INSERT INTO public.engraving_symbols (name, category_id, unicode_char) 
SELECT 'Coração', id, '❤️' FROM public.engraving_categories WHERE name = 'Símbolos'
UNION ALL
SELECT 'Estrela', id, '⭐' FROM public.engraving_categories WHERE name = 'Símbolos'
UNION ALL
SELECT 'Estrela Brilhante', id, '🌟' FROM public.engraving_categories WHERE name = 'Símbolos'
UNION ALL
SELECT 'Brilho', id, '✨' FROM public.engraving_categories WHERE name = 'Símbolos'
UNION ALL
SELECT 'Diamante', id, '💎' FROM public.engraving_categories WHERE name = 'Símbolos'
UNION ALL
SELECT 'Coroa', id, '👑' FROM public.engraving_categories WHERE name = 'Símbolos'
UNION ALL
SELECT 'Nota Musical', id, '🎵' FROM public.engraving_categories WHERE name = 'Símbolos'
UNION ALL
SELECT 'Raio', id, '⚡' FROM public.engraving_categories WHERE name = 'Símbolos'
UNION ALL
SELECT 'Fogo', id, '🔥' FROM public.engraving_categories WHERE name = 'Símbolos';

-- Insert zodiac signs
INSERT INTO public.engraving_symbols (name, category_id, unicode_char)
SELECT 'Áries', id, '♈' FROM public.engraving_categories WHERE name = 'Signos'
UNION ALL
SELECT 'Touro', id, '♉' FROM public.engraving_categories WHERE name = 'Signos'
UNION ALL
SELECT 'Gêmeos', id, '♊' FROM public.engraving_categories WHERE name = 'Signos'
UNION ALL
SELECT 'Câncer', id, '♋' FROM public.engraving_categories WHERE name = 'Signos'
UNION ALL
SELECT 'Leão', id, '♌' FROM public.engraving_categories WHERE name = 'Signos'
UNION ALL
SELECT 'Virgem', id, '♍' FROM public.engraving_categories WHERE name = 'Signos'
UNION ALL
SELECT 'Libra', id, '♎' FROM public.engraving_categories WHERE name = 'Signos'
UNION ALL
SELECT 'Escorpião', id, '♏' FROM public.engraving_categories WHERE name = 'Signos'
UNION ALL
SELECT 'Sagitário', id, '♐' FROM public.engraving_categories WHERE name = 'Signos'
UNION ALL
SELECT 'Capricórnio', id, '♑' FROM public.engraving_categories WHERE name = 'Signos'
UNION ALL
SELECT 'Aquário', id, '♒' FROM public.engraving_categories WHERE name = 'Signos'
UNION ALL
SELECT 'Peixes', id, '♓' FROM public.engraving_categories WHERE name = 'Signos';

-- Insert team symbols
INSERT INTO public.engraving_symbols (name, category_id, unicode_char)
SELECT 'Futebol', id, '⚽' FROM public.engraving_categories WHERE name = 'Times'
UNION ALL
SELECT 'Basquete', id, '🏀' FROM public.engraving_categories WHERE name = 'Times'
UNION ALL
SELECT 'Tênis', id, '🎾' FROM public.engraving_categories WHERE name = 'Times'
UNION ALL
SELECT 'Vôlei', id, '🏐' FROM public.engraving_categories WHERE name = 'Times';