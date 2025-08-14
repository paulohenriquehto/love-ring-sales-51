import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Order } from '@/types/order';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { User, Phone, Mail, MapPin, Package, FileText, Printer, Edit3, CreditCard, Zap, Banknote } from 'lucide-react';
import { EngravingDisplay } from '@/components/engraving/EngravingDisplay';
// Importações de tipos simplificadas para MVP

interface OrderDetailsProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderDetails({ order, isOpen, onClose }: OrderDetailsProps) {
  if (!order) return null;

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      completed: 'Concluído',
      cancelled: 'Cancelado'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  // Removido parseEngravingSymbols - não usado no MVP simplificado

  const getPaymentMethodIcon = (method?: string) => {
    switch (method) {
      case 'pix': return <Zap className="h-4 w-4 text-muted-foreground" />;
      case 'credit_card': return <CreditCard className="h-4 w-4 text-muted-foreground" />;
      case 'debit_card': return <CreditCard className="h-4 w-4 text-muted-foreground" />;
      case 'cash': return <Banknote className="h-4 w-4 text-muted-foreground" />;
      default: return <FileText className="h-4 w-4 text-muted-foreground" />;
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Detalhes do Pedido #{order.order_number}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
              <Button variant="outline" size="sm">
                <Edit3 className="h-4 w-4 mr-2" />
                Editar Status
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Número do Pedido</p>
              <p className="font-semibold">{order.order_number}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Data do Pedido</p>
              <p className="font-semibold">
                {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge className={getStatusColor(order.status)}>
                {getStatusText(order.status)}
              </Badge>
            </div>
          </div>

          {/* Customer Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações do Cliente
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Nome</p>
                    <p className="font-medium">{order.customer_name}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">CPF</p>
                    <p className="font-medium">{order.customer_cpf}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{order.customer_email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Telefone</p>
                    <p className="font-medium">{order.customer_phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Delivery Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Informações de Entrega
            </h3>
            
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Método de Entrega</p>
                <p className="font-medium">
                  {order.delivery_method === 'pickup' ? 'Retirada na Loja' : 'Entrega em Domicílio'}
                </p>
              </div>
            </div>

            {order.notes && (
              <div>
                <p className="text-sm text-muted-foreground">Observações</p>
                <p className="font-medium">{order.notes}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Payment Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              {getPaymentMethodIcon(order.payment_method)}
              Informações de Pagamento
            </h3>
            
            <div className="flex items-center gap-2">
              {getPaymentMethodIcon(order.payment_method)}
              <div>
                <p className="text-sm text-muted-foreground">Método de Pagamento</p>
                <p className="font-medium">{formatPaymentInfo(order)}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Order Items */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Package className="h-5 w-5" />
              Itens do Pedido
            </h3>
            
            <div className="space-y-3">
              {order.order_items?.map((item) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.product_name}</h4>
                      {item.size && (
                        <p className="text-sm text-muted-foreground">Tamanho: {item.size}</p>
                      )}
                      {item.width && (
                        <p className="text-sm text-muted-foreground">Largura: {item.width}</p>
                      )}
                      {item.material && (
                        <p className="text-sm text-muted-foreground">Material: {item.material}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        R$ {parseFloat(item.total_price.toString()).toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity}x R$ {parseFloat(item.unit_price.toString()).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Engraving Details */}
                    {(item.engraving_text || item.engraving_font || item.engraving_symbols) && (
                      <div className="bg-primary/5 rounded-lg p-3 border border-primary/20 mt-3">
                        <EngravingDisplay
                          text={item.engraving_text || ""}
                          font={item.engraving_font || "arial"}
                          symbols={item.engraving_symbols ? JSON.parse(item.engraving_symbols) : []}
                          symbolPosition="after"
                          compact={false}
                          showTitle={true}
                        />
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Order Summary */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>R$ {parseFloat(order.subtotal.toString()).toFixed(2)}</span>
            </div>
            
            {parseFloat(order.discount.toString()) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Desconto:</span>
                <span>- R$ {parseFloat(order.discount.toString()).toFixed(2)}</span>
              </div>
            )}
            
            <Separator />
            
            <div className="flex justify-between text-lg font-semibold">
              <span>Total:</span>
              <span>R$ {parseFloat(order.total.toString()).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}