import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { getOrderById } from '@/lib/orders';
import { type Order, type OrderItem } from '@/types/order';
import { EngravingDisplay } from '@/components/engraving/EngravingDisplay';
import { CheckCircle, Download, Home, Mail, Phone, Calendar, Package, CreditCard, Zap, Banknote } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

const OrderConfirmation = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrder(orderId);
    }
  }, [orderId]);

  const fetchOrder = async (id: string) => {
    try {
      setLoading(true);
      const orderData = await getOrderById(id);
      setOrder(orderData);
    } catch (error) {
      console.error('Erro ao carregar pedido:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do pedido",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'confirmed': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'confirmed': return 'Confirmado';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return 'Desconhecido';
    }
  };

  const getPaymentMethodIcon = (method?: string) => {
    switch (method) {
      case 'pix': return <Zap className="h-4 w-4 text-primary" />;
      case 'credit_card': return <CreditCard className="h-4 w-4 text-primary" />;
      case 'debit_card': return <CreditCard className="h-4 w-4 text-primary" />;
      case 'cash': return <Banknote className="h-4 w-4 text-primary" />;
      default: return <Package className="h-4 w-4 text-primary" />;
    }
  };

  const getPaymentMethodText = (method?: string) => {
    switch (method) {
      case 'pix': return 'PIX';
      case 'credit_card': return 'Cartão de Crédito';
      case 'debit_card': return 'Cartão de Débito';
      case 'cash': return 'Dinheiro';
      default: return 'Não informado';
    }
  };

  const formatPaymentInfo = (order: Order) => {
    if (!order.payment_method) return 'Não informado';
    
    const methodText = getPaymentMethodText(order.payment_method);
    
    if (order.payment_method === 'credit_card' && order.installments && order.installments > 1) {
      return `${methodText} - ${order.installments}x de R$ ${parseFloat(order.installment_value?.toString() || '0').toFixed(2)}`;
    }
    
    return methodText;
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando pedido...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!order) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
          <Card className="max-w-md w-full mx-4 p-8 text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Pedido não encontrado</h2>
            <p className="text-muted-foreground mb-6">
              O pedido solicitado não foi encontrado ou você não tem permissão para visualizá-lo.
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              Voltar ao Início
            </Button>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-subtle py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Pedido Confirmado!</h1>
            <p className="text-muted-foreground">
              Pedido #{order.id.slice(-8)} foi registrado com sucesso
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Order Details */}
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-3">
                  <Package className="h-5 w-5 text-primary" />
                  Detalhes do Pedido
                </h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ID do Pedido:</span>
                    <span className="font-mono text-sm">#{order.id.slice(-8)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge className={`${getStatusColor(order.status)} text-white`}>
                      {getStatusText(order.status)}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data:</span>
                    <span>{new Date(order.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Entrega:</span>
                    <span>{order.delivery_method === 'pickup' ? '🏠 Retirar na loja' : '🚚 Entregar'}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pagamento:</span>
                    <span className="flex items-center gap-2">
                      {getPaymentMethodIcon(order.payment_method)}
                      {formatPaymentInfo(order)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-start">
                    <span className="text-muted-foreground">Total:</span>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">
                        R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      {order.discount > 0 && (
                        <div className="text-sm text-green-600">
                          Desconto: R$ {order.discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {order.notes && (
                    <>
                      <Separator />
                      <div>
                        <span className="text-muted-foreground">Observações:</span>
                        <p className="mt-1 text-sm">{order.notes}</p>
                      </div>
                    </>
                  )}
                </div>
              </Card>

              {/* Customer Information */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-3">
                  <Home className="h-5 w-5 text-primary" />
                  Dados do Cliente
                </h2>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">Nome:</span>
                    <span>{order.customer_name}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">CPF:</span>
                    <span className="font-mono text-sm">{order.customer_cpf}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{order.customer_email}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{order.customer_phone}</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Order Items */}
            <div>
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-3">
                  <Package className="h-5 w-5 text-primary" />
                  Itens do Pedido
                </h2>
                
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {order.order_items?.map((item: OrderItem, index: number) => (
                    <div key={index} className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{item.product_name}</h4>
                        <Badge variant="secondary">Qtd: {item.quantity}</Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {item.material} • Tamanho {item.size}
                        {item.width && ` • Largura ${item.width}`}
                      </p>
                      
                      {(item.engraving_text || item.engraving_symbols) && (
                        <div className="mb-3">
                          <EngravingDisplay
                            text={item.engraving_text || ""}
                            font={item.engraving_font || 'arial'}
                            symbols={item.engraving_symbols ? JSON.parse(item.engraving_symbols) : []}
                            compact={true}
                            showTitle={false}
                          />
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          R$ {item.unit_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} cada
                        </span>
                        <span className="font-semibold">
                          R$ {item.total_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>R$ {order.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  
                  {order.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Desconto:</span>
                      <span>- R$ {order.discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span className="text-primary">
                      R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Actions */}
              <div className="mt-6 space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.print()}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Imprimir Pedido
                </Button>
                
                <Button 
                  className="w-full"
                  onClick={() => navigate('/')}
                >
                  <Home className="h-4 w-4 mr-2" />
                  Voltar ao Catálogo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default OrderConfirmation;