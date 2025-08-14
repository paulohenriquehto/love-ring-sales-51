# 🚀 TUTORIAL COMPLETO - RECRIAÇÃO DO SISTEMA DO ZERO

## 📋 ÍNDICE
1. [Visão Geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Configuração do Supabase](#configuração-do-supabase)
4. [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
5. [Edge Functions](#edge-functions)
6. [Configuração Frontend](#configuração-frontend)
7. [Testes e Validação](#testes-e-validação)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 VISÃO GERAL

Este é um **Sistema Empresarial Avançado** de gestão de produtos, pedidos e requisições com:

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Autenticação**: Multi-role com RLS (Row Level Security)
- **Features**: Analytics, Auditoria, API Gateway, Webhooks, Workflows

---

## ⚙️ PRÉ-REQUISITOS

### Ferramentas Necessárias
```bash
# Node.js 18+
node --version
npm --version

# Supabase CLI
npm install -g supabase
supabase --version

# Git
git --version
```

### Contas Necessárias
- **Supabase Account** (supabase.com)
- **GitHub/GitLab** (para deploy automático)

---

## 🏗️ CONFIGURAÇÃO DO SUPABASE

### Passo 1: Criar Projeto Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Clique em "New Project"
3. Configure:
   - **Name**: Sistema-Gestao-Empresarial
   - **Database Password**: Anote com segurança
   - **Region**: South America (São Paulo)

### Passo 2: Configurar Autenticação
```sql
-- No SQL Editor do Supabase, execute:

-- 1. Habilitar providers de autenticação
-- Dashboard > Authentication > Providers
-- ✅ Email
-- ✅ Google (opcional)

-- 2. Configurar URL de redirect
-- Dashboard > Authentication > URL Configuration
-- Site URL: http://localhost:3000
-- Redirect URLs: http://localhost:3000, https://seu-dominio.com
```

### Passo 3: Configurar Storage
```sql
-- No SQL Editor:
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true);
```

---

## 🗄️ ESTRUTURA DO BANCO DE DADOS

### Passo 1: Criar Enums e Tipos
```sql
-- Tipos customizados
CREATE TYPE public.request_status AS ENUM (
  'draft', 'pending_approval', 'approved', 'rejected', 'completed', 'cancelled'
);

CREATE TYPE public.request_priority AS ENUM (
  'low', 'normal', 'high', 'urgent'
);

CREATE TYPE public.movement_type AS ENUM (
  'in', 'out', 'adjustment', 'transfer'
);
```

### Passo 2: Tabelas Principais (Execute em ordem)

#### 1. Perfis e Departamentos
```sql
-- Perfis de usuário
CREATE TABLE public.profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'vendedora',
  department_id uuid,
  position text,
  budget_limit numeric,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Departamentos
CREATE TABLE public.departments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  manager_user_id uuid,
  budget_limit numeric,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

#### 2. Sistema de Produtos
```sql
-- Categorias
CREATE TABLE public.categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  parent_category_id uuid REFERENCES public.categories(id),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Fornecedores
CREATE TABLE public.suppliers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  contact_person text,
  phone text,
  email text,
  address text,
  cnpj text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Materiais
CREATE TABLE public.materials (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  price_multiplier numeric DEFAULT 1.00,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Produtos
CREATE TABLE public.products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  sku text,
  base_price numeric NOT NULL,
  category_id uuid REFERENCES public.categories(id),
  supplier_id uuid REFERENCES public.suppliers(id),
  weight numeric,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Variações de Produtos
CREATE TABLE public.product_variants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES public.products(id),
  sku_variant text,
  size text,
  color text,
  width text,
  material_id uuid REFERENCES public.materials(id),
  price_adjustment numeric DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Imagens de Produtos
CREATE TABLE public.product_images (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES public.products(id),
  variant_id uuid REFERENCES public.product_variants(id),
  image_url text NOT NULL,
  alt_text text,
  is_primary boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

#### 3. Sistema de Estoque
```sql
-- Armazéns
CREATE TABLE public.warehouses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  location text,
  manager_user_id uuid,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Inventário
CREATE TABLE public.inventory (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES public.products(id),
  variant_id uuid REFERENCES public.product_variants(id),
  warehouse_id uuid NOT NULL REFERENCES public.warehouses(id),
  quantity_available integer NOT NULL DEFAULT 0,
  quantity_reserved integer NOT NULL DEFAULT 0,
  quantity_total integer,
  minimum_stock integer DEFAULT 0,
  maximum_stock integer,
  last_count_date date,
  last_movement_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Movimentações de Estoque
CREATE TABLE public.stock_movements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES public.products(id),
  variant_id uuid REFERENCES public.product_variants(id),
  warehouse_id uuid NOT NULL REFERENCES public.warehouses(id),
  movement_type movement_type NOT NULL,
  quantity integer NOT NULL,
  quantity_before integer NOT NULL,
  quantity_after integer NOT NULL,
  unit_cost numeric,
  total_cost numeric,
  reference_type text,
  reference_id uuid,
  notes text,
  performed_by_user_id uuid NOT NULL,
  movement_date timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
```

#### 4. Sistema de Pedidos
```sql
-- Pedidos
CREATE TABLE public.orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number text,
  user_id uuid NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  customer_cpf text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  delivery_method text NOT NULL DEFAULT 'pickup',
  subtotal numeric NOT NULL DEFAULT 0,
  discount numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  payment_method text,
  installments integer DEFAULT 1,
  installment_value numeric DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Itens dos Pedidos
CREATE TABLE public.order_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES public.orders(id),
  product_id uuid NOT NULL REFERENCES public.products(id),
  variant_id uuid REFERENCES public.product_variants(id),
  product_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL,
  total_price numeric NOT NULL,
  size text,
  width text,
  material text,
  engraving_text text,
  engraving_font text,
  engraving_symbols jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

#### 5. Sistema de Requisições
```sql
-- Requisições
CREATE TABLE public.requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  request_number text NOT NULL DEFAULT '',
  title text NOT NULL,
  description text,
  justification text,
  notes text,
  requester_user_id uuid NOT NULL,
  department_id uuid REFERENCES public.departments(id),
  warehouse_id uuid REFERENCES public.warehouses(id),
  status request_status NOT NULL DEFAULT 'draft',
  priority request_priority NOT NULL DEFAULT 'normal',
  total_amount numeric DEFAULT 0,
  approved_amount numeric,
  approved_by_user_id uuid,
  approved_at timestamptz,
  delivery_date_requested date,
  delivery_date_confirmed date,
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Itens das Requisições
CREATE TABLE public.request_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id uuid NOT NULL REFERENCES public.requests(id),
  product_id uuid NOT NULL REFERENCES public.products(id),
  variant_id uuid REFERENCES public.product_variants(id),
  quantity integer NOT NULL,
  unit_price numeric NOT NULL,
  total_price numeric,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

#### 6. Sistema de Analytics
```sql
-- Métricas de Analytics
CREATE TABLE public.analytics_metrics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_type text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  value numeric NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Top Produtos Vendidos
CREATE TABLE public.top_selling_products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES public.products(id),
  period_start date NOT NULL,
  period_end date NOT NULL,
  total_quantity integer NOT NULL DEFAULT 0,
  total_revenue numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

#### 7. Sistema de Auditoria
```sql
-- Logs de Auditoria
CREATE TABLE public.audit_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  details jsonb DEFAULT '{}',
  severity text NOT NULL DEFAULT 'info',
  status text NOT NULL DEFAULT 'success',
  ip_address inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Eventos de Segurança
CREATE TABLE public.security_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  event_type text NOT NULL,
  description text NOT NULL,
  risk_level text NOT NULL DEFAULT 'low',
  metadata jsonb DEFAULT '{}',
  resolved boolean NOT NULL DEFAULT false,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

#### 8. Sistema de API Management
```sql
-- Chaves de API
CREATE TABLE public.api_keys (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  key_hash text NOT NULL,
  permissions jsonb NOT NULL DEFAULT '[]',
  rate_limit integer DEFAULT 1000,
  active boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  last_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Requisições de API
CREATE TABLE public.api_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key_id uuid REFERENCES public.api_keys(id),
  method text NOT NULL,
  endpoint text NOT NULL,
  status_code integer NOT NULL,
  response_time_ms integer,
  request_size integer,
  response_size integer,
  ip_address inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

#### 9. Sistema de Webhooks
```sql
-- Webhooks
CREATE TABLE public.webhooks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  url text NOT NULL,
  events text[] NOT NULL DEFAULT '{}',
  secret text,
  active boolean NOT NULL DEFAULT true,
  created_by_user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Entregas de Webhooks
CREATE TABLE public.webhook_deliveries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_id uuid NOT NULL REFERENCES public.webhooks(id),
  event text NOT NULL,
  payload jsonb,
  success boolean NOT NULL DEFAULT false,
  status_code integer NOT NULL,
  response_time_ms integer,
  error_message text,
  delivered_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
```

#### 10. Sistema de Workflows
```sql
-- Workflows
CREATE TABLE public.workflows (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  trigger_type text NOT NULL DEFAULT 'manual',
  steps jsonb NOT NULL DEFAULT '[]',
  status text NOT NULL DEFAULT 'active',
  created_by_user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Execuções de Workflows
CREATE TABLE public.workflow_executions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id uuid NOT NULL REFERENCES public.workflows(id),
  started_by_user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  current_step integer NOT NULL DEFAULT 0,
  total_steps integer NOT NULL DEFAULT 0,
  execution_data jsonb DEFAULT '{}',
  error_message text,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);
```

#### 11. Sistema de Gravação
```sql
-- Categorias de Gravação
CREATE TABLE public.engraving_categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  icon text,
  image_url text,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Símbolos de Gravação
CREATE TABLE public.engraving_symbols (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id uuid NOT NULL REFERENCES public.engraving_categories(id),
  name text NOT NULL,
  unicode_char text,
  svg_content text,
  icon_path text,
  image_url text,
  price_adjustment numeric DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Configuração de Gravação por Produto
CREATE TABLE public.product_engraving_config (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES public.products(id),
  supports_engraving boolean NOT NULL DEFAULT false,
  max_characters integer NOT NULL DEFAULT 30,
  available_fonts text[] DEFAULT ARRAY['arial', 'poiret', 'josefin', 'cinzel', 'handlee', 'tangerine', 'reenie', 'annie'],
  price_adjustment numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Fontes Customizadas
CREATE TABLE public.custom_fonts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  font_family text NOT NULL,
  google_fonts_url text NOT NULL,
  css_class_name text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

#### 12. Sistema de Importação
```sql
-- Logs de Importação
CREATE TABLE public.import_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  filename text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  total_products integer NOT NULL DEFAULT 0,
  processed_products integer NOT NULL DEFAULT 0,
  success_count integer NOT NULL DEFAULT 0,
  error_count integer NOT NULL DEFAULT 0,
  mapping_config jsonb,
  error_log jsonb DEFAULT '[]',
  success_log jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

### Passo 3: Funções do Banco
```sql
-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Função para gerar número de pedido
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS text AS $$
DECLARE
  next_number INTEGER;
  order_number TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(orders.order_number FROM '[0-9]+') AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.orders
  WHERE orders.order_number IS NOT NULL;
  
  order_number := 'PED-' || LPAD(next_number::TEXT, 6, '0');
  RETURN order_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Função para gerar SKU de variante
CREATE OR REPLACE FUNCTION public.generate_variant_sku()
RETURNS TRIGGER AS $$
DECLARE
  base_sku TEXT;
  variant_suffix TEXT := '';
BEGIN
  SELECT sku INTO base_sku FROM public.products WHERE id = NEW.product_id;
  
  IF NEW.size IS NOT NULL THEN
    variant_suffix := variant_suffix || '-' || UPPER(NEW.size);
  END IF;
  
  IF NEW.color IS NOT NULL THEN
    variant_suffix := variant_suffix || '-' || UPPER(REPLACE(NEW.color, ' ', ''));
  END IF;
  
  IF NEW.material_id IS NOT NULL THEN
    variant_suffix := variant_suffix || '-' || (
      SELECT UPPER(SUBSTRING(name FROM 1 FOR 3)) 
      FROM public.materials 
      WHERE id = NEW.material_id
    );
  END IF;
  
  NEW.sku_variant := COALESCE(base_sku, 'PROD') || variant_suffix;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Função para criar inventário para variante
CREATE OR REPLACE FUNCTION public.create_inventory_for_variant()
RETURNS TRIGGER AS $$
DECLARE
  warehouse_record RECORD;
BEGIN
  FOR warehouse_record IN 
    SELECT id FROM public.warehouses WHERE active = true
  LOOP
    INSERT INTO public.inventory (
      product_id,
      variant_id,
      warehouse_id,
      quantity_available,
      quantity_reserved,
      minimum_stock
    ) VALUES (
      NEW.product_id,
      NEW.id,
      warehouse_record.id,
      0,
      0,
      5
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Função para log de auditoria
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_action text,
  p_resource_type text,
  p_resource_id uuid DEFAULT NULL,
  p_details jsonb DEFAULT '{}',
  p_severity text DEFAULT 'info'
)
RETURNS uuid AS $$
DECLARE
  audit_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    details,
    severity,
    ip_address
  ) VALUES (
    auth.uid(),
    p_action,
    p_resource_type,
    p_resource_id,
    p_details,
    p_severity,
    inet_client_addr()
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Função para verificar se produto pode ser deletado
CREATE OR REPLACE FUNCTION public.can_delete_product(product_id uuid)
RETURNS boolean AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.order_items 
    WHERE order_items.product_id = can_delete_product.product_id
  ) THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Função para deletar produto em cascata
CREATE OR REPLACE FUNCTION public.delete_product_cascade(product_id uuid)
RETURNS boolean AS $$
BEGIN
  IF NOT public.can_delete_product(product_id) THEN
    RAISE EXCEPTION 'Cannot delete product: it exists in order history';
  END IF;
  
  PERFORM public.log_audit_event(
    'delete',
    'product',
    product_id,
    jsonb_build_object('action', 'physical_delete'),
    'warning'
  );
  
  DELETE FROM public.inventory WHERE inventory.product_id = delete_product_cascade.product_id;
  DELETE FROM public.product_images WHERE product_images.product_id = delete_product_cascade.product_id;
  DELETE FROM public.product_engraving_config WHERE product_engraving_config.product_id = delete_product_cascade.product_id;
  DELETE FROM public.product_variants WHERE product_variants.product_id = delete_product_cascade.product_id;
  DELETE FROM public.products WHERE products.id = delete_product_cascade.product_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Função para lidar com novo usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'vendedora')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Função para definir role admin para email específico
CREATE OR REPLACE FUNCTION public.set_admin_role_for_specific_email()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.email = 'paulohenriquehto28@gmail.com' THEN
        UPDATE public.profiles 
        SET role = 'admin' 
        WHERE user_id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Função para definir número do pedido
CREATE OR REPLACE FUNCTION public.set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := public.generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Função para trigger de webhooks de pedido
CREATE OR REPLACE FUNCTION public.trigger_order_webhooks()
RETURNS TRIGGER AS $$
DECLARE
  event_name TEXT;
  webhook_payload JSONB;
BEGIN
  IF TG_OP = 'INSERT' THEN
    event_name := 'order.created';
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    event_name := 'order.updated';
    IF NEW.status = 'completed' THEN
      event_name := 'order.completed';
    ELSIF NEW.status = 'cancelled' THEN
      event_name := 'order.cancelled';
    END IF;
  ELSE
    RETURN COALESCE(NEW, OLD);
  END IF;

  webhook_payload := jsonb_build_object(
    'order_id', COALESCE(NEW.id, OLD.id),
    'order_number', COALESCE(NEW.order_number, OLD.order_number),
    'status', COALESCE(NEW.status, OLD.status),
    'total', COALESCE(NEW.total, OLD.total),
    'customer_email', COALESCE(NEW.customer_email, OLD.customer_email),
    'event_timestamp', now()
  );

  PERFORM net.http_post(
    url := (SELECT CONCAT(current_setting('app.supabase_url'), '/functions/v1/webhook-delivery')),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', CONCAT('Bearer ', current_setting('app.supabase_service_role_key'))
    ),
    body := jsonb_build_object(
      'event', event_name,
      'data', webhook_payload,
      'source', 'database_trigger'
    )
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';
```

### Passo 4: Triggers
```sql
-- Trigger para updated_at em todas as tabelas relevantes
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON public.suppliers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_materials_updated_at
  BEFORE UPDATE ON public.materials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_warehouses_updated_at
  BEFORE UPDATE ON public.warehouses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at
  BEFORE UPDATE ON public.inventory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_requests_updated_at
  BEFORE UPDATE ON public.requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_request_items_updated_at
  BEFORE UPDATE ON public.request_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_analytics_metrics_updated_at
  BEFORE UPDATE ON public.analytics_metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_webhooks_updated_at
  BEFORE UPDATE ON public.webhooks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workflows_updated_at
  BEFORE UPDATE ON public.workflows
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_engraving_categories_updated_at
  BEFORE UPDATE ON public.engraving_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_engraving_symbols_updated_at
  BEFORE UPDATE ON public.engraving_symbols
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_engraving_config_updated_at
  BEFORE UPDATE ON public.product_engraving_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_custom_fonts_updated_at
  BEFORE UPDATE ON public.custom_fonts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_import_logs_updated_at
  BEFORE UPDATE ON public.import_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Triggers específicos
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER set_admin_role_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.set_admin_role_for_specific_email();

CREATE TRIGGER generate_variant_sku_trigger
  BEFORE INSERT OR UPDATE ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION public.generate_variant_sku();

CREATE TRIGGER create_inventory_trigger
  AFTER INSERT ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION public.create_inventory_for_variant();

CREATE TRIGGER set_order_number_trigger
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_order_number();

CREATE TRIGGER trigger_order_webhooks_insert
  AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.trigger_order_webhooks();

CREATE TRIGGER trigger_order_webhooks_update
  AFTER UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.trigger_order_webhooks();
```

---

## 🔐 ROW LEVEL SECURITY (RLS)

### Passo 1: Habilitar RLS
```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.top_selling_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engraving_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engraving_symbols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_engraving_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_fonts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_logs ENABLE ROW LEVEL SECURITY;
```

### Passo 2: Políticas RLS
```sql
-- Profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Departments
CREATE POLICY "Everyone can view departments" ON public.departments
  FOR SELECT USING (true);

-- Categories
CREATE POLICY "Everyone can view active categories" ON public.categories
  FOR SELECT USING (active = true);

CREATE POLICY "Admins and managers can manage categories" ON public.categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Suppliers
CREATE POLICY "Admins and managers can manage suppliers" ON public.suppliers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Materials
CREATE POLICY "Everyone can view active materials" ON public.materials
  FOR SELECT USING (active = true);

CREATE POLICY "Admins and managers can manage materials" ON public.materials
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Products
CREATE POLICY "Everyone can view active products" ON public.products
  FOR SELECT USING (active = true);

CREATE POLICY "Admins and managers can manage products" ON public.products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Product Variants
CREATE POLICY "Everyone can view active variants" ON public.product_variants
  FOR SELECT USING (active = true);

CREATE POLICY "Admins and managers can manage product variants" ON public.product_variants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Product Images
CREATE POLICY "Everyone can view product images" ON public.product_images
  FOR SELECT USING (true);

CREATE POLICY "Admins and managers can manage product images" ON public.product_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Warehouses
CREATE POLICY "Admins and managers can manage warehouses" ON public.warehouses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Inventory
CREATE POLICY "Admins and managers can manage inventory" ON public.inventory
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Stock Movements
CREATE POLICY "Admins and managers can manage stock movements" ON public.stock_movements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Orders
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins and managers can view all orders" ON public.orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins and managers can update orders" ON public.orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Order Items
CREATE POLICY "Users can view their own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create order items for their orders" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins and managers can view all order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Requests
CREATE POLICY "Users can view own requests" ON public.requests
  FOR SELECT USING (requester_user_id = auth.uid());

CREATE POLICY "Users can create own requests" ON public.requests
  FOR INSERT WITH CHECK (requester_user_id = auth.uid());

CREATE POLICY "Users can update own requests in editable status" ON public.requests
  FOR UPDATE USING (
    requester_user_id = auth.uid() AND 
    status IN ('draft', 'rejected')
  );

CREATE POLICY "Users can delete own draft requests" ON public.requests
  FOR DELETE USING (
    requester_user_id = auth.uid() AND 
    status = 'draft'
  );

-- Request Items
CREATE POLICY "Users can create request items for their own requests" ON public.request_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.requests
      WHERE requests.id = request_items.request_id AND requests.requester_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update request items for their own requests" ON public.request_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.requests
      WHERE requests.id = request_items.request_id AND requests.requester_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete request items for their own requests" ON public.request_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.requests
      WHERE requests.id = request_items.request_id AND requests.requester_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins and managers can manage all request items" ON public.request_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Analytics Metrics
CREATE POLICY "Admin/Manager can view analytics metrics" ON public.analytics_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admin/Manager can manage analytics metrics" ON public.analytics_metrics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Top Selling Products
CREATE POLICY "Admin/Manager can view top selling products" ON public.top_selling_products
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Audit Logs
CREATE POLICY "Admin can view audit logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Security Events
CREATE POLICY "Admin can view security events" ON public.security_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- API Keys
CREATE POLICY "Admin can manage API keys" ON public.api_keys
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- API Requests
CREATE POLICY "Admin can view API requests" ON public.api_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Webhooks
CREATE POLICY "Admin can manage webhooks" ON public.webhooks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Webhook Deliveries
CREATE POLICY "Admin can view webhook deliveries" ON public.webhook_deliveries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Workflows
CREATE POLICY "Admin/Manager can manage workflows" ON public.workflows
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Workflow Executions
CREATE POLICY "Admin/Manager can view workflow executions" ON public.workflow_executions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Engraving Categories
CREATE POLICY "Everyone can view active categories" ON public.engraving_categories
  FOR SELECT USING (active = true);

CREATE POLICY "Admins and managers can manage categories" ON public.engraving_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Engraving Symbols
CREATE POLICY "Everyone can view active symbols" ON public.engraving_symbols
  FOR SELECT USING (active = true);

CREATE POLICY "Admins and managers can manage symbols" ON public.engraving_symbols
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Product Engraving Config
CREATE POLICY "Everyone can view engraving configurations" ON public.product_engraving_config
  FOR SELECT USING (true);

CREATE POLICY "Admins and managers can manage engraving configurations" ON public.product_engraving_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Custom Fonts
CREATE POLICY "Everyone can view active fonts" ON public.custom_fonts
  FOR SELECT USING (active = true);

CREATE POLICY "Admins and managers can manage fonts" ON public.custom_fonts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Import Logs
CREATE POLICY "Users can view their own import logs" ON public.import_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own import logs" ON public.import_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own import logs" ON public.import_logs
  FOR UPDATE USING (auth.uid() = user_id);
```

---

## 🔧 EDGE FUNCTIONS

### Configuração no supabase/config.toml
```toml
project_id = "SEU_PROJECT_ID"

[api]
enabled = true
port = 54321
schemas = ["public", "graphql_public"]
extra_search_path = ["public", "extensions"]
max_rows = 1000

[db]
port = 54322

[studio]
enabled = true
port = 54323
api_url = "http://127.0.0.1:54321"

[inbucket]
enabled = true
port = 54324
smtp_port = 54325
pop3_port = 54326

[storage]
enabled = true
port = 54327
file_size_limit = "50MiB"

[auth]
enabled = true
port = 54328
site_url = "http://127.0.0.1:3000"
additional_redirect_urls = ["https://127.0.0.1:3000"]
jwt_expiry = 3600
refresh_token_rotation_enabled = true
refresh_token_reuse_interval = 10
enable_signup = true

[auth.email]
enable_signup = true
double_confirm_changes = true
enable_confirmations = false

[functions.api-gateway]
verify_jwt = false

[functions.webhook-delivery]
verify_jwt = false

[functions.api-docs-generator]
verify_jwt = false
```

### Passo 1: Criar Edge Functions
Consulte o arquivo `GUIA_EDGE_FUNCTIONS.md` para implementação completa.

---

## 🎨 CONFIGURAÇÃO FRONTEND

### Passo 1: Clonar e Instalar Dependências
```bash
git clone SEU_REPOSITORIO
cd SEU_PROJETO
npm install
```

### Passo 2: Configurar Variáveis de Ambiente
```bash
# .env.local
VITE_SUPABASE_URL=https://seu-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
```

### Passo 3: Atualizar src/integrations/supabase/client.ts
```typescript
const SUPABASE_URL = "https://seu-project-id.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sua-anon-key";
```

---

## ✅ TESTES E VALIDAÇÃO

### Passo 1: Testar Autenticação
1. Acesse `/auth`
2. Registre um novo usuário
3. Verifique se o perfil foi criado automaticamente
4. Teste login/logout

### Passo 2: Testar Funcionalidades Principais
1. **Produtos**: Criar, editar, listar
2. **Pedidos**: Criar pedido completo
3. **Requisições**: Workflow completo
4. **Analytics**: Verificar dados

### Passo 3: Verificar Permissões
1. Teste com usuário vendedora
2. Teste com usuário admin
3. Verifique RLS funcionando

---

## 🚨 TROUBLESHOOTING

### Problemas Comuns

#### 1. Erro de RLS - "new row violates row-level security policy"
```sql
-- Verifique se o usuário está autenticado
SELECT auth.uid();

-- Verifique políticas RLS
SELECT * FROM pg_policies WHERE tablename = 'NOME_DA_TABELA';
```

#### 2. Edge Functions não funcionam
```bash
# Verificar logs
supabase functions logs NOME_DA_FUNCAO

# Testar localmente
supabase functions serve
```

#### 3. Triggers não disparam
```sql
-- Verificar se triggers existem
SELECT * FROM pg_trigger WHERE tgname LIKE '%NOME_TRIGGER%';

-- Recriar trigger se necessário
DROP TRIGGER IF EXISTS nome_trigger ON tabela;
CREATE TRIGGER nome_trigger...
```

#### 4. Problemas de Storage
```sql
-- Verificar buckets
SELECT * FROM storage.buckets;

-- Verificar políticas de storage
SELECT * FROM storage.policies;
```

---

## 📝 DADOS INICIAIS

### Inserir Dados Básicos
```sql
-- Departamento padrão
INSERT INTO public.departments (name, description, active) 
VALUES ('Vendas', 'Departamento de vendas', true);

-- Armazém padrão
INSERT INTO public.warehouses (name, location, active) 
VALUES ('Armazém Principal', 'São Paulo - SP', true);

-- Categorias básicas
INSERT INTO public.categories (name, description, active) 
VALUES 
  ('Anéis', 'Anéis diversos', true),
  ('Colares', 'Colares e correntes', true),
  ('Brincos', 'Brincos diversos', true);

-- Materiais básicos
INSERT INTO public.materials (name, description, price_multiplier, active) 
VALUES 
  ('Ouro', 'Ouro 18k', 2.5, true),
  ('Prata', 'Prata 925', 1.2, true),
  ('Titânio', 'Titânio cirúrgico', 1.0, true);

-- Fontes para gravação
INSERT INTO public.custom_fonts (name, font_family, google_fonts_url, css_class_name, active) 
VALUES 
  ('Arial', 'Arial, sans-serif', '', 'font-arial', true),
  ('Poiret One', 'Poiret One', 'https://fonts.googleapis.com/css2?family=Poiret+One&display=swap', 'font-poiret', true);

-- Categoria de gravação
INSERT INTO public.engraving_categories (name, description, active) 
VALUES ('Símbolos', 'Símbolos para gravação', true);
```

---

## 🔄 BACKUP E RESTORE

### Backup Completo
```bash
# Via Supabase CLI
supabase db dump --local > backup_$(date +%Y%m%d_%H%M%S).sql

# Via pg_dump (se tiver acesso direto)
pg_dump "postgresql://postgres:password@host:5432/postgres" > backup.sql
```

### Restore
```bash
# Via Supabase CLI
supabase db reset
supabase db push

# Via psql
psql "sua-connection-string" < backup.sql
```

---

## 🎯 CHECKLIST FINAL

### ✅ Banco de Dados
- [ ] 30 tabelas criadas
- [ ] 11 funções implementadas
- [ ] Triggers configurados
- [ ] RLS habilitado em todas as tabelas
- [ ] Políticas RLS configuradas
- [ ] Dados iniciais inseridos

### ✅ Edge Functions
- [ ] api-gateway configurado
- [ ] webhook-delivery implementado
- [ ] audit-logger funcionando
- [ ] analytics-automation ativo
- [ ] api-docs-generator operacional
- [ ] import-products configurado

### ✅ Frontend
- [ ] Dependências instaladas
- [ ] Variáveis de ambiente configuradas
- [ ] Autenticação funcionando
- [ ] Todas as páginas carregando
- [ ] Permissões testadas

### ✅ Testes
- [ ] Registro de usuário
- [ ] Login/logout
- [ ] Criação de produtos
- [ ] Criação de pedidos
- [ ] Workflow de requisições
- [ ] Analytics funcionando
- [ ] API Gateway testado

---

## 📞 SUPORTE

Para dúvidas ou problemas:

1. **Logs do Supabase**: Dashboard > Logs
2. **Logs das Edge Functions**: Dashboard > Functions > [função] > Logs  
3. **Console do Browser**: F12 > Console
4. **Network Tab**: F12 > Network

---

🎉 **PARABÉNS!** Se chegou até aqui, seu sistema está 100% funcional e pronto para uso!