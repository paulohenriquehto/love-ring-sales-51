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

-- Política simples para departments - todos podem ver
CREATE POLICY "Everyone can view departments" 
  ON public.departments 
  FOR SELECT 
  USING (true);

-- Atualizar tabela profiles - remover store_id e adicionar campos do sistema corporativo
ALTER TABLE public.profiles 
  DROP COLUMN IF EXISTS store_id,
  ADD COLUMN department_id UUID REFERENCES public.departments(id),
  ADD COLUMN position TEXT,
  ADD COLUMN budget_limit DECIMAL(10,2);

-- Atualizar políticas da tabela profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Políticas básicas para profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

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