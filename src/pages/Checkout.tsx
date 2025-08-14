import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { createOrder } from '@/lib/orders';
import { EngravingDisplay } from '@/components/engraving/EngravingDisplay';
import { ShoppingBag, CreditCard, User, MapPin, MessageSquare } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, clearCart, getTotalPrice } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  const [customerData, setCustomerData] = useState({
    name: '',
    cpf: '',
    email: '',
    phone: ''
  });

  const [orderData, setOrderData] = useState({
    deliveryMethod: 'pickup' as 'pickup' | 'delivery',
    notes: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  const subtotal = getTotalPrice();
  const pixDiscount = subtotal * 0.05;
  const pixTotal = subtotal - pixDiscount;

  const handleInputChange = (field: string, value: string) => {
    setCustomerData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!customerData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome do cliente é obrigatório",
        variant: "destructive"
      });
      return false;
    }

    if (!customerData.cpf.trim()) {
      toast({
        title: "Erro", 
        description: "CPF do cliente é obrigatório",
        variant: "destructive"
      });
      return false;
    }

    if (!customerData.email.trim()) {
      toast({
        title: "Erro",
        description: "Email do cliente é obrigatório", 
        variant: "destructive"
      });
      return false;
    }

    if (!customerData.phone.trim()) {
      toast({
        title: "Erro",
        description: "Telefone do cliente é obrigatório",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (items.length === 0) {
      toast({
        title: "Erro",
        description: "Carrinho está vazio",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const orderPayload = {
        customer_name: customerData.name,
        customer_cpf: customerData.cpf,
        customer_email: customerData.email,
        customer_phone: customerData.phone,
        subtotal,
        discount: pixDiscount,
        total: subtotal,
        delivery_method: orderData.deliveryMethod,
        notes: orderData.notes || null,
        items: items.map(item => ({
          product_id: item.id,
          product_name: item.name,
          size: item.size,
          width: item.width,
          material: item.material,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity,
          engraving_text: item.engraving?.text,
          engraving_font: item.engraving?.font,
          engraving_symbols: item.engraving?.selectedSymbols ? JSON.stringify(item.engraving.selectedSymbols) : null
        }))
      };

      const order = await createOrder(orderPayload);
      
      clearCart();
      
      toast({
        title: "Pedido criado com sucesso!",
        description: `Pedido #${order.id.slice(-8)} foi registrado.`
      });

      navigate(`/order-confirmation/${order.id}`);
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar pedido. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
          <Card className="max-w-md w-full mx-4 p-8 text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Carrinho Vazio</h2>
            <p className="text-muted-foreground mb-6">
              Adicione produtos ao carrinho para continuar
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              Voltar ao Catálogo
            </Button>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-subtle py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Finalizar Pedido</h1>
            <p className="text-muted-foreground">Complete os dados para finalizar a venda</p>
          </div>

          <form onSubmit={handleSubmit} className="grid lg:grid-cols-2 gap-8">
            {/* Customer Information */}
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <User className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Dados do Cliente</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      value={customerData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Nome do cliente"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="cpf">CPF *</Label>
                    <Input
                      id="cpf"
                      value={customerData.cpf}
                      onChange={(e) => handleInputChange('cpf', e.target.value)}
                      placeholder="000.000.000-00"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="cliente@exemplo.com"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Telefone *</Label>
                    <Input
                      id="phone"
                      value={customerData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="(00) 00000-0000"
                      required
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Entrega</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Método de Entrega</Label>
                    <Select
                      value={orderData.deliveryMethod}
                      onValueChange={(value: 'pickup' | 'delivery') =>
                        setOrderData(prev => ({ ...prev, deliveryMethod: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pickup">🏠 Retirar na loja</SelectItem>
                        <SelectItem value="delivery">🚚 Entregar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea
                      id="notes"
                      value={orderData.notes}
                      onChange={(e) => setOrderData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Informações adicionais sobre o pedido..."
                      rows={3}
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="p-6 sticky top-8">
                <div className="flex items-center gap-3 mb-6">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Resumo do Pedido</h2>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {items.map((item, index) => (
                    <div key={index} className="flex gap-4 p-4 bg-muted/30 rounded-lg">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 space-y-1">
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {item.material} • Tamanho {item.size}
                          {item.width && ` • Largura ${item.width}`}
                        </p>
                        
                        {item.engraving && (
                          <div className="mt-2">
                            <EngravingDisplay
                              text={item.engraving.text}
                              font={item.engraving.font}
                              selectedSymbols={item.engraving.selectedSymbols}
                              compact={true}
                              showTitle={false}
                            />
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center">
                          <Badge variant="secondary">Qtd: {item.quantity}</Badge>
                          <span className="font-semibold text-sm">
                            R$ {(item.price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-6" />

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-green-800">PIX (5% desconto):</span>
                      <span className="font-bold text-green-800">
                        R$ {pixTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <p className="text-xs text-green-600 mt-1">
                      Economia de R$ {pixDiscount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-primary">
                      R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isLoading}
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    {isLoading ? 'Processando...' : 'Finalizar Pedido'}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/')}
                    disabled={isLoading}
                  >
                    Voltar ao Catálogo
                  </Button>
                </div>
              </Card>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Checkout;