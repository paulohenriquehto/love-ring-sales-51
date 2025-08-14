import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Server,
  Key,
  Activity,
  Shield,
  Globe,
  Copy,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  AlertTriangle,
  BarChart3,
  Loader2,
  MoreVertical
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAPIManagement } from '@/hooks/useAPIManagement';
import { format } from 'date-fns';
import { toast } from 'sonner';

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

const APIManagement = () => {
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
        // Show the key to user once
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
                  {apiKeys.filter(key => key.active).length}
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
                  {requestStats?.totalRequests || 0}
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
                <p className="text-sm text-muted-foreground">Webhooks Ativos</p>
                <p className="text-2xl font-bold">
                  {webhooks.filter(wh => wh.active).length}
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
                  {requestStats?.errorRate.toFixed(1) || 0}%
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

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
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Chaves de API
              </CardTitle>
              <CardDescription>
                Gerencie chaves de API para autenticação de aplicações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-6">
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
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRevokeKey(key.id)}
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
                <Dialog open={isCreateWebhookOpen} onOpenChange={setIsCreateWebhookOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Novo Webhook
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
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