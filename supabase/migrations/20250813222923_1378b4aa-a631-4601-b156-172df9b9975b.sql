-- Create table for custom fonts
CREATE TABLE public.custom_fonts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  font_family TEXT NOT NULL,
  google_fonts_url TEXT NOT NULL,
  css_class_name TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(css_class_name)
);

-- Enable RLS
ALTER TABLE public.custom_fonts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Everyone can view active fonts" 
ON public.custom_fonts 
FOR SELECT 
USING (active = true);

CREATE POLICY "Admins and managers can manage fonts" 
ON public.custom_fonts 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role IN ('admin', 'manager')
));

-- Add trigger for timestamps
CREATE TRIGGER update_custom_fonts_updated_at
BEFORE UPDATE ON public.custom_fonts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default fonts
INSERT INTO public.custom_fonts (name, font_family, google_fonts_url, css_class_name) VALUES
('Arial', 'Arial, sans-serif', '', 'font-sans'),
('Poiret One', 'Poiret One, sans-serif', 'https://fonts.googleapis.com/css2?family=Poiret+One&display=swap', 'font-poiret'),
('Josefin Sans', 'Josefin Sans, sans-serif', 'https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@300;400;600&display=swap', 'font-josefin'),
('Cinzel', 'Cinzel, serif', 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&display=swap', 'font-cinzel'),
('Handlee', 'Handlee, cursive', 'https://fonts.googleapis.com/css2?family=Handlee&display=swap', 'font-handlee'),
('Tangerine', 'Tangerine, cursive', 'https://fonts.googleapis.com/css2?family=Tangerine:wght@400;700&display=swap', 'font-tangerine'),
('Reenie Beanie', 'Reenie Beanie, cursive', 'https://fonts.googleapis.com/css2?family=Reenie+Beanie&display=swap', 'font-reenie'),
('Annie Use Your Telescope', 'Annie Use Your Telescope, cursive', 'https://fonts.googleapis.com/css2?family=Annie+Use+Your+Telescope&display=swap', 'font-annie');