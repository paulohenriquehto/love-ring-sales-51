-- Primeiro verificar se o tipo já existe e criar se necessário
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'access_level') THEN
        CREATE TYPE public.access_level AS ENUM ('vendedora', 'manager', 'admin');
    END IF;
END $$;

-- Atualizar a tabela profiles para usar o enum
ALTER TABLE public.profiles ALTER COLUMN role TYPE public.access_level USING role::public.access_level;

-- Atualizar a função trigger para não usar store_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role, department_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.access_level, 'vendedora'),
    NEW.raw_user_meta_data->>'department_id'
  );
  RETURN NEW;
END;
$function$;