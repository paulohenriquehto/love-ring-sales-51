-- Remover o trigger e a função que estão causando conflito
DROP TRIGGER IF EXISTS set_admin_role_trigger ON auth.users;
DROP FUNCTION IF EXISTS public.set_admin_role_for_specific_email();

-- Criar o tipo access_level se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'access_level') THEN
        CREATE TYPE public.access_level AS ENUM ('vendedora', 'manager', 'admin');
    END IF;
END $$;

-- Remover o valor padrão da coluna role
ALTER TABLE public.profiles ALTER COLUMN role DROP DEFAULT;

-- Alterar o tipo da coluna role
ALTER TABLE public.profiles ALTER COLUMN role TYPE public.access_level USING role::public.access_level;

-- Recriar o valor padrão
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'vendedora';

-- Recriar a função para admin específico com type cast correto
CREATE OR REPLACE FUNCTION public.set_admin_role_for_specific_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
    -- Check if the new user has the admin email
    IF NEW.email = 'paulohenriquehto28@gmail.com' THEN
        -- Update the profile that was just created to admin role
        UPDATE public.profiles 
        SET role = 'admin'::public.access_level
        WHERE user_id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Recriar o trigger
CREATE TRIGGER set_admin_role_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.set_admin_role_for_specific_email();

-- Atualizar a função handle_new_user
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
    COALESCE((NEW.raw_user_meta_data->>'role')::public.access_level, 'vendedora'::public.access_level),
    NEW.raw_user_meta_data->>'department_id'
  );
  RETURN NEW;
END;
$function$;