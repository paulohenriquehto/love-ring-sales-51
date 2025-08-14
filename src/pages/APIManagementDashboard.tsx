import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Server,
  Key,
  Activity,
  Globe,
  Copy,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  AlertTriangle,
  BarChart3,
  Loader2,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  FileText,
  Monitor
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAPIManagement } from '@/hooks/useAPIManagement';
import { format } from 'date-fns';
import { toast } from 'sonner';

const APIManagementDashboard = () => {
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyPermissions, setNewKeyPermissions] = useState<string[]>(['read']);
  const [newKeyRateLimit, setNewKeyRateLimit] = useState(1000);
  const [newWebhookName, setNewWebhookName] = useState('');
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [newWebhookEvents, setNewWebhookEvents] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isCreateKeyOpen, setIsCreateKeyOpen] = useState(false);
  const [isCreateWebhookOpen, setIsCreateWebhookOpen] = useState(false);
  const { profile } = useAuth();
  
  const { 
    apiKeys, 
    requestStats, 
    webhooks, 
    isLoading, 
    createAPIKey, 
    revokeAPIKey,
    createWebhook,
    toggleWebhookStatus
  } = useAPIManagement();

  const availableEvents = [
    'order.created',
    'order.updated', 
    'order.completed',
    'order.cancelled',
    'user.created',
    'user.updated',
    'product.created',
    'product.updated',
    'inventory.low_stock',
    'inventory.out_of_stock'
  ];

  const gatewayUrl = 'https://fvjowvxlqqmvwkqqqxsb.supabase.co/functions/v1/api-gateway';
  const docsUrl = 'https://fvjowvxlqqmvwkqqqxsb.supabase.co/functions/v1/api-docs-generator';

  const handleCreateAPIKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('Nome da chave é obrigatório');
      return;
    }

    try {
      const result = await createAPIKey.mutateAsync({
        name: newKeyName,
        permissions: newKeyPermissions,
        rateLimit: newKeyRateLimit
      });

      if (result.plain_key) {
        navigator.clipboard.writeText(result.plain_key);
        toast.success(`Chave criada! Copiada para área de transferência: ${result.plain_key.substring(0, 20)}...`);
      }

      setNewKeyName('');
      setNewKeyPermissions(['read']);
      setNewKeyRateLimit(1000);
      setIsCreateKeyOpen(false);
    } catch (error) {
      toast.error('Erro ao criar chave de API');
    }
  };

  const handleCreateWebhook = async () => {
    if (!newWebhookName.trim() || !newWebhookUrl.trim() || newWebhookEvents.length === 0) {
      toast.error('Todos os campos são obrigatórios');
      return;
    }

    try {
      await createWebhook.mutateAsync({
        name: newWebhookName,
        url: newWebhookUrl,
        events: newWebhookEvents
      });

      setNewWebhookName('');
      setNewWebhookUrl('');
      setNewWebhookEvents([]);
      setIsCreateWebhookOpen(false);
    } catch (error) {
      toast.error('Erro ao criar webhook');
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    try {
      await revokeAPIKey.mutateAsync(keyId);
    } catch (error) {
      toast.error('Erro ao revogar chave');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para área de transferência');
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowApiKey(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const getStatusBadgeVariant = (status: boolean) => {
    return status ? 'default' : 'secondary';
  };

  const handlePermissionToggle = (permission: string) => {
    setNewKeyPermissions(prev => 
      prev.includes(permission) 
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  const handleEventToggle = (event: string) => {
    setNewWebhookEvents(prev => 
      prev.includes(event) 
        ? prev.filter(e => e !== event)
        : [...prev, event]
    );
  };

  if (profile?.role !== 'admin') {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Server className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Acesso Restrito</h3>
            <p className="text-muted-foreground">
              Apenas administradores podem gerenciar APIs
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
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
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Server className="h-8 w-8" />
            API Management Console
          </h1>
          <p className="text-muted-foreground mt-2">
            Complete API gateway with real-time monitoring and enterprise features
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => window.open(docsUrl, '_blank')}
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            API Docs
            <ExternalLink className="w-3 h-3" />
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.open(docsUrl + '?format=html', '_blank')}
            className="flex items-center gap-2"
          >
            <Monitor className="w-4 h-4" />
            Live Docs
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Enhanced Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Chaves Ativas</p>
                <p className="text-2xl font-bold">
                  {apiKeys.filter(key => key.active).length}
                </p>
                <p className="text-xs text-muted-foreground">
                  de {apiKeys.length} total
                </p>
              </div>
              <Key className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Requests (24h)</p>
                <p className="text-2xl font-bold">
                  {requestStats?.totalRequests.toLocaleString() || 0}
                </p>
                <div className="flex items-center text-xs text-green-600">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Média: {requestStats?.avgResponseTime.toFixed(0) || 0}ms
                </div>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Webhooks Ativos</p>
                <p className="text-2xl font-bold">
                  {webhooks.filter(wh => wh.active).length}
                </p>
                <p className="text-xs text-muted-foreground">
                  {webhooks.reduce((sum, wh) => sum + wh.events.length, 0)} eventos
                </p>
              </div>
              <Globe className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
                <p className="text-2xl font-bold text-green-600">
                  {(100 - (requestStats?.errorRate || 0)).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {requestStats?.errorRate.toFixed(1) || 0}% erros
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Gateway Info */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            API Gateway Endpoint
          </CardTitle>
          <CardDescription>
            Use este endpoint base para todas as chamadas da API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 p-3 bg-background rounded-lg border">
            <code className="flex-1 text-sm font-mono">{gatewayUrl}</code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(gatewayUrl)}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Adicione o header <code>X-API-Key: sua_chave_aqui</code> para autenticação
          </p>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="keys">Chaves de API</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Estatísticas da API
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total de Requests (24h)</span>
                    <span className="font-medium">{requestStats?.totalRequests || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Tempo Médio de Resposta</span>
                    <span className="font-medium">{requestStats?.avgResponseTime.toFixed(0) || 0}ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Taxa de Erro</span>
                    <span className={`font-medium ${
                      (requestStats?.errorRate || 0) > 5 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {requestStats?.errorRate.toFixed(1) || 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Chaves de API
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {apiKeys.slice(0, 3).map((key) => (
                    <div key={key.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{key.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Rate limit: {key.rate_limit}/h
                        </p>
                      </div>
                      <Badge variant={key.active ? 'default' : 'secondary'}>
                        {key.active ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </div>
                  ))}
                  {apiKeys.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhuma chave de API encontrada
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="keys" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    Chaves de API
                  </CardTitle>
                  <CardDescription>
                    Gerencie chaves de acesso para sua API
                  </CardDescription>
                </div>
                <Dialog open={isCreateKeyOpen} onOpenChange={setIsCreateKeyOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Nova Chave API
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Criar Nova Chave de API</DialogTitle>
                      <DialogDescription>
                        Configure uma nova chave de API com permissões específicas
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Nome</label>
                        <Input
                          placeholder="Nome da chave..."
                          value={newKeyName}
                          onChange={(e) => setNewKeyName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Permissões</label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {['read', 'write', 'admin'].map((permission) => (
                            <div key={permission} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={permission}
                                checked={newKeyPermissions.includes(permission)}
                                onChange={() => handlePermissionToggle(permission)}
                              />
                              <label htmlFor={permission} className="text-sm capitalize">
                                {permission}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Rate Limit (por hora)</label>
                        <Input
                          type="number"
                          value={newKeyRateLimit}
                          onChange={(e) => setNewKeyRateLimit(Number(e.target.value))}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCreateKeyOpen(false)}>
                        Cancelar
                      </Button>
                      <Button 
                        onClick={handleCreateAPIKey}
                        disabled={createAPIKey.isPending}
                      >
                        {createAPIKey.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Criar Chave
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
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
                            {showApiKey[key.id] ? key.key_hash : '••••••••••••••••'}
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
                            onClick={() => copyToClipboard(key.key_hash)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {Array.isArray(key.permissions) ? key.permissions.map((perm, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {String(perm)}
                            </Badge>
                          )) : (
                            <Badge variant="outline" className="text-xs">
                              {String(key.permissions)}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{key.rate_limit}/h</TableCell>
                      <TableCell>N/A</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(key.active)}>
                          {key.active ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {key.last_used_at ? format(new Date(key.last_used_at), 'dd/MM/yyyy HH:mm') : 'Nunca'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRevokeKey(key.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
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

        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Webhooks
                  </CardTitle>
                  <CardDescription>
                    Configure webhooks para receber notificações de eventos
                  </CardDescription>
                </div>
                <Dialog open={isCreateWebhookOpen} onOpenChange={setIsCreateWebhookOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Novo Webhook
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Criar Novo Webhook</DialogTitle>
                      <DialogDescription>
                        Configure um webhook para receber notificações de eventos
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Nome</label>
                        <Input
                          placeholder="Nome do webhook..."
                          value={newWebhookName}
                          onChange={(e) => setNewWebhookName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">URL do Endpoint</label>
                        <Input
                          placeholder="https://example.com/webhook"
                          value={newWebhookUrl}
                          onChange={(e) => setNewWebhookUrl(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Eventos</label>
                        <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto">
                          {availableEvents.map((event) => (
                            <div key={event} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={event}
                                checked={newWebhookEvents.includes(event)}
                                onChange={() => handleEventToggle(event)}
                              />
                              <label htmlFor={event} className="text-sm">
                                {event}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCreateWebhookOpen(false)}>
                        Cancelar
                      </Button>
                      <Button 
                        onClick={handleCreateWebhook}
                        disabled={createWebhook.isPending}
                      >
                        {createWebhook.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Criar Webhook
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
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
                          {webhook.events.slice(0, 2).map((event, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {event}
                            </Badge>
                          ))}
                          {webhook.events.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{webhook.events.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(webhook.active)}>
                          {webhook.active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>N/A</TableCell>
                      <TableCell>
                        <span className="text-green-600">
                          100%
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(webhook.created_at), 'dd/MM/yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleWebhookStatus.mutate({ 
                              id: webhook.id, 
                              active: !webhook.active 
                            })}
                          >
                            {webhook.active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
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
      </Tabs>
    </div>
  );
};

export default APIManagementDashboard;