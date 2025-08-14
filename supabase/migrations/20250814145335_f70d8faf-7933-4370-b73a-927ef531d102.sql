-- Criar dados de demonstração para o dashboard

-- Inserir departamentos
INSERT INTO public.departments (id, name, description, budget_limit, active) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'Tecnologia da Informação', 'Departamento responsável pela infraestrutura tecnológica', 50000.00, true),
('550e8400-e29b-41d4-a716-446655440002', 'Recursos Humanos', 'Departamento de gestão de pessoas e recrutamento', 30000.00, true),
('550e8400-e29b-41d4-a716-446655440003', 'Marketing', 'Departamento de marketing e comunicação', 25000.00, true),
('550e8400-e29b-41d4-a716-446655440004', 'Financeiro', 'Departamento financeiro e contabilidade', 15000.00, true),
('550e8400-e29b-41d4-a716-446655440005', 'Vendas', 'Departamento de vendas e atendimento ao cliente', 40000.00, true);

-- Inserir perfis de usuários (simulando usuários já existentes)
INSERT INTO public.profiles (id, user_id, full_name, role, department_id, active) VALUES 
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440011', 'Ana Silva', 'manager', '550e8400-e29b-41d4-a716-446655440001', true),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440012', 'Carlos Santos', 'vendedora', '550e8400-e29b-41d4-a716-446655440005', true),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440013', 'Maria Oliveira', 'vendedora', '550e8400-e29b-41d4-a716-446655440003', true),
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440014', 'João Costa', 'vendedora', '550e8400-e29b-41d4-a716-446655440002', true),
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440015', 'Fernanda Lima', 'manager', '550e8400-e29b-41d4-a716-446655440004', true);

-- Inserir requisições com diferentes status
INSERT INTO public.requests (id, title, description, status, priority, requester_user_id, department_id, total_amount, created_at) VALUES 
-- Requisições pendentes (para aparecer no counter de pendentes)
('770e8400-e29b-41d4-a716-446655440001', 'Equipamentos de Informática', 'Solicitação de notebooks para equipe de desenvolvimento', 'pending_approval', 'high', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 15000.00, '2024-01-10 10:00:00'),
('770e8400-e29b-41d4-a716-446655440002', 'Material de Marketing', 'Impressão de materiais promocionais para feira', 'pending_approval', 'normal', '550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440003', 3500.00, '2024-01-12 14:30:00'),
('770e8400-e29b-41d4-a716-446655440003', 'Treinamento de Pessoal', 'Curso de capacitação para equipe de vendas', 'pending_approval', 'normal', '550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440002', 8000.00, '2024-01-13 09:15:00'),

-- Requisições aprovadas/completadas (para cálculo de gastos mensais)
('770e8400-e29b-41d4-a716-446655440004', 'Software de Contabilidade', 'Licenças do sistema de gestão financeira', 'approved', 'high', '550e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440004', 12000.00, '2024-01-05 11:20:00'),
('770e8400-e29b-41d4-a716-446655440005', 'Mobiliário de Escritório', 'Mesas e cadeiras para nova sala', 'completed', 'normal', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440005', 7500.00, '2024-01-08 16:45:00'),
('770e8400-e29b-41d4-a716-446655440006', 'Equipamento de Telecomunicações', 'Sistema de telefonia para call center', 'completed', 'high', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 22000.00, '2024-01-15 13:30:00'),

-- Requisições mais recentes (para aparecer na lista de recentes)
('770e8400-e29b-41d4-a716-446655440007', 'Campanha Publicitária Digital', 'Investimento em ads online para Q1', 'pending_approval', 'high', '550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440003', 18000.00, NOW() - INTERVAL '2 hours'),
('770e8400-e29b-41d4-a716-446655440008', 'Atualização de Infraestrutura', 'Servidores e equipamentos de rede', 'approved', 'high', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 35000.00, NOW() - INTERVAL '1 day'),
('770e8400-e29b-41d4-a716-446655440009', 'Programa de Benefícios', 'Implementação de vale-alimentação', 'pending_approval', 'normal', '550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440002', 25000.00, NOW() - INTERVAL '3 hours');

-- Inserir itens das requisições para cálculos corretos
INSERT INTO public.request_items (id, request_id, product_id, quantity, unit_price, total_price) VALUES 
-- Para as requisições que têm produtos
('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', (SELECT id FROM products LIMIT 1), 5, 3000.00, 15000.00),
('880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440004', (SELECT id FROM products LIMIT 1), 1, 12000.00, 12000.00),
('880e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440005', (SELECT id FROM products LIMIT 1), 3, 2500.00, 7500.00);

-- Atualizar alguns perfis para ter dados mais realistas
UPDATE public.profiles SET 
  budget_limit = 10000.00,
  position = 'Gerente de TI'
WHERE user_id = '550e8400-e29b-41d4-a716-446655440011';

UPDATE public.profiles SET 
  budget_limit = 5000.00,
  position = 'Vendedor Sênior'
WHERE user_id = '550e8400-e29b-41d4-a716-446655440012';

UPDATE public.profiles SET 
  budget_limit = 8000.00,
  position = 'Analista de Marketing'
WHERE user_id = '550e8400-e29b-41d4-a716-446655440013';