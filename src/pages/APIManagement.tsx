import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Server,
  Key,
  Activity,
  Shield,
  Code,
  Globe,
  Copy,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  MoreVertical,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  rate_limit: number;
  requests_count: number;
  last_used: string;
  status: 'active' | 'inactive' | 'expired';
  created_at: string;
  expires_at?: string;
}

interface APIEndpoint {
  id: string;
  path: string;
  method: string;
  description: string;
  status: 'active' | 'deprecated' | 'beta';
  requests_today: number;
  avg_response_time: number;
  error_rate: number;
  last_request: string;
}

interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive';
  deliveries_count: number;
  success_rate: number;
  last_delivery: string;
  created_at: string;
}

const APIManagement = () => {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  const [newKeyName, setNewKeyName] = useState('');
  const [selectedTab, setSelectedTab] = useState('overview');
  const { toast } = useToast();
  const { profile } = useAuth();

  useEffect(() => {
    loadAPIData();
  }, []);

  const loadAPIData = async () => {
    try {
      setLoading(true);
      
      // Simulated API data - in production this would come from api_management tables
      const mockApiKeys: APIKey[] = [
        {
          id: '1',
          name: 'Frontend App',
          key: 'pk_live_51234567890abcdef',
          permissions: ['read', 'write'],
          rate_limit: 1000,
          requests_count: 8432,
          last_used: new Date().toISOString(),
          status: 'active',
          created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
          expires_at: new Date(Date.now() + 86400000 * 365).toISOString()
        },
        {
          id: '2',
          name: 'Mobile App',
          key: 'pk_live_98765432101234567',
          permissions: ['read'],
          rate_limit: 500,
          requests_count: 2156,
          last_used: new Date(Date.now() - 3600000).toISOString(),
          status: 'active',
          created_at: new Date(Date.now() - 86400000 * 15).toISOString()
        },
        {
          id: '3',
          name: 'Integration Service',
          key: 'pk_test_11223344556677889',
          permissions: ['read', 'write', 'admin'],
          rate_limit: 2000,
          requests_count: 15678,
          last_used: new Date(Date.now() - 1800000).toISOString(),
          status: 'active',
          created_at: new Date(Date.now() - 86400000 * 7).toISOString()
        }
      ];

      const mockEndpoints: APIEndpoint[] = [
        {
          id: '1',
          path: '/api/v1/products',
          method: 'GET',
          description: 'Lista todos os produtos',
          status: 'active',
          requests_today: 1234,
          avg_response_time: 245,
          error_rate: 1.2,
          last_request: new Date().toISOString()
        },
        {
          id: '2',
          path: '/api/v1/orders',
          method: 'POST',
          description: 'Cria um novo pedido',
          status: 'active',
          requests_today: 456,
          avg_response_time: 678,
          error_rate: 2.8,
          last_request: new Date(Date.now() - 300000).toISOString()
        },
        {
          id: '3',
          path: '/api/v1/users',
          method: 'GET',
          description: 'Lista usuários (deprecated)',
          status: 'deprecated',
          requests_today: 23,
          avg_response_time: 156,
          error_rate: 0.5,
          last_request: new Date(Date.now() - 7200000).toISOString()
        },
        {
          id: '4',
          path: '/api/v2/analytics',
          method: 'GET',
          description: 'Dados de analytics (beta)',
          status: 'beta',
          requests_today: 89,
          avg_response_time: 423,
          error_rate: 5.1,
          last_request: new Date(Date.now() - 1800000).toISOString()
        }
      ];

      const mockWebhooks: WebhookEndpoint[] = [
        {
          id: '1',
          name: 'Order Updates',
          url: 'https://example.com/webhooks/orders',
          events: ['order.created', 'order.updated', 'order.completed'],
          status: 'active',
          deliveries_count: 1567,
          success_rate: 98.5,
          last_delivery: new Date().toISOString(),
          created_at: new Date(Date.now() - 86400000 * 20).toISOString()
        },
        {
          id: '2',
          name: 'User Events',
          url: 'https://crm.company.com/api/users',
          events: ['user.created', 'user.updated'],
          status: 'active',
          deliveries_count: 234,
          success_rate: 100,
          last_delivery: new Date(Date.now() - 3600000).toISOString(),
          created_at: new Date(Date.now() - 86400000 * 10).toISOString()
        },
        {
          id: '3',
          name: 'Inventory Alerts',
          url: 'https://inventory.company.com/webhook',
          events: ['inventory.low_stock', 'inventory.out_of_stock'],
          status: 'inactive',
          deliveries_count: 89,
          success_rate: 94.2,
          last_delivery: new Date(Date.now() - 86400000).toISOString(),
          created_at: new Date(Date.now() - 86400000 * 5).toISOString()
        }
      ];

      setApiKeys(mockApiKeys);
      setEndpoints(mockEndpoints);
      setWebhooks(mockWebhooks);
    } catch (error) {
      console.error('Error loading API data:', error);
      toast({
        title: "Erro ao carregar dados da API",
        description: "Não foi possível carregar os dados de gerenciamento da API",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateApiKey = async () => {
    if (!newKeyName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, insira um nome para a chave de API",
        variant: "destructive",
      });
      return;
    }

    try {
      const newKey: APIKey = {
        id: Date.now().toString(),
        name: newKeyName,
        key: `pk_live_${Math.random().toString(36).substr(2, 20)}`,
        permissions: ['read'],
        rate_limit: 1000,
        requests_count: 0,
        last_used: '',
        status: 'active',
        created_at: new Date().toISOString()
      };

      setApiKeys([...apiKeys, newKey]);
      setNewKeyName('');
      
      toast({
        title: "Chave criada",
        description: "Nova chave de API foi gerada com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro ao criar chave",
        description: "Não foi possível gerar a nova chave de API",
        variant: "destructive",
      });
    }
  };

  const revokeApiKey = async (keyId: string) => {
    try {
      setApiKeys(apiKeys.map(key => 
        key.id === keyId ? { ...key, status: 'inactive' as const } : key
      ));
      
      toast({
        title: "Chave revogada",
        description: "A chave de API foi revogada com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro ao revogar chave",
        description: "Não foi possível revogar a chave de API",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "Chave copiada para a área de transferência",
    });
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowApiKey(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'expired': return 'destructive';
      case 'deprecated': return 'destructive';
      case 'beta': return 'outline';
      default: return 'secondary';
    }
  };

  const getMethodBadgeVariant = (method: string) => {
    switch (method) {
      case 'GET': return 'default';
      case 'POST': return 'default';
      case 'PUT': return 'outline';
      case 'DELETE': return 'destructive';
      default: return 'secondary';
    }
  };

  if (profile?.role !== 'admin') {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Acesso Restrito</h3>
            <p className="text-muted-foreground">
              Apenas administradores podem gerenciar APIs
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
            <Server className="w-12 h-12 animate-pulse mx-auto mb-4 text-primary" />
            <p className="text-lg font-medium">Carregando gerenciamento de API...</p>
            <p className="text-sm text-muted-foreground">Analisando endpoints e configurações</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gerenciamento de API</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie chaves de API, endpoints e integrações
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Chaves Ativas</p>
                <p className="text-2xl font-bold">
                  {apiKeys.filter(key => key.status === 'active').length}
                </p>
              </div>
              <Key className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Requests Hoje</p>
                <p className="text-2xl font-bold">
                  {endpoints.reduce((sum, endpoint) => sum + endpoint.requests_today, 0).toLocaleString()}
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Endpoints Ativos</p>
                <p className="text-2xl font-bold">
                  {endpoints.filter(ep => ep.status === 'active').length}
                </p>
              </div>
              <Globe className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Erro</p>
                <p className="text-2xl font-bold text-orange-600">
                  {(endpoints.reduce((sum, ep) => sum + ep.error_rate, 0) / endpoints.length).toFixed(1)}%
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="keys">Chaves de API</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Uso da API por Endpoint
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {endpoints.slice(0, 5).map((endpoint) => (
                    <div key={endpoint.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={getMethodBadgeVariant(endpoint.method)}>
                          {endpoint.method}
                        </Badge>
                        <span className="text-sm font-mono">{endpoint.path}</span>
                      </div>
                      <span className="text-sm font-medium">
                        {endpoint.requests_today} req
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Performance dos Endpoints
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {endpoints.slice(0, 5).map((endpoint) => (
                    <div key={endpoint.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-mono">{endpoint.path}</span>
                        <span className="text-sm text-muted-foreground">
                          {endpoint.avg_response_time}ms
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-secondary rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${Math.min(endpoint.avg_response_time / 10, 100)}%` }}
                          />
                        </div>
                        <span className={`text-xs ${
                          endpoint.error_rate > 5 ? 'text-red-500' : 
                          endpoint.error_rate > 2 ? 'text-orange-500' : 'text-green-500'
                        }`}>
                          {endpoint.error_rate}% erro
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="keys" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Chaves de API
              </CardTitle>
              <CardDescription>
                Gerencie chaves de API para autenticação de aplicações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Nome da nova chave de API..."
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>
                <Button onClick={generateApiKey} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Gerar Chave
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Chave</TableHead>
                    <TableHead>Permissões</TableHead>
                    <TableHead>Rate Limit</TableHead>
                    <TableHead>Requests</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Último Uso</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell className="font-medium">{key.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-sm bg-secondary px-2 py-1 rounded">
                            {showApiKey[key.id] ? key.key : '••••••••••••••••'}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleKeyVisibility(key.id)}
                          >
                            {showApiKey[key.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(key.key)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {key.permissions.map((perm) => (
                            <Badge key={perm} variant="outline" className="text-xs">
                              {perm}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{key.rate_limit}/h</TableCell>
                      <TableCell>{key.requests_count.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(key.status)}>
                          {key.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {key.last_used ? format(new Date(key.last_used), 'dd/MM/yyyy HH:mm') : 'Nunca'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => revokeApiKey(key.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Endpoints da API
              </CardTitle>
              <CardDescription>
                Monitore performance e uso dos endpoints
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requests Hoje</TableHead>
                    <TableHead>Tempo Resposta</TableHead>
                    <TableHead>Taxa de Erro</TableHead>
                    <TableHead>Último Request</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {endpoints.map((endpoint) => (
                    <TableRow key={endpoint.id}>
                      <TableCell>
                        <div>
                          <p className="font-mono text-sm">{endpoint.path}</p>
                          <p className="text-xs text-muted-foreground">
                            {endpoint.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getMethodBadgeVariant(endpoint.method)}>
                          {endpoint.method}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(endpoint.status)}>
                          {endpoint.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{endpoint.requests_today.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={`${
                          endpoint.avg_response_time > 1000 ? 'text-red-600' :
                          endpoint.avg_response_time > 500 ? 'text-orange-600' : 'text-green-600'
                        }`}>
                          {endpoint.avg_response_time}ms
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`${
                          endpoint.error_rate > 5 ? 'text-red-600' :
                          endpoint.error_rate > 2 ? 'text-orange-600' : 'text-green-600'
                        }`}>
                          {endpoint.error_rate}%
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(endpoint.last_request), 'dd/MM/yyyy HH:mm')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Webhooks
              </CardTitle>
              <CardDescription>
                Configure webhooks para notificações em tempo real
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-6">
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Novo Webhook
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Eventos</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Entregas</TableHead>
                    <TableHead>Taxa de Sucesso</TableHead>
                    <TableHead>Última Entrega</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhooks.map((webhook) => (
                    <TableRow key={webhook.id}>
                      <TableCell className="font-medium">{webhook.name}</TableCell>
                      <TableCell>
                        <code className="text-sm bg-secondary px-2 py-1 rounded">
                          {webhook.url}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {webhook.events.map((event) => (
                            <Badge key={event} variant="outline" className="text-xs">
                              {event}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(webhook.status)}>
                          {webhook.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{webhook.deliveries_count.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={`${
                          webhook.success_rate < 90 ? 'text-red-600' :
                          webhook.success_rate < 95 ? 'text-orange-600' : 'text-green-600'
                        }`}>
                          {webhook.success_rate}%
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(webhook.last_delivery), 'dd/MM/yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default APIManagement;