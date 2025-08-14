import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Package, AlertCircle, CheckCircle, Clock, X, MoreVertical, Edit, Trash2 } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";

interface Product {
  id: string;
  name: string;
  sku: string;
  base_price: number;
  category: {
    name: string;
  };
}

interface Department {
  id: string;
  name: string;
  budget_limit: number;
}

interface RequestItem {
  product_id: string;
  product_name: string;
  variant_id?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
}

interface Request {
  id: string;
  request_number: string;
  title: string;
  description: string;
  status: 'draft' | 'submitted' | 'pending_approval' | 'approved' | 'rejected' | 'in_preparation' | 'ready_for_pickup' | 'completed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  total_amount: number;
  created_at: string;
  delivery_date_requested: string;
  department_id?: string;
  justification?: string;
  requester_profile?: {
    full_name: string;
  };
  department: {
    name: string;
  };
  request_items: {
    product: {
      name: string;
    };
    quantity: number;
    unit_price: number;
    total_price: number;
  }[];
}

export default function Requests() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<Request[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<Request | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingRequest, setDeletingRequest] = useState<Request | null>(null);
  
  // Form states
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    department_id: '',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    delivery_date_requested: '',
    justification: ''
  });
  const [requestItems, setRequestItems] = useState<RequestItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemNotes, setItemNotes] = useState('');

  useEffect(() => {
    fetchRequests();
    fetchProducts();
    fetchDepartments();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('requests')
        .select(`
          *,
          department:departments(name),
          request_items(
            quantity,
            unit_price,
            total_price,
            product:products(name)
          )
        `)
        .eq('requester_user_id', profile?.user_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Erro ao carregar requisições:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar requisições",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          sku,
          base_price,
          category:categories(name)
        `)
        .eq('active', true);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('active', true);

      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Erro ao carregar departamentos:', error);
    }
  };

  const addItemToRequest = () => {
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    const totalPrice = product.base_price * itemQuantity;
    const newItem: RequestItem = {
      product_id: product.id,
      product_name: product.name,
      quantity: itemQuantity,
      unit_price: product.base_price,
      total_price: totalPrice,
      notes: itemNotes
    };

    setRequestItems([...requestItems, newItem]);
    setSelectedProduct('');
    setItemQuantity(1);
    setItemNotes('');
  };

  const removeItem = (index: number) => {
    setRequestItems(requestItems.filter((_, i) => i !== index));
  };

  const getTotalAmount = () => {
    return requestItems.reduce((sum, item) => sum + item.total_price, 0);
  };

  const generateRequestNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `REQ-${year}${month}${day}-${random}`;
  };

  const createRequest = async () => {
    if (!newRequest.title || !newRequest.department_id || requestItems.length === 0) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios e adicione pelo menos um item",
        variant: "destructive",
      });
      return;
    }

    try {
      const requestNumber = generateRequestNumber();
      const totalAmount = getTotalAmount();

      const { data: requestData, error: requestError } = await supabase
        .from('requests')
        .insert({
          request_number: requestNumber,
          title: newRequest.title,
          description: newRequest.description,
          department_id: newRequest.department_id,
          priority: newRequest.priority,
          delivery_date_requested: newRequest.delivery_date_requested || null,
          justification: newRequest.justification,
          total_amount: totalAmount,
          requester_user_id: profile?.user_id,
          status: 'pending_approval'
        })
        .select()
        .single();

      if (requestError) throw requestError;

      // Inserir itens da requisição
      const itemsToInsert = requestItems.map(item => ({
        request_id: requestData.id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        notes: item.notes
      }));

      const { error: itemsError } = await supabase
        .from('request_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      toast({
        title: "Sucesso",
        description: "Requisição criada com sucesso!",
      });

      setIsCreateDialogOpen(false);
      resetForm();
      fetchRequests();
    } catch (error) {
      console.error('Erro ao criar requisição:', error);
      toast({
        title: "Erro",
        description: "Falha ao criar requisição",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setNewRequest({
      title: '',
      description: '',
      department_id: '',
      priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
      delivery_date_requested: '',
      justification: ''
    });
    setRequestItems([]);
    setSelectedProduct('');
    setItemQuantity(1);
    setItemNotes('');
    setEditingRequest(null);
  };

  const openEditDialog = async (request: Request) => {
    setEditingRequest(request);
    setNewRequest({
      title: request.title,
      description: request.description,
      department_id: request.department_id || '',
      priority: request.priority,
      delivery_date_requested: request.delivery_date_requested || '',
      justification: request.justification || ''
    });
    
    // Fetch request items
    const { data: items } = await supabase
      .from('request_items')
      .select('*')
      .eq('request_id', request.id);
    
    if (items) {
      const formattedItems = items.map(item => ({
        product_id: item.product_id,
        product_name: '', // We'll need to fetch this
        variant_id: item.variant_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        notes: item.notes
      }));
      
      // Fetch product names
      for (const item of formattedItems) {
        const product = products.find(p => p.id === item.product_id);
        if (product) {
          item.product_name = product.name;
        }
      }
      
      setRequestItems(formattedItems);
    }
    
    setIsCreateDialogOpen(true);
  };

  const updateRequest = async () => {
    if (!editingRequest) return;
    
    try {
      const totalAmount = getTotalAmount();
      
      // Update the main request
      const { error: requestError } = await supabase
        .from('requests')
        .update({
          title: newRequest.title,
          description: newRequest.description,
          department_id: newRequest.department_id || null,
          priority: newRequest.priority,
          delivery_date_requested: newRequest.delivery_date_requested || null,
          justification: newRequest.justification,
          total_amount: totalAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingRequest.id);

      if (requestError) throw requestError;

      // Delete existing items and recreate them
      await supabase
        .from('request_items')
        .delete()
        .eq('request_id', editingRequest.id);

      // Insert new items
      if (requestItems.length > 0) {
        const { error: itemsError } = await supabase
          .from('request_items')
          .insert(
            requestItems.map(item => ({
              request_id: editingRequest.id,
              product_id: item.product_id,
              variant_id: item.variant_id,
              quantity: item.quantity,
              unit_price: item.unit_price,
              total_price: item.total_price,
              notes: item.notes
            }))
          );

        if (itemsError) throw itemsError;
      }

      toast({
        title: "Sucesso",
        description: "Requisição atualizada com sucesso!",
      });

      setIsCreateDialogOpen(false);
      resetForm();
      fetchRequests();
    } catch (error) {
      console.error('Erro ao atualizar requisição:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar requisição. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const deleteRequest = async () => {
    if (!deletingRequest) return;
    
    try {
      // Delete request items first (due to foreign key constraint)
      await supabase
        .from('request_items')
        .delete()
        .eq('request_id', deletingRequest.id);
      
      // Then delete the request
      const { error } = await supabase
        .from('requests')
        .delete()
        .eq('id', deletingRequest.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Requisição excluída com sucesso!",
      });

      setShowDeleteDialog(false);
      setDeletingRequest(null);
      fetchRequests();
    } catch (error) {
      console.error('Erro ao excluir requisição:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir requisição. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const canEditRequest = (request: Request) => {
    // Permite edição para rascunhos, rejeitadas e aguardando aprovação
    return ['draft', 'rejected', 'pending_approval'].includes(request.status);
  };

  const canDeleteRequest = (request: Request) => {
    // Permite exclusão apenas para rascunhos e aguardando aprovação
    return ['draft', 'pending_approval'].includes(request.status);
  };

  const getActionTooltip = (request: Request, action: 'edit' | 'delete') => {
    if (action === 'edit') {
      if (canEditRequest(request)) return 'Editar requisição';
      return 'Não é possível editar requisições aprovadas, concluídas ou canceladas';
    } else {
      if (canDeleteRequest(request)) return 'Excluir requisição';
      return 'Não é possível excluir requisições aprovadas, concluídas ou canceladas';
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: { variant: "secondary" as const, label: "Rascunho" },
      submitted: { variant: "outline" as const, label: "Enviada" },
      pending_approval: { variant: "outline" as const, label: "Aguardando Aprovação" },
      approved: { variant: "default" as const, label: "Aprovada" },
      rejected: { variant: "destructive" as const, label: "Rejeitada" },
      in_preparation: { variant: "outline" as const, label: "Em Preparação" },
      ready_for_pickup: { variant: "default" as const, label: "Pronta para Retirada" },
      completed: { variant: "default" as const, label: "Concluída" },
      cancelled: { variant: "destructive" as const, label: "Cancelada" }
    };
    return variants[status] || variants.draft;
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: { variant: "secondary" as const, label: "Baixa" },
      normal: { variant: "outline" as const, label: "Normal" },
      high: { variant: "destructive" as const, label: "Alta" },
      urgent: { variant: "destructive" as const, label: "Urgente" }
    };
    return variants[priority] || variants.normal;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
      case 'cancelled':
        return <X className="h-4 w-4 text-red-600" />;
      case 'submitted':
      case 'pending_approval':
      case 'in_preparation':
      case 'ready_for_pickup':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Requisições</h1>
            <p className="text-muted-foreground">
              Gerencie suas solicitações de produtos e materiais
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Requisição
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingRequest ? 'Editar Requisição' : 'Nova Requisição'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={newRequest.title}
                      onChange={(e) => setNewRequest({...newRequest, title: e.target.value})}
                      placeholder="Título da requisição"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Departamento *</Label>
                    <Select 
                      value={newRequest.department_id} 
                      onValueChange={(value) => setNewRequest({...newRequest, department_id: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o departamento" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Prioridade</Label>
                    <Select 
                      value={newRequest.priority} 
                      onValueChange={(value: any) => setNewRequest({...newRequest, priority: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="delivery_date">Data de Entrega Desejada</Label>
                    <Input
                      id="delivery_date"
                      type="date"
                      value={newRequest.delivery_date_requested}
                      onChange={(e) => setNewRequest({...newRequest, delivery_date_requested: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={newRequest.description}
                    onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
                    placeholder="Descreva os detalhes da requisição"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="justification">Justificativa</Label>
                  <Textarea
                    id="justification"
                    value={newRequest.justification}
                    onChange={(e) => setNewRequest({...newRequest, justification: e.target.value})}
                    placeholder="Justifique a necessidade desta requisição"
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Itens da Requisição</h3>
                  
                  <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-2">
                      <Label>Produto</Label>
                      <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um produto" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} - R$ {product.base_price.toFixed(2)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Quantidade</Label>
                      <Input
                        type="number"
                        min="1"
                        value={itemQuantity}
                        onChange={(e) => setItemQuantity(parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button 
                        onClick={addItemToRequest}
                        disabled={!selectedProduct}
                        className="w-full"
                      >
                        Adicionar
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>Observações do Item</Label>
                    <Input
                      value={itemNotes}
                      onChange={(e) => setItemNotes(e.target.value)}
                      placeholder="Observações específicas do item (opcional)"
                    />
                  </div>

                  {requestItems.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Itens Adicionados:</h4>
                      {requestItems.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium">{item.product_name}</div>
                            <div className="text-sm text-muted-foreground">
                              Qtd: {item.quantity} × R$ {item.unit_price.toFixed(2)} = R$ {item.total_price.toFixed(2)}
                            </div>
                            {item.notes && (
                              <div className="text-sm text-muted-foreground mt-1">
                                Obs: {item.notes}
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <div className="text-right font-semibold">
                        Total: R$ {getTotalAmount().toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={editingRequest ? updateRequest : createRequest}>
                    {editingRequest ? 'Atualizar Requisição' : 'Criar e Enviar Requisição'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(request.status)}
                      {request.title}
                      <span className="text-sm font-normal text-muted-foreground">
                        #{request.request_number}
                      </span>
                    </CardTitle>
                    <CardDescription>
                      {request.description}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Badge {...getPriorityBadge(request.priority)}>
                      {getPriorityBadge(request.priority).label}
                    </Badge>
                    <Badge {...getStatusBadge(request.status)}>
                      {getStatusBadge(request.status).label}
                    </Badge>
                    
                    {/* Só mostra o menu se houver alguma ação disponível */}
                    {(canEditRequest(request) || canDeleteRequest(request)) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {canEditRequest(request) && (
                            <DropdownMenuItem
                              onClick={() => openEditDialog(request)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                          )}
                          {canDeleteRequest(request) && (
                            <DropdownMenuItem
                              onClick={() => {
                                setDeletingRequest(request);
                                setShowDeleteDialog(true);
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Solicitante:</span>
                      <p>{request.requester_profile?.full_name || 'Usuário'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Departamento:</span>
                      <p>{request.department.name}</p>
                    </div>
                    <div>
                      <span className="font-medium">Data de Criação:</span>
                      <p>{new Date(request.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div>
                      <span className="font-medium">Valor Total:</span>
                      <p className="font-semibold">R$ {request.total_amount.toFixed(2)}</p>
                    </div>
                  </div>

                  {request.request_items && request.request_items.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Itens ({request.request_items.length})
                      </h4>
                      <div className="grid gap-2">
                        {request.request_items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                            <span>{item.product.name}</span>
                            <span className="text-sm">
                              {item.quantity}x R$ {item.unit_price.toFixed(2)} = R$ {item.total_price.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {requests.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma requisição encontrada</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Você ainda não criou nenhuma requisição. Clique no botão acima para começar.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir a requisição "{deletingRequest?.title}"?
                Esta ação não pode ser desfeita e todos os itens da requisição também serão excluídos.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={deleteRequest}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ProtectedRoute>
  );
}