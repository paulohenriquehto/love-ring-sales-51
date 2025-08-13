-- =============================================
-- EPIC 2: CATÁLOGO DE PRODUTOS
-- =============================================

-- Categorias de produtos (anéis, colares, brincos, etc.)
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_category_id UUID REFERENCES public.categories(id),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Materiais (ouro, prata, titânio, etc.)
CREATE TABLE public.materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  price_multiplier DECIMAL(4,2) DEFAULT 1.00,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Fornecedores
CREATE TABLE public.suppliers (
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

-- Armazéns/Locais de estoque
CREATE TABLE public.warehouses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  manager_user_id UUID REFERENCES public.profiles(user_id),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Produtos principais
CREATE TABLE public.products (
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

-- Variações de produto (tamanho, material, etc.)
CREATE TABLE public.product_variants (
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
CREATE TABLE public.product_images (
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

-- Status de requisições
CREATE TYPE public.request_status AS ENUM (
  'draft',
  'submitted',
  'pending_approval',
  'approved',
  'rejected',
  'in_preparation',
  'ready_for_pickup',
  'completed',
  'cancelled'
);

-- Prioridades de requisições
CREATE TYPE public.request_priority AS ENUM ('low', 'normal', 'high', 'urgent');

-- Requisições/Pedidos
CREATE TABLE public.requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_number TEXT UNIQUE NOT NULL,
  requester_user_id UUID NOT NULL REFERENCES public.profiles(user_id),
  department_id UUID REFERENCES public.departments(id),
  status public.request_status NOT NULL DEFAULT 'draft',
  priority public.request_priority NOT NULL DEFAULT 'normal',
  title TEXT NOT NULL,
  description TEXT,
  justification TEXT,
  total_amount DECIMAL(12,2) DEFAULT 0,
  approved_amount DECIMAL(12,2),
  approved_by_user_id UUID REFERENCES public.profiles(user_id),
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
CREATE TABLE public.request_items (
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

-- Histórico de status das requisições
CREATE TABLE public.request_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  status public.request_status NOT NULL,
  changed_by_user_id UUID NOT NULL REFERENCES public.profiles(user_id),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Aprovações (workflow de aprovação)
CREATE TABLE public.request_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  approver_user_id UUID NOT NULL REFERENCES public.profiles(user_id),
  required_role public.access_level NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  decision_date TIMESTAMP WITH TIME ZONE,
  comments TEXT,
  approval_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(request_id, approver_user_id)
);

-- =============================================
-- EPIC 4: CONTROLE DE ESTOQUE
-- =============================================

-- Tipos de movimentação de estoque
CREATE TYPE public.stock_movement_type AS ENUM (
  'purchase',      -- Compra/entrada
  'sale',         -- Venda/saída
  'transfer',     -- Transferência entre armazéns
  'adjustment',   -- Ajuste de estoque
  'damage',       -- Perda/dano
  'return',       -- Devolução
  'reservation',  -- Reserva
  'unreservation' -- Liberação de reserva
);

-- Estoque atual por produto/variação/armazém
CREATE TABLE public.inventory (
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

-- Movimentações de estoque (histórico)
CREATE TABLE public.stock_movements (
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
  reference_type TEXT, -- 'request', 'purchase', 'adjustment', etc.
  reference_id UUID,   -- ID da requisição, compra, etc.
  performed_by_user_id UUID NOT NULL REFERENCES public.profiles(user_id),
  notes TEXT,
  movement_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- EPIC 5: RELATÓRIOS E ANALYTICS
-- =============================================

-- Métricas diárias do sistema
CREATE TABLE public.daily_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_date DATE NOT NULL,
  total_requests INTEGER DEFAULT 0,
  approved_requests INTEGER DEFAULT 0,
  rejected_requests INTEGER DEFAULT 0,
  total_amount DECIMAL(15,2) DEFAULT 0,
  approved_amount DECIMAL(15,2) DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  stock_movements INTEGER DEFAULT 0,
  low_stock_alerts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(metric_date)
);

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================

-- Índices para produtos
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_supplier ON public.products(supplier_id);
CREATE INDEX idx_products_active ON public.products(active);
CREATE INDEX idx_products_sku ON public.products(sku);

-- Índices para variações
CREATE INDEX idx_product_variants_product ON public.product_variants(product_id);
CREATE INDEX idx_product_variants_material ON public.product_variants(material_id);

-- Índices para requisições
CREATE INDEX idx_requests_requester ON public.requests(requester_user_id);
CREATE INDEX idx_requests_status ON public.requests(status);
CREATE INDEX idx_requests_department ON public.requests(department_id);
CREATE INDEX idx_requests_created_at ON public.requests(created_at);
CREATE INDEX idx_requests_number ON public.requests(request_number);

-- Índices para itens de requisição
CREATE INDEX idx_request_items_request ON public.request_items(request_id);
CREATE INDEX idx_request_items_product ON public.request_items(product_id);

-- Índices para estoque
CREATE INDEX idx_inventory_product_warehouse ON public.inventory(product_id, warehouse_id);
CREATE INDEX idx_inventory_low_stock ON public.inventory(warehouse_id, minimum_stock) WHERE quantity_available <= minimum_stock;

-- Índices para movimentações
CREATE INDEX idx_stock_movements_product_warehouse ON public.stock_movements(product_id, warehouse_id);
CREATE INDEX idx_stock_movements_date ON public.stock_movements(movement_date);
CREATE INDEX idx_stock_movements_reference ON public.stock_movements(reference_type, reference_id);

-- =============================================
-- RLS POLICIES
-- =============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_metrics ENABLE ROW LEVEL SECURITY;

-- Função auxiliar para verificar role do usuário
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS public.access_level AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Políticas básicas de visualização (todos podem ver dados ativos)
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

-- Políticas para requisições (usuários veem suas próprias + gerentes/admins veem do departamento)
CREATE POLICY "Users can view own requests" ON public.requests
  FOR SELECT USING (requester_user_id = auth.uid());

CREATE POLICY "Managers can view department requests" ON public.requests
  FOR SELECT USING (
    public.get_user_role() = 'manager' AND 
    department_id IN (
      SELECT department_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all requests" ON public.requests
  FOR SELECT USING (public.get_user_role() = 'admin');

-- Políticas para criação de requisições
CREATE POLICY "Users can create own requests" ON public.requests
  FOR INSERT WITH CHECK (requester_user_id = auth.uid());

-- Políticas para atualização de requisições
CREATE POLICY "Users can update own draft requests" ON public.requests
  FOR UPDATE USING (
    requester_user_id = auth.uid() AND status = 'draft'
  );

CREATE POLICY "Managers can update department requests" ON public.requests
  FOR UPDATE USING (
    public.get_user_role() IN ('manager', 'admin') AND 
    department_id IN (
      SELECT department_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Políticas para itens de requisição (seguem a requisição pai)
CREATE POLICY "Users can view request items based on request access" ON public.request_items
  FOR SELECT USING (
    request_id IN (
      SELECT id FROM public.requests WHERE 
        requester_user_id = auth.uid() OR
        (public.get_user_role() = 'manager' AND department_id IN (
          SELECT department_id FROM public.profiles WHERE user_id = auth.uid()
        )) OR
        public.get_user_role() = 'admin'
    )
  );

-- Políticas para estoque (apenas gerentes e admins)
CREATE POLICY "Managers and admins can view inventory" ON public.inventory
  FOR SELECT USING (public.get_user_role() IN ('manager', 'admin'));

CREATE POLICY "Managers and admins can view stock movements" ON public.stock_movements
  FOR SELECT USING (public.get_user_role() IN ('manager', 'admin'));

-- Políticas para dados administrativos (apenas admins)
CREATE POLICY "Admins can manage suppliers" ON public.suppliers
  FOR ALL USING (public.get_user_role() = 'admin');

CREATE POLICY "Admins can manage warehouses" ON public.warehouses
  FOR ALL USING (public.get_user_role() = 'admin');

CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL USING (public.get_user_role() = 'admin');

CREATE POLICY "Admins can manage materials" ON public.materials
  FOR ALL USING (public.get_user_role() = 'admin');

CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL USING (public.get_user_role() = 'admin');

-- =============================================
-- TRIGGERS PARA AUDITORIA E AUTOMAÇÃO
-- =============================================

-- Trigger para atualizar updated_at
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_materials_updated_at
  BEFORE UPDATE ON public.materials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON public.suppliers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_warehouses_updated_at
  BEFORE UPDATE ON public.warehouses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_requests_updated_at
  BEFORE UPDATE ON public.requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_request_items_updated_at
  BEFORE UPDATE ON public.request_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at
  BEFORE UPDATE ON public.inventory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Função para gerar número de requisição automaticamente
CREATE OR REPLACE FUNCTION public.generate_request_number()
RETURNS TRIGGER AS $$
DECLARE
  year_part TEXT;
  sequence_part TEXT;
  next_number INTEGER;
BEGIN
  -- Obter ano atual
  year_part := EXTRACT(YEAR FROM now())::TEXT;
  
  -- Obter próximo número sequencial para o ano
  SELECT COALESCE(MAX(CAST(SUBSTRING(request_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.requests
  WHERE request_number LIKE 'REQ-' || year_part || '-%';
  
  -- Formatar número com zeros à esquerda
  sequence_part := LPAD(next_number::TEXT, 4, '0');
  
  -- Gerar número final
  NEW.request_number := 'REQ-' || year_part || '-' || sequence_part;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para gerar número de requisição
CREATE TRIGGER generate_request_number_trigger
  BEFORE INSERT ON public.requests
  FOR EACH ROW
  WHEN (NEW.request_number IS NULL OR NEW.request_number = '')
  EXECUTE FUNCTION public.generate_request_number();

-- Função para registrar mudanças de status
CREATE OR REPLACE FUNCTION public.log_request_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir histórico se o status mudou
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.request_status_history (
      request_id,
      status,
      changed_by_user_id,
      comment
    ) VALUES (
      NEW.id,
      NEW.status,
      auth.uid(),
      CASE 
        WHEN NEW.status = 'rejected' THEN NEW.rejection_reason
        ELSE NULL
      END
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para log de mudanças de status
CREATE TRIGGER log_request_status_change_trigger
  AFTER UPDATE ON public.requests
  FOR EACH ROW
  EXECUTE FUNCTION public.log_request_status_change();

-- =============================================
-- DADOS INICIAIS
-- =============================================

-- Categorias básicas
INSERT INTO public.categories (name, description) VALUES
  ('Anéis', 'Anéis diversos incluindo alianças e solitários'),
  ('Colares', 'Colares e correntes de diversos tamanhos'),
  ('Brincos', 'Brincos variados'),
  ('Pulseiras', 'Pulseiras e braceletes'),
  ('Relógios', 'Relógios masculinos e femininos'),
  ('Pingentes', 'Pingentes para colares');

-- Materiais básicos
INSERT INTO public.materials (name, description, price_multiplier) VALUES
  ('Ouro 18k', 'Ouro 18 quilates', 3.50),
  ('Prata 925', 'Prata de lei 925', 1.00),
  ('Titânio', 'Titânio cirúrgico', 1.20),
  ('Aço Inox', 'Aço inoxidável', 0.80),
  ('Ouro Branco 18k', 'Ouro branco 18 quilates', 3.80),
  ('Ouro Rose 18k', 'Ouro rosé 18 quilates', 3.60);

-- Armazém principal
INSERT INTO public.warehouses (name, location) VALUES
  ('Loja Principal', 'Centro da cidade'),
  ('Estoque Central', 'Depósito - Zona Industrial'),
  ('Loja Shopping', 'Shopping Center');

-- Fornecedores básicos
INSERT INTO public.suppliers (name, contact_person, email, phone) VALUES
  ('Joias Luxo LTDA', 'João Silva', 'contato@joiasluxo.com.br', '(11) 99999-9999'),
  ('Metais Preciosos SA', 'Maria Santos', 'vendas@metaispreciosos.com.br', '(11) 88888-8888'),
  ('Importadora Gemstone', 'Pedro Costa', 'pedro@gemstone.com.br', '(11) 77777-7777');