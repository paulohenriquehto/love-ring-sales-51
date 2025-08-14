-- Add image support to engraving symbols and categories
ALTER TABLE public.engraving_symbols 
ADD COLUMN image_url text,
ADD COLUMN svg_content text;

-- Update engraving categories with better structure
ALTER TABLE public.engraving_categories 
ADD COLUMN image_url text,
ADD COLUMN description text;

-- Insert default categories with symbols
INSERT INTO public.engraving_categories (id, name, icon, description, sort_order, active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Zodíaco', '♈', 'Signos do zodíaco', 1, true),
('550e8400-e29b-41d4-a716-446655440002', 'Times', '⚽', 'Times de futebol', 2, true),
('550e8400-e29b-41d4-a716-446655440003', 'Símbolos', '♥', 'Símbolos especiais', 3, true);

-- Insert zodiac symbols
INSERT INTO public.engraving_symbols (id, name, category_id, unicode_char, price_adjustment, active) VALUES
('550e8400-e29b-41d4-a716-446655440010', 'Áries', '550e8400-e29b-41d4-a716-446655440001', '♈', 5.00, true),
('550e8400-e29b-41d4-a716-446655440011', 'Touro', '550e8400-e29b-41d4-a716-446655440001', '♉', 5.00, true),
('550e8400-e29b-41d4-a716-446655440012', 'Gêmeos', '550e8400-e29b-41d4-a716-446655440001', '♊', 5.00, true),
('550e8400-e29b-41d4-a716-446655440013', 'Câncer', '550e8400-e29b-41d4-a716-446655440001', '♋', 5.00, true),
('550e8400-e29b-41d4-a716-446655440014', 'Leão', '550e8400-e29b-41d4-a716-446655440001', '♌', 5.00, true),
('550e8400-e29b-41d4-a716-446655440015', 'Virgem', '550e8400-e29b-41d4-a716-446655440001', '♍', 5.00, true),
('550e8400-e29b-41d4-a716-446655440016', 'Libra', '550e8400-e29b-41d4-a716-446655440001', '♎', 5.00, true),
('550e8400-e29b-41d4-a716-446655440017', 'Escorpião', '550e8400-e29b-41d4-a716-446655440001', '♏', 5.00, true),
('550e8400-e29b-41d4-a716-446655440018', 'Sagitário', '550e8400-e29b-41d4-a716-446655440001', '♐', 5.00, true),
('550e8400-e29b-41d4-a716-446655440019', 'Capricórnio', '550e8400-e29b-41d4-a716-446655440001', '♑', 5.00, true),
('550e8400-e29b-41d4-a716-446655440020', 'Aquário', '550e8400-e29b-41d4-a716-446655440001', '♒', 5.00, true),
('550e8400-e29b-41d4-a716-446655440021', 'Peixes', '550e8400-e29b-41d4-a716-446655440001', '♓', 5.00, true);

-- Insert team symbols  
INSERT INTO public.engraving_symbols (id, name, category_id, unicode_char, price_adjustment, active) VALUES
('550e8400-e29b-41d4-a716-446655440030', 'Flamengo', '550e8400-e29b-41d4-a716-446655440002', '🔴⚫', 10.00, true),
('550e8400-e29b-41d4-a716-446655440031', 'Corinthians', '550e8400-e29b-41d4-a716-446655440002', '⚫⚪', 10.00, true),
('550e8400-e29b-41d4-a716-446655440032', 'Palmeiras', '550e8400-e29b-41d4-a716-446655440002', '🟢⚪', 10.00, true),
('550e8400-e29b-41d4-a716-446655440033', 'São Paulo', '550e8400-e29b-41d4-a716-446655440002', '🔴⚫⚪', 10.00, true),
('550e8400-e29b-41d4-a716-446655440034', 'Vasco', '550e8400-e29b-41d4-a716-446655440002', '⚫⚪', 10.00, true),
('550e8400-e29b-41d4-a716-446655440035', 'Botafogo', '550e8400-e29b-41d4-a716-446655440002', '⚫⚪', 10.00, true);

-- Insert special symbols
INSERT INTO public.engraving_symbols (id, name, category_id, unicode_char, price_adjustment, active) VALUES
('550e8400-e29b-41d4-a716-446655440040', 'Coração', '550e8400-e29b-41d4-a716-446655440003', '♥', 3.00, true),
('550e8400-e29b-41d4-a716-446655440041', 'Estrela', '550e8400-e29b-41d4-a716-446655440003', '★', 3.00, true),
('550e8400-e29b-41d4-a716-446655440042', 'Infinito', '550e8400-e29b-41d4-a716-446655440003', '∞', 3.00, true),
('550e8400-e29b-41d4-a716-446655440043', 'Cruz', '550e8400-e29b-41d4-a716-446655440003', '✝', 3.00, true),
('550e8400-e29b-41d4-a716-446655440044', 'Âncora', '550e8400-e29b-41d4-a716-446655440003', '⚓', 3.00, true),
('550e8400-e29b-41d4-a716-446655440045', 'Coroa', '550e8400-e29b-41d4-a716-446655440003', '♔', 3.00, true);