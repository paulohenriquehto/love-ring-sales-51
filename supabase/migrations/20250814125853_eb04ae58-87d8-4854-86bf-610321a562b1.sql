-- Step 1: Delete ALL symbols to avoid any foreign key constraints
DELETE FROM engraving_symbols;

-- Step 2: Delete all categories to start fresh
DELETE FROM engraving_categories;

-- Step 3: Create the 3 main categories with proper sort_order
INSERT INTO engraving_categories (name, icon, sort_order, description, active) VALUES
('Símbolos', '🔯', 1, 'Símbolos decorativos diversos', true),
('Signos', '♒', 2, 'Signos do zodíaco e símbolos relacionados', true),
('Times', '⚽', 3, 'Símbolos de times esportivos', true);

-- Step 4: Insert the 37 new zodiac symbols into the Signos category
WITH signos_category AS (
  SELECT id as category_id FROM engraving_categories WHERE name = 'Signos' LIMIT 1
)
INSERT INTO engraving_symbols (name, category_id, unicode_char, image_url, price_adjustment, active)
SELECT name, category_id, unicode_char, image_url, 0, true
FROM signos_category, (VALUES
  ('Aquário', '♒', 'https://www.lingocode.com/wp-content/themes/lingocode/images/flags/aquarius.png'),
  ('Áries', '♈', 'https://www.lingocode.com/wp-content/themes/lingocode/images/flags/aries.png'),
  ('Câncer', '♋', 'https://www.lingocode.com/wp-content/themes/lingocode/images/flags/cancer.png'),
  ('Capricórnio', '♑', 'https://www.lingocode.com/wp-content/themes/lingocode/images/flags/capricorn.png'),
  ('Escorpião', '♏', 'https://www.lingocode.com/wp-content/themes/lingocode/images/flags/scorpio.png'),
  ('Gêmeos', '♊', 'https://www.lingocode.com/wp-content/themes/lingocode/images/flags/gemini.png'),
  ('Leão', '♌', 'https://www.lingocode.com/wp-content/themes/lingocode/images/flags/leo.png'),
  ('Libra', '♎', 'https://www.lingocode.com/wp-content/themes/lingocode/images/flags/libra.png'),
  ('Peixes', '♓', 'https://www.lingocode.com/wp-content/themes/lingocode/images/flags/pisces.png'),
  ('Sagitário', '♐', 'https://www.lingocode.com/wp-content/themes/lingocode/images/flags/sagittarius.png'),
  ('Touro', '♉', 'https://www.lingocode.com/wp-content/themes/lingocode/images/flags/taurus.png'),
  ('Virgem', '♍', 'https://www.lingocode.com/wp-content/themes/lingocode/images/flags/virgo.png'),
  ('Ace', '🂡', 'https://www.lingocode.com/wp-content/themes/lingocode/images/flags/ace-of-spades.png'),
  ('Clubs', '♣', 'https://www.lingocode.com/wp-content/themes/lingocode/images/flags/clubs.png'),
  ('Diamonds', '♦', 'https://www.lingocode.com/wp-content/themes/lingocode/images/flags/diamonds.png'),
  ('Hearts', '♥', 'https://www.lingocode.com/wp-content/themes/lingocode/images/flags/hearts.png'),
  ('Jack', '🂻', 'https://www.lingocode.com/wp-content/themes/lingocode/images/flags/jack-of-spades.png'),
  ('King', '🂾', 'https://www.lingocode.com/wp-content/themes/lingocode/images/flags/king-of-spades.png'),
  ('Queen', '🂽', 'https://www.lingocode.com/wp-content/themes/lingocode/images/flags/queen-of-spades.png'),
  ('Spades', '♠', 'https://www.lingocode.com/wp-content/themes/lingocode/images/flags/spades.png'),
  ('Joker', '🃏', 'https://www.lingocode.com/wp-content/themes/lingocode/images/flags/joker.png'),
  ('Female', '♀', 'https://www.lingocode.com/wp-content/themes/lingocode/images/flags/female.png'),
  ('Male', '♂', 'https://www.lingocode.com/wp-content/themes/lingocode/images/flags/male.png'),
  ('Bandeira', '🏳', 'https://www.lingocode.com/wp-content/themes/lingocode/images/flags/flag.png'),
  ('Casa', '🏠', 'https://www.lingocode.com/wp-content/themes/lingocode/images/flags/house.png'),
  ('Coração', '❤', 'https://www.lingocode.com/wp-content/themes/lingocode/images/flags/heart.png'),
  ('Estrela', '⭐', 'https://www.lingocode.com/wp-content/themes/lingocode/images/flags/star.png'),
  ('Flor', '🌸', 'https://www.lingocode.com/wp-content/themes/lingocode/images/flags/flower.png'),
  ('Lua', '🌙', 'https://www.lingocode.com/wp-content/themes/lingocode/images/flags/moon.png'),
  ('Sol', '☀', 'https://www.lingocode.com/wp-content/themes/lingocode/images/flags/sun.png'),
  ('Âncora', '⚓', 'https://www.lingocode.com/wp-content/themes/lingocode/images/flags/anchor.png'),
  ('Avião', '✈', 'https://www.lingocode.com/wp-content/themes/lingocode/images/flags/airplane.png'),
  ('Bicicleta', '🚲', 'https://www.lingocode.com/wp-content/themes/lingocode/images/flags/bicycle.png'),
  ('Carro', '🚗', 'https://www.lingocode.com/wp-content/themes/lingocode/images/flags/car.png'),
  ('Navio', '🚢', 'https://www.lingocode.com/wp-content/themes/lingocode/images/flags/ship.png'),
  ('Trem', '🚂', 'https://www.lingocode.com/wp-content/themes/lingocode/images/flags/train.png'),
  ('Infinito', '∞', 'https://www.lingocode.com/wp-content/themes/lingocode/images/flags/infinity.png')
) AS symbols(name, unicode_char, image_url);