import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Package, 
  Plus, 
  Minus, 
  Search, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  RefreshCw
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";

interface InventoryItem {
  id: string;
  product_id: string;
  variant_id?: string;
  warehouse_id: string;
  quantity_available: number;
  quantity_reserved: number;
  quantity_total: number;
  minimum_stock: number;
  maximum_stock?: number;
  last_count_date?: string;
  last_movement_date?: string;
  product: {
    name: string;
    sku: string;
    base_price: number;
    category: {
      name: string;
    };
  };
  warehouse: {
    name: string;
    location: string;
  };
  variant?: {
    size?: string;
    color?: string;
    material: {
      name: string;
    };
  };
}

interface StockMovement {
  id: string;
  movement_type: 'adjustment' | 'transfer' | 'purchase' | 'sale' | 'damage' | 'return' | 'reservation' | 'unreservation';
  quantity: number;
  quantity_before: number;
  quantity_after: number;
  movement_date: string;
  notes?: string;
  unit_cost?: number;
  total_cost?: number;
  reference_type?: string;
  reference_id?: string;
  product: {
    name: string;
    sku: string;
  };
  warehouse: {
    name: string;
  };
  performed_by?: {
    full_name: string;
  };
}

interface Warehouse {
  id: string;
  name: string;
  location: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
}

export default function Inventory() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('all');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [isMovementDialogOpen, setIsMovementDialogOpen] = useState(false);

  // Movement form
  const [movementForm, setMovementForm] = useState<{
    product_id: string;
    warehouse_id: string;
    movement_type: 'adjustment' | 'transfer' | 'purchase' | 'sale' | 'damage' | 'return' | 'reservation' | 'unreservation';
    quantity: number;
    unit_cost: number;
    notes: string;
    reference_type: string;
    reference_id: string;
  }>({
    product_id: '',
    warehouse_id: '',
    movement_type: 'purchase',
    quantity: 0,
    unit_cost: 0,
    notes: '',
    reference_type: '',
    reference_id: ''
  });

  useEffect(() => {
    fetchInventory();
    fetchMovements();
    fetchWarehouses();
    fetchProducts();
  }, [selectedWarehouse]);

  const fetchInventory = async () => {
    try {
      let query = supabase
        .from('inventory')
        .select(`
          *,
          product:products(
            name,
            sku,
            base_price,
            category:categories(name)
          ),
          warehouse:warehouses(name, location),
          variant:product_variants(
            size,
            color,
            material:materials(name)
          )
        `);

      if (selectedWarehouse && selectedWarehouse !== 'all') {
        query = query.eq('warehouse_id', selectedWarehouse);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setInventory(data || []);
    } catch (error) {
      console.error('Erro ao carregar inventário:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar inventário",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMovements = async () => {
    try {
      const { data, error } = await supabase
        .from('stock_movements')
        .select(`
          *,
          product:products(name, sku),
          warehouse:warehouses(name)
        `)
        .order('movement_date', { ascending: false })
        .limit(50);

      if (error) throw error;
      setMovements(data || []);
    } catch (error) {
      console.error('Erro ao carregar movimentações:', error);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const { data, error } = await supabase
        .from('warehouses')
        .select('*')
        .eq('active', true);

      if (error) throw error;
      setWarehouses(data || []);
    } catch (error) {
      console.error('Erro ao carregar armazéns:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, sku')
        .eq('active', true);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
      item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLowStock = !lowStockOnly || item.quantity_available <= item.minimum_stock;
    
    return matchesSearch && matchesLowStock;
  });

  const createMovement = async () => {
    if (!movementForm.product_id || !movementForm.warehouse_id || movementForm.quantity <= 0) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      // Buscar o estoque atual
      const { data: currentInventory } = await supabase
        .from('inventory')
        .select('quantity_available')
        .eq('product_id', movementForm.product_id)
        .eq('warehouse_id', movementForm.warehouse_id)
        .single();

      if (!currentInventory) {
        toast({
          title: "Erro",
          description: "Produto não encontrado no estoque",
          variant: "destructive",
        });
        return;
      }

      const quantityBefore = currentInventory.quantity_available;
      let quantityAfter: number;

      // Calcular nova quantidade baseada no tipo de movimento
      if (['purchase', 'return', 'unreservation'].includes(movementForm.movement_type)) {
        quantityAfter = quantityBefore + movementForm.quantity;
      } else if (['sale', 'damage', 'reservation'].includes(movementForm.movement_type)) {
        quantityAfter = Math.max(0, quantityBefore - movementForm.quantity);
      } else if (movementForm.movement_type === 'adjustment') {
        quantityAfter = movementForm.quantity;
      } else {
        quantityAfter = quantityBefore;
      }

      // Criar movimentação
      const { error: movementError } = await supabase
        .from('stock_movements')
        .insert({
          product_id: movementForm.product_id,
          warehouse_id: movementForm.warehouse_id,
          movement_type: movementForm.movement_type,
          quantity: movementForm.movement_type === 'adjustment' 
            ? quantityAfter - quantityBefore 
            : movementForm.quantity,
          quantity_before: quantityBefore,
          quantity_after: quantityAfter,
          unit_cost: movementForm.unit_cost || null,
          total_cost: movementForm.unit_cost 
            ? movementForm.unit_cost * Math.abs(quantityAfter - quantityBefore)
            : null,
          notes: movementForm.notes || null,
          reference_type: movementForm.reference_type || null,
          reference_id: movementForm.reference_id || null,
          performed_by_user_id: profile?.user_id
        });

      if (movementError) throw movementError;

      // Atualizar inventário
      const { error: inventoryError } = await supabase
        .from('inventory')
        .update({
          quantity_available: quantityAfter,
          quantity_total: quantityAfter, // Simplificado - em produção pode ter lógica mais complexa
          last_movement_date: new Date().toISOString()
        })
        .eq('product_id', movementForm.product_id)
        .eq('warehouse_id', movementForm.warehouse_id);

      if (inventoryError) throw inventoryError;

      toast({
        title: "Sucesso",
        description: "Movimentação registrada com sucesso!",
      });

      setIsMovementDialogOpen(false);
      resetMovementForm();
      fetchInventory();
      fetchMovements();
    } catch (error) {
      console.error('Erro ao criar movimentação:', error);
      toast({
        title: "Erro",
        description: "Falha ao registrar movimentação",
        variant: "destructive",
      });
    }
  };

  const resetMovementForm = () => {
    setMovementForm({
      product_id: '',
      warehouse_id: '',
      movement_type: 'purchase',
      quantity: 0,
      unit_cost: 0,
      notes: '',
      reference_type: '',
      reference_id: ''
    });
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity_available <= 0) {
      return { status: 'out', label: 'Sem Estoque', variant: 'destructive' as const };
    } else if (item.quantity_available <= item.minimum_stock) {
      return { status: 'low', label: 'Estoque Baixo', variant: 'destructive' as const };
    } else if (item.maximum_stock && item.quantity_available >= item.maximum_stock) {
      return { status: 'high', label: 'Estoque Alto', variant: 'secondary' as const };
    } else {
      return { status: 'normal', label: 'Normal', variant: 'default' as const };
    }
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'purchase':
      case 'return':
      case 'unreservation':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'sale':
      case 'damage':
      case 'reservation':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'adjustment':
        return <RefreshCw className="h-4 w-4 text-blue-600" />;
      case 'transfer':
        return <BarChart3 className="h-4 w-4 text-purple-600" />;
      default:
        return <BarChart3 className="h-4 w-4 text-gray-600" />;
    }
  };

  const getMovementTypeLabel = (type: string) => {
    const labels = {
      purchase: 'Compra',
      sale: 'Venda',
      adjustment: 'Ajuste',
      transfer: 'Transferência',
      damage: 'Avaria',
      return: 'Devolução',
      reservation: 'Reserva',
      unreservation: 'Liberar Reserva'
    };
    return labels[type] || type;
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
            <h1 className="text-3xl font-bold">Controle de Estoque</h1>
            <p className="text-muted-foreground">
              Monitore e gerencie o inventário de produtos
            </p>
          </div>
          <Dialog open={isMovementDialogOpen} onOpenChange={setIsMovementDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Movimentação
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Movimentação</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Produto *</Label>
                    <Select 
                      value={movementForm.product_id} 
                      onValueChange={(value) => setMovementForm({...movementForm, product_id: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o produto" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} ({product.sku})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Armazém *</Label>
                    <Select 
                      value={movementForm.warehouse_id} 
                      onValueChange={(value) => setMovementForm({...movementForm, warehouse_id: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o armazém" />
                      </SelectTrigger>
                      <SelectContent>
                        {warehouses.map((warehouse) => (
                          <SelectItem key={warehouse.id} value={warehouse.id}>
                            {warehouse.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de Movimentação *</Label>
                    <Select 
                      value={movementForm.movement_type} 
                      onValueChange={(value: any) => setMovementForm({...movementForm, movement_type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="purchase">Compra</SelectItem>
                        <SelectItem value="sale">Venda</SelectItem>
                        <SelectItem value="adjustment">Ajuste de Inventário</SelectItem>
                        <SelectItem value="transfer">Transferência</SelectItem>
                        <SelectItem value="damage">Avaria</SelectItem>
                        <SelectItem value="return">Devolução</SelectItem>
                        <SelectItem value="reservation">Reserva</SelectItem>
                        <SelectItem value="unreservation">Liberar Reserva</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Quantidade *
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      value={movementForm.quantity}
                      onChange={(e) => setMovementForm({...movementForm, quantity: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Custo Unitário</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={movementForm.unit_cost}
                    onChange={(e) => setMovementForm({...movementForm, unit_cost: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Input
                    value={movementForm.notes}
                    onChange={(e) => setMovementForm({...movementForm, notes: e.target.value})}
                    placeholder="Observações sobre a movimentação"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de Referência</Label>
                    <Input
                      value={movementForm.reference_type}
                      onChange={(e) => setMovementForm({...movementForm, reference_type: e.target.value})}
                      placeholder="Ex: Requisição, Venda, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>ID da Referência</Label>
                    <Input
                      value={movementForm.reference_id}
                      onChange={(e) => setMovementForm({...movementForm, reference_id: e.target.value})}
                      placeholder="ID do documento relacionado"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsMovementDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={createMovement}>
                    Registrar Movimentação
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Todos os armazéns" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os armazéns</SelectItem>
              {warehouses.map((warehouse) => (
                <SelectItem key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant={lowStockOnly ? "default" : "outline"}
            onClick={() => setLowStockOnly(!lowStockOnly)}
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Estoque Baixo
          </Button>
        </div>

        <Tabs defaultValue="inventory" className="space-y-4">
          <TabsList>
            <TabsTrigger value="inventory">Inventário</TabsTrigger>
            <TabsTrigger value="movements">Movimentações</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-4">
            <div className="grid gap-4">
              {filteredInventory.map((item) => {
                const stockStatus = getStockStatus(item);
                return (
                  <Card key={item.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            {item.product.name}
                            <span className="text-sm font-normal text-muted-foreground">
                              ({item.product.sku})
                            </span>
                          </CardTitle>
                          <CardDescription>
                            {item.product.category.name} • {item.warehouse.name}
                            {item.variant && (
                              <span>
                                {' • '}
                                {item.variant.material.name}
                                {item.variant.size && ` • Tamanho: ${item.variant.size}`}
                                {item.variant.color && ` • Cor: ${item.variant.color}`}
                              </span>
                            )}
                          </CardDescription>
                        </div>
                        <Badge variant={stockStatus.variant}>
                          {stockStatus.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Disponível:</span>
                          <p className="text-2xl font-bold">{item.quantity_available}</p>
                        </div>
                        <div>
                          <span className="font-medium">Reservado:</span>
                          <p>{item.quantity_reserved}</p>
                        </div>
                        <div>
                          <span className="font-medium">Estoque Mínimo:</span>
                          <p>{item.minimum_stock}</p>
                        </div>
                        <div>
                          <span className="font-medium">Estoque Máximo:</span>
                          <p>{item.maximum_stock || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="font-medium">Última Contagem:</span>
                          <p>
                            {item.last_count_date 
                              ? new Date(item.last_count_date).toLocaleDateString('pt-BR')
                              : 'N/A'
                            }
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {filteredInventory.length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Package className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum item encontrado</h3>
                    <p className="text-muted-foreground text-center">
                      Não foram encontrados itens no inventário com os filtros aplicados.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="movements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Movimentações Recentes</CardTitle>
                <CardDescription>
                  Últimas 50 movimentações de estoque
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>Armazém</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Saldo</TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Observações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movements.map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell>
                          {new Date(movement.movement_date).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{movement.product.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {movement.product.sku}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{movement.warehouse.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getMovementIcon(movement.movement_type)}
                            {getMovementTypeLabel(movement.movement_type)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={
                            ['purchase', 'return', 'unreservation'].includes(movement.movement_type) ? 'text-green-600' :
                            ['sale', 'damage', 'reservation'].includes(movement.movement_type) ? 'text-red-600' :
                            'text-blue-600'
                          }>
                            {['purchase', 'return', 'unreservation'].includes(movement.movement_type) ? '+' : 
                             ['sale', 'damage', 'reservation'].includes(movement.movement_type) ? '-' : '±'}
                            {Math.abs(movement.quantity)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {movement.quantity_before} → {movement.quantity_after}
                          </span>
                        </TableCell>
                        <TableCell>{movement.performed_by?.full_name || 'Sistema'}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {movement.notes || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {movements.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhuma movimentação encontrada</h3>
                    <p className="text-muted-foreground text-center">
                      Ainda não há movimentações registradas no sistema.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}