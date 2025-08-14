-- Limpar dados e inserir corretamente

-- Primeiro, inserir departamentos
INSERT INTO public.departments (id, name, description, budget_limit, active) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'Tecnologia da Informação', 'Departamento responsável pela infraestrutura tecnológica', 50000.00, true),
('550e8400-e29b-41d4-a716-446655440002', 'Recursos Humanos', 'Departamento de gestão de pessoas e recrutamento', 30000.00, true),
('550e8400-e29b-41d4-a716-446655440003', 'Marketing', 'Departamento de marketing e comunicação', 25000.00, true),
('550e8400-e29b-41d4-a716-446655440004', 'Financeiro', 'Departamento financeiro e contabilidade', 15000.00, true),
('550e8400-e29b-41d4-a716-446655440005', 'Vendas', 'Departamento de vendas e atendimento ao cliente', 40000.00, true)
ON CONFLICT (id) DO NOTHING;

-- Atualizar perfil existente
UPDATE public.profiles SET 
  department_id = '550e8400-e29b-41d4-a716-446655440001',
  position = 'Administrador do Sistema',
  budget_limit = 15000.00
WHERE role = 'admin';

-- Inserir requisições com request_number únicos
DO $$
DECLARE
    existing_user_id UUID;
BEGIN
    SELECT user_id INTO existing_user_id FROM profiles LIMIT 1;
    
    IF existing_user_id IS NOT NULL THEN
        INSERT INTO public.requests (id, title, description, status, priority, requester_user_id, department_id, total_amount, request_number, created_at) VALUES 
        -- Requisições pendentes
        ('770e8400-e29b-41d4-a716-446655440001', 'Equipamentos de Informática', 'Solicitação de notebooks para equipe de desenvolvimento', 'pending_approval', 'high', existing_user_id, '550e8400-e29b-41d4-a716-446655440001', 15000.00, 'REQ-001', CURRENT_DATE - INTERVAL '2 days'),
        ('770e8400-e29b-41d4-a716-446655440002', 'Material de Marketing', 'Impressão de materiais promocionais para feira', 'pending_approval', 'normal', existing_user_id, '550e8400-e29b-41d4-a716-446655440003', 3500.00, 'REQ-002', CURRENT_DATE - INTERVAL '1 day'),
        ('770e8400-e29b-41d4-a716-446655440003', 'Treinamento de Pessoal', 'Curso de capacitação para equipe de vendas', 'pending_approval', 'normal', existing_user_id, '550e8400-e29b-41d4-a716-446655440002', 8000.00, 'REQ-003', CURRENT_DATE),
        
        -- Requisições aprovadas/completadas para gastos mensais
        ('770e8400-e29b-41d4-a716-446655440004', 'Software de Contabilidade', 'Licenças do sistema de gestão financeira', 'approved', 'high', existing_user_id, '550e8400-e29b-41d4-a716-446655440004', 12000.00, 'REQ-004', CURRENT_DATE - INTERVAL '10 days'),
        ('770e8400-e29b-41d4-a716-446655440005', 'Mobiliário de Escritório', 'Mesas e cadeiras para nova sala', 'completed', 'normal', existing_user_id, '550e8400-e29b-41d4-a716-446655440005', 7500.00, 'REQ-005', CURRENT_DATE - INTERVAL '5 days'),
        ('770e8400-e29b-41d4-a716-446655440006', 'Equipamento de Telecomunicações', 'Sistema de telefonia para call center', 'completed', 'high', existing_user_id, '550e8400-e29b-41d4-a716-446655440001', 22000.00, 'REQ-006', CURRENT_DATE - INTERVAL '3 days'),
        
        -- Requisições recentes
        ('770e8400-e29b-41d4-a716-446655440007', 'Campanha Publicitária Digital', 'Investimento em ads online para Q1', 'pending_approval', 'high', existing_user_id, '550e8400-e29b-41d4-a716-446655440003', 18000.00, 'REQ-007', NOW() - INTERVAL '2 hours'),
        ('770e8400-e29b-41d4-a716-446655440008', 'Atualização de Infraestrutura', 'Servidores e equipamentos de rede', 'approved', 'high', existing_user_id, '550e8400-e29b-41d4-a716-446655440001', 35000.00, 'REQ-008', NOW() - INTERVAL '1 day'),
        ('770e8400-e29b-41d4-a716-446655440009', 'Programa de Benefícios', 'Implementação de vale-alimentação', 'pending_approval', 'normal', existing_user_id, '550e8400-e29b-41d4-a716-446655440002', 25000.00, 'REQ-009', NOW() - INTERVAL '3 hours')
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;