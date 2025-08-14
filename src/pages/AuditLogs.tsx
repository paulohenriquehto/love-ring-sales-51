import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { 
  Shield, 
  Search, 
  Filter, 
  Download, 
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Activity,
  Database,
  Lock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: any;
  ip_address: string;
  user_agent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'success' | 'failed' | 'warning';
  created_at: string;
}

interface SecurityEvent {
  id: string;
  event_type: 'login_attempt' | 'permission_denied' | 'data_access' | 'config_change';
  user_id: string;
  description: string;
  risk_level: 'low' | 'medium' | 'high';
  created_at: string;
}

const AuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const { toast } = useToast();
  const { profile } = useAuth();

  useEffect(() => {
    loadAuditLogs();
    loadSecurityEvents();
  }, [searchTerm, severityFilter, actionFilter, dateRange]);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      
      // Simulated audit logs - in production this would come from audit_logs table
      const mockLogs: AuditLog[] = [
        {
          id: '1',
          user_id: 'user1',
          user_name: 'João Silva',
          action: 'CREATE',
          resource_type: 'product',
          resource_id: 'prod123',
          details: { name: 'Anel de Ouro', price: 1500.00 },
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0...',
          severity: 'low',
          status: 'success',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          user_id: 'user2',
          user_name: 'Maria Santos',
          action: 'UPDATE',
          resource_type: 'user',
          resource_id: 'user456',
          details: { field: 'role', old_value: 'vendedora', new_value: 'manager' },
          ip_address: '192.168.1.101',
          user_agent: 'Mozilla/5.0...',
          severity: 'high',
          status: 'success',
          created_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: '3',
          user_id: 'user3',
          user_name: 'Carlos Oliveira',
          action: 'DELETE',
          resource_type: 'order',
          resource_id: 'ord789',
          details: { reason: 'Customer cancellation' },
          ip_address: '192.168.1.102',
          user_agent: 'Mozilla/5.0...',
          severity: 'medium',
          status: 'failed',
          created_at: new Date(Date.now() - 7200000).toISOString()
        },
        {
          id: '4',
          user_id: 'user1',
          user_name: 'João Silva',
          action: 'LOGIN',
          resource_type: 'auth',
          resource_id: 'session123',
          details: { method: 'password' },
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0...',
          severity: 'low',
          status: 'success',
          created_at: new Date(Date.now() - 10800000).toISOString()
        },
        {
          id: '5',
          user_id: 'user4',
          user_name: 'Ana Costa',
          action: 'EXPORT',
          resource_type: 'report',
          resource_id: 'rep456',
          details: { type: 'financial_report', period: '2024-01' },
          ip_address: '192.168.1.103',
          user_agent: 'Mozilla/5.0...',
          severity: 'medium',
          status: 'success',
          created_at: new Date(Date.now() - 14400000).toISOString()
        }
      ];

      setLogs(mockLogs);
    } catch (error) {
      console.error('Error loading audit logs:', error);
      toast({
        title: "Erro ao carregar logs",
        description: "Não foi possível carregar os logs de auditoria",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSecurityEvents = async () => {
    try {
      // Simulated security events
      const mockEvents: SecurityEvent[] = [
        {
          id: '1',
          event_type: 'login_attempt',
          user_id: 'user1',
          description: 'Multiple failed login attempts detected',
          risk_level: 'medium',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          event_type: 'permission_denied',
          user_id: 'user2',
          description: 'Access denied to admin panel',
          risk_level: 'low',
          created_at: new Date(Date.now() - 1800000).toISOString()
        },
        {
          id: '3',
          event_type: 'config_change',
          user_id: 'user3',
          description: 'Security settings modified',
          risk_level: 'high',
          created_at: new Date(Date.now() - 3600000).toISOString()
        }
      ];

      setSecurityEvents(mockEvents);
    } catch (error) {
      console.error('Error loading security events:', error);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.resource_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    return matchesSearch && matchesSeverity && matchesAction;
  });

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return CheckCircle;
      case 'failed': return XCircle;
      case 'warning': return AlertTriangle;
      default: return Clock;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'login': return User;
      case 'create': return Database;
      case 'update': return Activity;
      case 'delete': return XCircle;
      case 'export': return Download;
      default: return Activity;
    }
  };

  const exportAuditReport = async () => {
    try {
      const csvData = filteredLogs.map(log => 
        `${format(new Date(log.created_at), 'dd/MM/yyyy HH:mm')},${log.user_name},${log.action},${log.resource_type},${log.severity},${log.status}`
      ).join('\n');
      
      const csvContent = `Data,Usuário,Ação,Recurso,Severidade,Status\n${csvData}`;
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Relatório exportado",
        description: "O relatório de auditoria foi baixado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível gerar o relatório",
        variant: "destructive",
      });
    }
  };

  if (profile?.role !== 'admin') {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Lock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Acesso Restrito</h3>
            <p className="text-muted-foreground">
              Apenas administradores podem visualizar logs de auditoria
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Shield className="w-12 h-12 animate-pulse mx-auto mb-4 text-primary" />
            <p className="text-lg font-medium">Carregando logs de auditoria...</p>
            <p className="text-sm text-muted-foreground">Analisando registros de segurança</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Logs de Auditoria</h1>
          <p className="text-muted-foreground mt-2">
            Rastreamento completo de atividades e eventos de segurança
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={exportAuditReport} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar Relatório
          </Button>
        </div>
      </div>

      {/* Security Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Eventos</p>
                <p className="text-2xl font-bold">{logs.length}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Eventos Críticos</p>
                <p className="text-2xl font-bold text-red-600">
                  {logs.filter(log => log.severity === 'critical' || log.severity === 'high').length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Falhas</p>
                <p className="text-2xl font-bold text-orange-600">
                  {logs.filter(log => log.status === 'failed').length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sucessos</p>
                <p className="text-2xl font-bold text-green-600">
                  {logs.filter(log => log.status === 'success').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Eventos de Segurança Recentes
          </CardTitle>
          <CardDescription>
            Alertas e eventos de segurança detectados automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {securityEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`w-5 h-5 ${
                    event.risk_level === 'high' ? 'text-red-500' :
                    event.risk_level === 'medium' ? 'text-orange-500' : 'text-yellow-500'
                  }`} />
                  <div>
                    <p className="font-medium">{event.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(event.created_at), 'dd/MM/yyyy HH:mm')}
                    </p>
                  </div>
                </div>
                <Badge variant={event.risk_level === 'high' ? 'destructive' : 'outline'}>
                  {event.risk_level}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Logs de Atividade
          </CardTitle>
          <CardDescription>
            Histórico detalhado de todas as ações realizadas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por usuário, ação ou recurso..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por severidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as severidades</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="critical">Crítica</SelectItem>
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as ações</SelectItem>
                <SelectItem value="CREATE">Criação</SelectItem>
                <SelectItem value="UPDATE">Atualização</SelectItem>
                <SelectItem value="DELETE">Exclusão</SelectItem>
                <SelectItem value="LOGIN">Login</SelectItem>
                <SelectItem value="EXPORT">Exportação</SelectItem>
              </SelectContent>
            </Select>
            <DatePickerWithRange 
              value={dateRange} 
              onChange={setDateRange}
            />
          </div>

          {filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <Eye className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Nenhum log encontrado</h3>
              <p className="text-muted-foreground">
                Tente ajustar os filtros para ver mais resultados
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Recurso</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Severidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => {
                  const StatusIcon = getStatusIcon(log.status);
                  const ActionIcon = getActionIcon(log.action);
                  return (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">
                        {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm')}
                      </TableCell>
                      <TableCell className="font-medium">{log.user_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ActionIcon className="w-4 h-4" />
                          {log.action}
                        </div>
                      </TableCell>
                      <TableCell>{log.resource_type}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {log.ip_address}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getSeverityBadgeVariant(log.severity)}>
                          {log.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`w-4 h-4 ${
                            log.status === 'success' ? 'text-green-500' :
                            log.status === 'failed' ? 'text-red-500' : 'text-orange-500'
                          }`} />
                          {log.status}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogs;