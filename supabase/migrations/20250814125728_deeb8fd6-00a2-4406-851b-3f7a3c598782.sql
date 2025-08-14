-- Step 1: Clean up duplicate categories and fix sort_order
-- First, let's see what we have and clean it up

-- Delete the duplicate "Zodíaco" category if it exists
DELETE FROM engraving_categories WHERE name = 'Zodíaco';

-- Update the remaining categories to have proper sort_order and ensure we have the right ones
UPDATE engraving_categories SET sort_order = 1 WHERE name = 'Símbolos';
UPDATE engraving_categories SET sort_order = 2 WHERE name = 'Signos';
UPDATE engraving_categories SET sort_order = 3 WHERE name = 'Times';

-- Remove any duplicate categories (keep only one of each type)
WITH duplicates AS (
  SELECT id, name, ROW_NUMBER() OVER (PARTITION BY name ORDER BY created_at) as rn
  FROM engraving_categories
)
DELETE FROM engraving_categories 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Step 2: Replace zodiac symbols
-- First, get the Signos category ID
WITH signos_category AS (
  SELECT id as category_id FROM engraving_categories WHERE name = 'Signos' LIMIT 1
)
-- Delete all existing symbols from Signos category
DELETE FROM engraving_symbols 
WHERE category_id = (SELECT category_id FROM signos_category);

-- Step 3: Insert the 37 new zodiac symbols
-- Get the Signos category ID for insertion
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