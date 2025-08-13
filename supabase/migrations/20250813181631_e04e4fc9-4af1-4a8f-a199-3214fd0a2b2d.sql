-- Criar tabela de departamentos
CREATE TABLE public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  manager_user_id UUID,
  budget_limit DECIMAL(10,2),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela departments
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- Atualizar tabela profiles para incluir department_id e remover store_id
ALTER TABLE public.profiles 
  DROP COLUMN IF EXISTS store_id,
  ADD COLUMN department_id UUID REFERENCES public.departments(id),
  ADD COLUMN position TEXT,
  ADD COLUMN budget_limit DECIMAL(10,2);

-- Criar enum para níveis de acesso
CREATE TYPE public.access_level AS ENUM ('user', 'manager', 'admin');

-- Remover valor padrão antes de alterar o tipo
ALTER TABLE public.profiles ALTER COLUMN role DROP DEFAULT;

-- Atualizar campo role na tabela profiles para usar enum
ALTER TABLE public.profiles 
  ALTER COLUMN role TYPE public.access_level USING role::public.access_level;

-- Definir novo valor padrão
ALTER TABLE public.profiles 
  ALTER COLUMN role SET DEFAULT 'user'::public.access_level;

-- Adicionar constraint para manager_user_id
ALTER TABLE public.departments 
  ADD CONSTRAINT fk_departments_manager 
  FOREIGN KEY (manager_user_id) REFERENCES public.profiles(user_id);

-- Políticas RLS para departments
CREATE POLICY "Users can view departments" 
  ON public.departments 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage departments" 
  ON public.departments 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Atualizar políticas da tabela profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Criar função de segurança para verificar role do usuário
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS public.access_level AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Novas políticas para profiles usando função de segurança
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Managers can view department profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (
    department_id IN (
      SELECT id FROM public.departments 
      WHERE manager_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all profiles" 
  ON public.profiles 
  FOR ALL 
  USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Atualizar função handle_new_user para usar novo esquema
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role, department_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.access_level, 'user'::public.access_level),
    (NEW.raw_user_meta_data->>'department_id')::uuid
  );
  RETURN NEW;
END;
$function$;

-- Adicionar trigger para atualizar updated_at nos departamentos
CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir departamentos padrão
INSERT INTO public.departments (name, description, active) VALUES
  ('Tecnologia da Informação', 'Departamento responsável pela infraestrutura e desenvolvimento de sistemas', true),
  ('Recursos Humanos', 'Departamento responsável pela gestão de pessoas e talentos', true),
  ('Financeiro', 'Departamento responsável pela gestão financeira e contábil', true),
  ('Operações', 'Departamento responsável pelas operações e processos internos', true),
  ('Compras', 'Departamento responsável pelas aquisições e suprimentos', true);