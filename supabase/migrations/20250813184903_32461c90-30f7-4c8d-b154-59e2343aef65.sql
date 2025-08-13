-- Primeiro criar todas as estruturas básicas sem dependências complexas

-- =============================================
-- EPIC 2: CATÁLOGO DE PRODUTOS
-- =============================================

-- Categorias de produtos
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_category_id UUID REFERENCES public.categories(id),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Materiais
CREATE TABLE IF NOT EXISTS public.materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  price_multiplier DECIMAL(4,2) DEFAULT 1.00,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Fornecedores
CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  cnpj TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Armazéns
CREATE TABLE IF NOT EXISTS public.warehouses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  manager_user_id UUID,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Produtos principais
CREATE TABLE IF NOT EXISTS public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT UNIQUE,
  category_id UUID REFERENCES public.categories(id),
  base_price DECIMAL(10,2) NOT NULL,
  weight DECIMAL(8,3),
  supplier_id UUID REFERENCES public.suppliers(id),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Variações de produto
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  material_id UUID REFERENCES public.materials(id),
  size TEXT,
  width TEXT,
  color TEXT,
  sku_variant TEXT UNIQUE,
  price_adjustment DECIMAL(10,2) DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, material_id, size, width, color)
);

-- Imagens dos produtos
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- EPIC 3: SISTEMA DE REQUISIÇÕES
-- =============================================

-- Tipos para requisições
DO $$ BEGIN
    CREATE TYPE public.request_status AS ENUM (
      'draft', 'submitted', 'pending_approval', 'approved', 'rejected', 
      'in_preparation', 'ready_for_pickup', 'completed', 'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.request_priority AS ENUM ('low', 'normal', 'high', 'urgent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Requisições
CREATE TABLE IF NOT EXISTS public.requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_number TEXT UNIQUE NOT NULL DEFAULT '',
  requester_user_id UUID NOT NULL,
  department_id UUID REFERENCES public.departments(id),
  status public.request_status NOT NULL DEFAULT 'draft',
  priority public.request_priority NOT NULL DEFAULT 'normal',
  title TEXT NOT NULL,
  description TEXT,
  justification TEXT,
  total_amount DECIMAL(12,2) DEFAULT 0,
  approved_amount DECIMAL(12,2),
  approved_by_user_id UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  delivery_date_requested DATE,
  delivery_date_confirmed DATE,
  warehouse_id UUID REFERENCES public.warehouses(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Itens da requisição
CREATE TABLE IF NOT EXISTS public.request_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  variant_id UUID REFERENCES public.product_variants(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- EPIC 4: CONTROLE DE ESTOQUE
-- =============================================

-- Tipos de movimentação
DO $$ BEGIN
    CREATE TYPE public.stock_movement_type AS ENUM (
      'purchase', 'sale', 'transfer', 'adjustment', 'damage', 'return', 'reservation', 'unreservation'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Estoque atual
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id),
  variant_id UUID REFERENCES public.product_variants(id),
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id),
  quantity_available INTEGER NOT NULL DEFAULT 0 CHECK (quantity_available >= 0),
  quantity_reserved INTEGER NOT NULL DEFAULT 0 CHECK (quantity_reserved >= 0),
  quantity_total INTEGER GENERATED ALWAYS AS (quantity_available + quantity_reserved) STORED,
  minimum_stock INTEGER DEFAULT 0,
  maximum_stock INTEGER,
  last_count_date DATE,
  last_movement_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, variant_id, warehouse_id)
);

-- Movimentações de estoque
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id),
  variant_id UUID REFERENCES public.product_variants(id),
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id),
  movement_type public.stock_movement_type NOT NULL,
  quantity INTEGER NOT NULL,
  quantity_before INTEGER NOT NULL,
  quantity_after INTEGER NOT NULL,
  unit_cost DECIMAL(10,2),
  total_cost DECIMAL(12,2),
  reference_type TEXT,
  reference_id UUID,
  performed_by_user_id UUID NOT NULL,
  notes TEXT,
  movement_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- RLS BÁSICO
-- =============================================

-- Habilitar RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- Políticas básicas de visualização (todos podem ver)
CREATE POLICY "Everyone can view active categories" ON public.categories
  FOR SELECT USING (active = true);

CREATE POLICY "Everyone can view active materials" ON public.materials
  FOR SELECT USING (active = true);

CREATE POLICY "Everyone can view active products" ON public.products
  FOR SELECT USING (active = true);

CREATE POLICY "Everyone can view active variants" ON public.product_variants
  FOR SELECT USING (active = true);

CREATE POLICY "Everyone can view product images" ON public.product_images
  FOR SELECT USING (true);

-- Políticas simples para requisições (usuários veem suas próprias)
CREATE POLICY "Users can view own requests" ON public.requests
  FOR SELECT USING (requester_user_id = auth.uid());

CREATE POLICY "Users can create own requests" ON public.requests
  FOR INSERT WITH CHECK (requester_user_id = auth.uid());

-- =============================================
-- DADOS INICIAIS
-- =============================================

-- Inserir categorias básicas
INSERT INTO public.categories (name, description) VALUES
  ('Anéis', 'Anéis diversos incluindo alianças e solitários'),
  ('Colares', 'Colares e correntes de diversos tamanhos'),
  ('Brincos', 'Brincos variados'),
  ('Pulseiras', 'Pulseiras e braceletes'),
  ('Relógios', 'Relógios masculinos e femininos'),
  ('Pingentes', 'Pingentes para colares')
ON CONFLICT (name) DO NOTHING;

-- Inserir materiais básicos
INSERT INTO public.materials (name, description, price_multiplier) VALUES
  ('Ouro 18k', 'Ouro 18 quilates', 3.50),
  ('Prata 925', 'Prata de lei 925', 1.00),
  ('Titânio', 'Titânio cirúrgico', 1.20),
  ('Aço Inox', 'Aço inoxidável', 0.80),
  ('Ouro Branco 18k', 'Ouro branco 18 quilates', 3.80),
  ('Ouro Rose 18k', 'Ouro rosé 18 quilates', 3.60)
ON CONFLICT (name) DO NOTHING;

-- Inserir armazéns básicos
INSERT INTO public.warehouses (name, location) VALUES
  ('Loja Principal', 'Centro da cidade'),
  ('Estoque Central', 'Depósito - Zona Industrial'),
  ('Loja Shopping', 'Shopping Center')
ON CONFLICT DO NOTHING;

-- Inserir fornecedores básicos
INSERT INTO public.suppliers (name, contact_person, email, phone) VALUES
  ('Joias Luxo LTDA', 'João Silva', 'contato@joiasluxo.com.br', '(11) 99999-9999'),
  ('Metais Preciosos SA', 'Maria Santos', 'vendas@metaispreciosos.com.br', '(11) 88888-8888'),
  ('Importadora Gemstone', 'Pedro Costa', 'pedro@gemstone.com.br', '(11) 77777-7777')
ON CONFLICT DO NOTHING;