import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  GitBranch,
  Play,
  Pause,
  Plus,
  Settings,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Calendar,
  MoreVertical,
  Filter,
  Search,
  ArrowRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'draft';
  trigger_type: 'manual' | 'automatic' | 'scheduled';
  created_by: string;
  created_at: string;
  steps: WorkflowStep[];
  executions_count: number;
  success_rate: number;
}

interface WorkflowStep {
  id: string;
  name: string;
  type: 'approval' | 'notification' | 'action' | 'condition';
  order: number;
  config: any;
  assignee?: string;
}

interface WorkflowExecution {
  id: string;
  workflow_id: string;
  workflow_name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  current_step: number;
  total_steps: number;
  started_by: string;
  started_at: string;
  completed_at?: string;
  data: any;
}

const Workflows = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTab, setSelectedTab] = useState('workflows');
  const { toast } = useToast();
  const { profile } = useAuth();

  useEffect(() => {
    loadWorkflows();
    loadExecutions();
  }, []);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      
      // Simulated workflows data - in production this would come from workflows table
      const mockWorkflows: Workflow[] = [
        {
          id: '1',
          name: 'Aprovação de Requisições',
          description: 'Fluxo de aprovação para requisições de materiais',
          status: 'active',
          trigger_type: 'automatic',
          created_by: 'admin',
          created_at: new Date().toISOString(),
          steps: [
            { id: 's1', name: 'Análise Inicial', type: 'approval', order: 1, config: {}, assignee: 'manager' },
            { id: 's2', name: 'Verificação de Orçamento', type: 'condition', order: 2, config: {} },
            { id: 's3', name: 'Aprovação Final', type: 'approval', order: 3, config: {}, assignee: 'admin' },
            { id: 's4', name: 'Notificação', type: 'notification', order: 4, config: {} }
          ],
          executions_count: 45,
          success_rate: 91.1
        },
        {
          id: '2',
          name: 'Onboarding de Usuários',
          description: 'Processo automatizado de integração de novos usuários',
          status: 'active',
          trigger_type: 'automatic',
          created_by: 'admin',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          steps: [
            { id: 's5', name: 'Criação de Perfil', type: 'action', order: 1, config: {} },
            { id: 's6', name: 'Envio de Credenciais', type: 'notification', order: 2, config: {} },
            { id: 's7', name: 'Treinamento', type: 'action', order: 3, config: {} }
          ],
          executions_count: 12,
          success_rate: 100
        },
        {
          id: '3',
          name: 'Processamento de Pedidos',
          description: 'Automação do fluxo de processamento de pedidos',
          status: 'active',
          trigger_type: 'automatic',
          created_by: 'manager',
          created_at: new Date(Date.now() - 172800000).toISOString(),
          steps: [
            { id: 's8', name: 'Validação', type: 'condition', order: 1, config: {} },
            { id: 's9', name: 'Reserva de Estoque', type: 'action', order: 2, config: {} },
            { id: 's10', name: 'Cobrança', type: 'action', order: 3, config: {} },
            { id: 's11', name: 'Confirmação', type: 'notification', order: 4, config: {} }
          ],
          executions_count: 234,
          success_rate: 97.4
        },
        {
          id: '4',
          name: 'Backup Diário',
          description: 'Processo automatizado de backup dos dados',
          status: 'active',
          trigger_type: 'scheduled',
          created_by: 'admin',
          created_at: new Date(Date.now() - 259200000).toISOString(),
          steps: [
            { id: 's12', name: 'Backup Database', type: 'action', order: 1, config: {} },
            { id: 's13', name: 'Backup Files', type: 'action', order: 2, config: {} },
            { id: 's14', name: 'Verificação', type: 'condition', order: 3, config: {} },
            { id: 's15', name: 'Relatório', type: 'notification', order: 4, config: {} }
          ],
          executions_count: 30,
          success_rate: 96.7
        }
      ];

      setWorkflows(mockWorkflows);
    } catch (error) {
      console.error('Error loading workflows:', error);
      toast({
        title: "Erro ao carregar workflows",
        description: "Não foi possível carregar os workflows",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadExecutions = async () => {
    try {
      // Simulated executions data
      const mockExecutions: WorkflowExecution[] = [
        {
          id: 'exec1',
          workflow_id: '1',
          workflow_name: 'Aprovação de Requisições',
          status: 'in_progress',
          current_step: 2,
          total_steps: 4,
          started_by: 'João Silva',
          started_at: new Date().toISOString(),
          data: { request_id: 'req123', amount: 5000 }
        },
        {
          id: 'exec2',
          workflow_id: '3',
          workflow_name: 'Processamento de Pedidos',
          status: 'completed',
          current_step: 4,
          total_steps: 4,
          started_by: 'Maria Santos',
          started_at: new Date(Date.now() - 3600000).toISOString(),
          completed_at: new Date(Date.now() - 1800000).toISOString(),
          data: { order_id: 'ord456', total: 1200 }
        },
        {
          id: 'exec3',
          workflow_id: '2',
          workflow_name: 'Onboarding de Usuários',
          status: 'pending',
          current_step: 1,
          total_steps: 3,
          started_by: 'Carlos Oliveira',
          started_at: new Date(Date.now() - 7200000).toISOString(),
          data: { user_id: 'user789', email: 'novo@empresa.com' }
        },
        {
          id: 'exec4',
          workflow_id: '4',
          workflow_name: 'Backup Diário',
          status: 'completed',
          current_step: 4,
          total_steps: 4,
          started_by: 'Sistema',
          started_at: new Date(Date.now() - 86400000).toISOString(),
          completed_at: new Date(Date.now() - 86100000).toISOString(),
          data: { backup_size: '2.3GB', status: 'success' }
        },
        {
          id: 'exec5',
          workflow_id: '1',
          workflow_name: 'Aprovação de Requisições',
          status: 'failed',
          current_step: 3,
          total_steps: 4,
          started_by: 'Ana Costa',
          started_at: new Date(Date.now() - 10800000).toISOString(),
          data: { request_id: 'req124', error: 'Orçamento insuficiente' }
        }
      ];

      setExecutions(mockExecutions);
    } catch (error) {
      console.error('Error loading executions:', error);
    }
  };

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || workflow.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'draft': return 'outline';
      case 'completed': return 'default';
      case 'in_progress': return 'default';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      case 'cancelled': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'in_progress': return Clock;
      case 'pending': return AlertCircle;
      case 'failed': return XCircle;
      case 'cancelled': return XCircle;
      default: return Clock;
    }
  };

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'manual': return User;
      case 'scheduled': return Calendar;
      default: return GitBranch;
    }
  };

  const createNewWorkflow = () => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "O designer de workflows estará disponível em breve",
    });
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <GitBranch className="w-12 h-12 animate-pulse mx-auto mb-4 text-primary" />
            <p className="text-lg font-medium">Carregando workflows...</p>
            <p className="text-sm text-muted-foreground">Analisando fluxos de trabalho</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Workflows e Automação</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie fluxos de trabalho automatizados e aprovações
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={createNewWorkflow} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Novo Workflow
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Workflows Ativos</p>
                <p className="text-2xl font-bold">
                  {workflows.filter(w => w.status === 'active').length}
                </p>
              </div>
              <GitBranch className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Execuções Hoje</p>
                <p className="text-2xl font-bold">
                  {executions.filter(e => 
                    new Date(e.started_at).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
              <Play className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
                <p className="text-2xl font-bold text-orange-600">
                  {executions.filter(e => e.status === 'in_progress' || e.status === 'pending').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
                <p className="text-2xl font-bold text-green-600">
                  {((executions.filter(e => e.status === 'completed').length / executions.length) * 100).toFixed(1)}%
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="executions">Execuções</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="w-5 h-5" />
                Workflows Configurados
              </CardTitle>
              <CardDescription>
                Gerencie e configure fluxos de trabalho automatizados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Buscar workflows..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                    <SelectItem value="draft">Rascunho</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Trigger</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Execuções</TableHead>
                    <TableHead>Taxa de Sucesso</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWorkflows.map((workflow) => {
                    const TriggerIcon = getTriggerIcon(workflow.trigger_type);
                    return (
                      <TableRow key={workflow.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{workflow.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {workflow.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <TriggerIcon className="w-4 h-4" />
                            {workflow.trigger_type}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(workflow.status)}>
                            {workflow.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{workflow.executions_count}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={workflow.success_rate} className="w-16 h-2" />
                            <span className="text-sm">
                              {workflow.success_rate.toFixed(1)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(workflow.created_at), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Settings className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="executions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                Execuções de Workflows
              </CardTitle>
              <CardDescription>
                Acompanhe o progresso das execuções em tempo real
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Workflow</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progresso</TableHead>
                    <TableHead>Iniciado por</TableHead>
                    <TableHead>Iniciado em</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {executions.map((execution) => {
                    const StatusIcon = getStatusIcon(execution.status);
                    const progress = (execution.current_step / execution.total_steps) * 100;
                    
                    return (
                      <TableRow key={execution.id}>
                        <TableCell className="font-medium">
                          {execution.workflow_name}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <StatusIcon className={`w-4 h-4 ${
                              execution.status === 'completed' ? 'text-green-500' :
                              execution.status === 'failed' ? 'text-red-500' :
                              execution.status === 'in_progress' ? 'text-blue-500' : 'text-orange-500'
                            }`} />
                            <Badge variant={getStatusBadgeVariant(execution.status)}>
                              {execution.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Progress value={progress} className="flex-1 h-2" />
                              <span className="text-sm text-muted-foreground">
                                {execution.current_step}/{execution.total_steps}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {progress.toFixed(0)}% concluído
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{execution.started_by}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(execution.started_at), 'dd/MM/yyyy HH:mm')}
                        </TableCell>
                        <TableCell className="text-sm">
                          {execution.completed_at ? (
                            `${Math.round((new Date(execution.completed_at).getTime() - new Date(execution.started_at).getTime()) / 60000)}min`
                          ) : (
                            `${Math.round((Date.now() - new Date(execution.started_at).getTime()) / 60000)}min`
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Workflows;