# 🚀 MANUAL DE DEPLOY E CONFIGURAÇÃO
**Guia Completo para Deploy em Produção**

---

## 📋 ÍNDICE
1. [Pré-requisitos](#pré-requisitos)
2. [Setup do Ambiente](#setup-do-ambiente)
3. [Configuração do Supabase](#configuração-do-supabase)
4. [Deploy Frontend](#deploy-frontend)
5. [Configuração de Domínio](#configuração-de-domínio)
6. [Monitoramento](#monitoramento)
7. [Manutenção](#manutenção)
8. [Backup e Recovery](#backup-e-recovery)

---

## ⚡ PRÉ-REQUISITOS

### Contas Necessárias
- ✅ **Supabase Account** (supabase.com)
- ✅ **Vercel Account** (vercel.com) ou **Netlify**
- ✅ **GitHub Account** (github.com)
- ✅ **Domínio próprio** (opcional, mas recomendado)

### Ferramentas Locais
```bash
# Node.js 18+
node --version
npm --version

# Git
git --version

# Supabase CLI
npm install -g supabase
supabase --version

# Vercel CLI (opcional)
npm install -g vercel
vercel --version
```

### Estrutura de Repositório
```
projeto/
├── src/                    # Código React
├── supabase/
│   ├── config.toml        # Configuração
│   ├── functions/         # Edge Functions
│   └── migrations/        # Migrations SQL
├── package.json
├── vite.config.ts
└── README.md
```

---

## 🏗️ SETUP DO AMBIENTE

### 1. Preparação do Repositório
```bash
# Clone o projeto
git clone https://github.com/seu-usuario/seu-projeto.git
cd seu-projeto

# Instalar dependências
npm install

# Verificar se tudo funciona localmente
npm run dev
```

### 2. Variáveis de Ambiente

#### Desenvolvimento (.env.local)
```bash
# Supabase
VITE_SUPABASE_URL=https://seu-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key

# Desenvolvimento
NODE_ENV=development
```

#### Produção (Configurado no Vercel/Netlify)
```bash
# Supabase Produção
VITE_SUPABASE_URL=https://projeto-prod.supabase.co
VITE_SUPABASE_ANON_KEY=anon-key-producao

# Produção
NODE_ENV=production
```

---

## 🛠️ CONFIGURAÇÃO DO SUPABASE

### 1. Criar Projeto de Produção

#### Via Dashboard
1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard)
2. Clique em "New Project"
3. Configure:
   - **Organization**: Sua organização
   - **Name**: `sistema-gestao-prod`
   - **Database Password**: Gere senha forte (salve no gerenciador)
   - **Region**: South America (São Paulo)
   - **Pricing Plan**: Pro (recomendado para produção)

#### Via CLI (Alternativo)
```bash
# Criar novo projeto
supabase projects create sistema-gestao-prod --org-id sua-org-id --region sa-east-1

# Conectar ao projeto local
supabase link --project-ref novo-project-id
```

### 2. Configurar Autenticação

#### Providers de Auth
```bash
# Dashboard > Authentication > Providers

✅ Email (habilitado)
✅ Google (opcional)
- Redirect URLs:
  - https://seu-dominio.com
  - https://seu-dominio.vercel.app
  - http://localhost:3000 (apenas dev)

# Site URL: https://seu-dominio.com
```

#### Configurações de Segurança
```sql
-- No SQL Editor, execute:

-- 1. Configurar JWT expiration (Dashboard > Settings > Auth)
-- JWT expiry: 3600 (1 hora)
-- Refresh token rotation: Enabled

-- 2. Configurar email templates (Dashboard > Auth > Email Templates)
-- Personalizar templates de confirmação e recuperação
```

### 3. Deploy do Banco de Dados

#### Executar Migrations
```bash
# Conectar ao projeto de produção
supabase link --project-ref projeto-prod-id

# Fazer push de todas as migrations
supabase db push

# Verificar se tudo foi aplicado
supabase db diff
```

#### Configurar Secrets
```bash
# Configurar secrets para Edge Functions
supabase secrets set OPENAI_API_KEY=sua-chave-openai
supabase secrets set WEBHOOK_SECRET=sua-chave-webhook
```

### 4. Deploy das Edge Functions

#### Deploy Automático
```bash
# Deploy todas as functions
supabase functions deploy

# Ou deploy individual
supabase functions deploy api-gateway
supabase functions deploy webhook-delivery
supabase functions deploy analytics-automation
supabase functions deploy audit-logger
supabase functions deploy api-docs-generator
supabase functions deploy import-products
```

#### Verificar Deploy
```bash
# Listar functions
supabase functions list

# Testar function
curl -X POST \
  https://projeto-id.supabase.co/functions/v1/api-gateway \
  -H 'Authorization: Bearer anon-key' \
  -H 'Content-Type: application/json'
```

### 5. Configurar Storage

#### Criar Buckets
```sql
-- No SQL Editor:

-- Bucket para imagens de produtos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true);

-- Políticas de storage
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product-images' AND 
  auth.role() = 'authenticated'
);
```

### 6. Configurar Dados Iniciais

#### Inserir Dados Básicos
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

-- Usuário admin inicial (substitua o email)
UPDATE public.profiles 
SET role = 'admin' 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email = 'seu-email-admin@empresa.com'
);
```

---

## 🌐 DEPLOY FRONTEND

### Opção A: Vercel (Recomendado)

#### Via Dashboard
1. Acesse [vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Conecte ao GitHub e selecione o repositório
4. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

#### Variáveis de Ambiente
```bash
# Em Vercel Dashboard > Project > Settings > Environment Variables

VITE_SUPABASE_URL=https://projeto-prod-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NODE_ENV=production
```

#### Via CLI
```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel

# Configurar produção
vercel --prod

# Configurar variáveis
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

### Opção B: Netlify

#### Via Dashboard
1. Acesse [netlify.com](https://netlify.com)
2. "New site from Git"
3. Conecte GitHub
4. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

#### Netlify CLI
```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

### Configurar Redirects

#### Vercel (vercel.json)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

#### Netlify (_redirects)
```bash
# Em public/_redirects
/*    /index.html   200
```

---

## 🔗 CONFIGURAÇÃO DE DOMÍNIO

### 1. Configurar Domínio Customizado

#### Vercel
```bash
# Via CLI
vercel domains add seu-dominio.com

# Ou via Dashboard:
# Project Settings > Domains > Add Domain
```

#### Configurar DNS
```bash
# Adicionar CNAME no seu provedor de DNS:
CNAME   @           cname.vercel-dns.com
CNAME   www         cname.vercel-dns.com

# Ou A records:
A       @           76.76.19.61
AAAA    @           2606:4700:10::6816:3b3d
```

### 2. Configurar SSL

#### Automático (Vercel/Netlify)
- SSL é configurado automaticamente
- Certificados Let's Encrypt renovou automaticamente

#### Verificar SSL
```bash
# Testar SSL
curl -I https://seu-dominio.com

# Verificar certificado
openssl s_client -connect seu-dominio.com:443 -servername seu-dominio.com
```

### 3. Atualizar URLs no Supabase

#### Auth URLs
```bash
# Dashboard > Authentication > URL Configuration
Site URL: https://seu-dominio.com
Redirect URLs:
- https://seu-dominio.com
- https://seu-dominio.com/auth/callback
```

#### CORS
```sql
-- Se necessário, configurar CORS personalizado
-- Dashboard > Settings > API > CORS
```

---

## 📊 MONITORAMENTO

### 1. Configurar Analytics

#### Vercel Analytics
```bash
# Instalar Vercel Analytics
npm install @vercel/analytics

# Em src/main.tsx
import { Analytics } from '@vercel/analytics/react'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Analytics />
  </React.StrictMode>
)
```

#### Google Analytics (Opcional)
```javascript
// Em index.html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### 2. Configurar Monitoring

#### Uptime Monitoring
```bash
# UptimeRobot, Pingdom, ou similar
# Configurar verificações:
- https://seu-dominio.com (a cada 5 min)
- https://projeto-id.supabase.co/health (API health)
```

#### Error Tracking (Sentry)
```bash
# Instalar Sentry
npm install @sentry/react @sentry/tracing

# Configurar em src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production"
});
```

### 3. Logs e Alertas

#### Supabase Logs
```bash
# Dashboard > Logs
- Database logs
- Auth logs  
- Edge Function logs
- Real-time logs

# Configurar alertas para:
- High error rate
- Slow queries
- Failed logins
```

#### Webhook de Alertas
```javascript
// Configurar webhook no Slack/Discord/Email
// Para alertas críticos do sistema
```

---

## 🔧 MANUTENÇÃO

### 1. Backup Automático

#### Supabase Backup
```bash
# Backups automáticos (Plano Pro):
- Point-in-time recovery: 7 dias
- Daily backups: 7 dias
- On-demand backups: Via dashboard

# Backup manual via CLI
supabase db dump --local > backup_$(date +%Y%m%d_%H%M%S).sql
```

#### Backup de Storage
```bash
# Script para backup de storage
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
supabase storage cp --recursive product-images/ ./backups/storage_$DATE/
```

### 2. Updates e Maintenance

#### Dependências
```bash
# Update semanal de dependências
npm update
npm audit fix

# Update major versions (com cuidado)
npm outdated
npm install package@latest
```

#### Database Maintenance
```sql
-- Limpeza mensal de logs antigos
DELETE FROM audit_logs WHERE created_at < now() - interval '6 months';
DELETE FROM api_requests WHERE created_at < now() - interval '3 months';

-- Reindex e vacuum
REINDEX DATABASE postgres;
VACUUM ANALYZE;

-- Verificar performance
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;
```

### 3. Health Checks

#### Script de Health Check
```bash
#!/bin/bash
# health-check.sh

echo "🔍 Verificando saúde do sistema..."

# Frontend
if curl -s https://seu-dominio.com > /dev/null; then
    echo "✅ Frontend: OK"
else
    echo "❌ Frontend: ERRO"
fi

# API Gateway
if curl -s https://projeto-id.supabase.co/functions/v1/api-gateway > /dev/null; then
    echo "✅ API Gateway: OK"
else
    echo "❌ API Gateway: ERRO"
fi

# Database
if psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Database: OK"
else
    echo "❌ Database: ERRO"
fi

echo "🏁 Verificação concluída"
```

---

## 🚨 BACKUP E RECOVERY

### 1. Estratégia de Backup

#### Backup Diário (Automático)
```bash
# Configurado no Supabase (Plano Pro)
- Database backup: Diário
- Point-in-time recovery: 7 dias
- Storage backup: Manual/Script
```

#### Backup Semanal (Manual)
```bash
#!/bin/bash
# backup-weekly.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/$DATE"

mkdir -p $BACKUP_DIR

echo "📦 Iniciando backup semanal..."

# Database
supabase db dump --local > $BACKUP_DIR/database.sql

# Storage
supabase storage cp --recursive product-images/ $BACKUP_DIR/storage/

# Configurações
cp supabase/config.toml $BACKUP_DIR/
cp -r supabase/functions/ $BACKUP_DIR/functions/

# Compactar
tar -czf backup_$DATE.tar.gz $BACKUP_DIR

echo "✅ Backup concluído: backup_$DATE.tar.gz"
```

### 2. Procedimento de Recovery

#### Recovery Completo
```bash
# 1. Criar novo projeto Supabase
supabase projects create sistema-gestao-recovery

# 2. Restaurar database
psql "postgresql://postgres:password@host:5432/postgres" < backup_database.sql

# 3. Deploy functions
supabase functions deploy

# 4. Restaurar storage
supabase storage cp --recursive backup_storage/ product-images/

# 5. Atualizar URLs no frontend
# Atualizar VITE_SUPABASE_URL com novo projeto

# 6. Deploy frontend
vercel --prod
```

#### Recovery Parcial (Dados específicos)
```sql
-- Restaurar tabela específica
\copy products FROM 'backup_products.csv' WITH CSV HEADER;

-- Restaurar dados de período específico
INSERT INTO orders SELECT * FROM backup_orders 
WHERE created_at >= '2024-01-01';
```

### 3. Teste de Recovery

#### Teste Mensal
```bash
#!/bin/bash
# test-recovery.sh

echo "🧪 Testando procedimento de recovery..."

# 1. Criar projeto de teste
PROJECT_ID=$(supabase projects create test-recovery --output json | jq -r .id)

# 2. Restaurar backup mais recente
LATEST_BACKUP=$(ls -t backup_*.tar.gz | head -1)
tar -xzf $LATEST_BACKUP

# 3. Aplicar backup
# ... procedimentos de recovery

# 4. Testar funcionalidades críticas
curl -X GET https://$PROJECT_ID.supabase.co/rest/v1/products

# 5. Cleanup
supabase projects delete $PROJECT_ID

echo "✅ Teste de recovery concluído"
```

---

## ⚡ OTIMIZAÇÕES DE PERFORMANCE

### 1. Frontend Optimizations

#### Vite Build Optimizations
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-accordion', '@radix-ui/react-alert-dialog'],
          charts: ['recharts'],
          supabase: ['@supabase/supabase-js']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false // Desabilitar em produção
  },
  server: {
    port: 3000
  }
})
```

#### React Optimizations
```typescript
// Lazy loading de rotas
const Products = lazy(() => import('./pages/Products'))
const Analytics = lazy(() => import('./pages/Analytics'))

// Memoization de componentes pesados
const ExpensiveComponent = memo(({ data }) => {
  return <div>{/* componente pesado */}</div>
})

// Virtual scrolling para listas grandes
import { FixedSizeList as List } from 'react-window'
```

### 2. Database Optimizations

#### Índices Estratégicos
```sql
-- Índices para queries mais comuns
CREATE INDEX CONCURRENTLY idx_products_search 
ON products USING gin(to_tsvector('portuguese', name));

CREATE INDEX CONCURRENTLY idx_orders_user_date 
ON orders(user_id, created_at DESC);

CREATE INDEX CONCURRENTLY idx_inventory_product_warehouse 
ON inventory(product_id, warehouse_id);
```

#### Query Optimizations
```sql
-- Evitar N+1 queries
-- ❌ Problemático
SELECT * FROM orders;
-- Para cada order: SELECT * FROM order_items WHERE order_id = ?

-- ✅ Otimizado
SELECT 
  o.*,
  json_agg(oi.*) as items
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id;
```

### 3. Edge Function Optimizations

#### Connection Pooling
```typescript
// Reutilizar conexão Supabase
const supabase = createClient(url, key) // Fora do handler

Deno.serve(async (req) => {
  // Usar a mesma instância
  const { data } = await supabase.from('table').select()
})
```

#### Caching
```typescript
// Cache simples em memory
const cache = new Map()

function getCachedData(key: string, ttl: number = 300000) {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data
  }
  return null
}
```

---

## 📋 CHECKLIST DE DEPLOY

### ✅ Pré-Deploy
- [ ] Código testado localmente
- [ ] Dependências atualizadas
- [ ] Variáveis de ambiente configuradas
- [ ] Migrations testadas
- [ ] Edge Functions funcionando
- [ ] Build de produção OK

### ✅ Deploy
- [ ] Projeto Supabase criado
- [ ] Database migrated
- [ ] Edge Functions deployed
- [ ] Storage configurado
- [ ] Dados iniciais inseridos
- [ ] Frontend deployed
- [ ] Domínio configurado
- [ ] SSL ativo

### ✅ Pós-Deploy
- [ ] Health checks passando
- [ ] Monitoramento configurado
- [ ] Backup automático ativo
- [ ] Alertas configurados
- [ ] Performance testada
- [ ] Documentação atualizada
- [ ] Equipe treinada

### ✅ Go-Live
- [ ] DNS propagado
- [ ] Certificado SSL válido
- [ ] Todas as funcionalidades testadas
- [ ] Usuários podem acessar
- [ ] Logs sem erros críticos
- [ ] Métricas normais

---

## 🎯 CONCLUSÃO

### ✅ Sistema em Produção
Com este manual, você tem um sistema **enterprise-grade** rodando em produção com:

- 🚀 **High Performance** - Otimizado para cargas reais
- 🔒 **Enterprise Security** - RLS + Audit + Monitoring
- 📈 **Scalable Architecture** - Pronto para crescimento
- 🔄 **Reliable Backup** - Recovery strategy completa
- 📊 **Full Monitoring** - Visibilidade total do sistema

### 🔮 Próximos Passos
- **Load Testing** - Testar com carga real
- **CDN Setup** - CloudFlare para performance global
- **Advanced Monitoring** - APM tools
- **CI/CD Pipeline** - Automação de deploy
- **Multi-environment** - Staging/QA environments

---

**🎉 Parabéns! Seu sistema está em produção e pronto para escalar!**