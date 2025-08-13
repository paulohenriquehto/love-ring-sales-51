-- Adicionar suporte a personalizações de gravação

-- Criar tabela para configurações de gravação de produtos
CREATE TABLE public.product_engraving_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL,
  supports_engraving BOOLEAN NOT NULL DEFAULT false,
  max_characters INTEGER NOT NULL DEFAULT 30,
  price_adjustment NUMERIC DEFAULT 0,
  available_fonts TEXT[] DEFAULT ARRAY['arial', 'poiret', 'josefin', 'cinzel', 'handlee', 'tangerine', 'reenie', 'annie'],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.product_engraving_config ENABLE ROW LEVEL SECURITY;

-- Políticas para visualização pública
CREATE POLICY "Everyone can view engraving configurations" 
ON public.product_engraving_config 
FOR SELECT 
USING (true);

-- Políticas para admins e gerentes
CREATE POLICY "Admins and managers can manage engraving configurations" 
ON public.product_engraving_config 
FOR ALL 
USING (EXISTS ( 
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = ANY (ARRAY['admin'::text, 'manager'::text])
));

-- Adicionar trigger para updated_at
CREATE TRIGGER update_product_engraving_config_updated_at
BEFORE UPDATE ON public.product_engraving_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir configurações padrão para produtos existentes (exemplo para alianças)
INSERT INTO public.product_engraving_config (product_id, supports_engraving, max_characters, price_adjustment)
SELECT id, true, 30, 50.00 
FROM public.products 
WHERE categories IS NOT NULL;