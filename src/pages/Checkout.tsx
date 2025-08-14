import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { createOrder } from '@/lib/orders';
import { EngravingDisplay } from '@/components/engraving/EngravingDisplay';
import { ShoppingBag, CreditCard, User, MapPin, MessageSquare, Banknote, Smartphone } from 'lucide-react';
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
    paymentMethod: 'pix' as 'pix' | 'credit_card' | 'debit_card' | 'cash',
    installments: 1,
    notes: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  const subtotal = getTotalPrice();
  const pixDiscount = orderData.paymentMethod === 'pix' ? subtotal * 0.05 : 0;
  const total = subtotal - pixDiscount;
  const installmentValue = orderData.paymentMethod === 'credit_card' ? total / orderData.installments : 0;

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

    if (!orderData.paymentMethod) {
      toast({
        title: "Erro",
        description: "Forma de pagamento é obrigatória",
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
        total,
        delivery_method: orderData.deliveryMethod,
        payment_method: orderData.paymentMethod,
        installments: orderData.paymentMethod === 'credit_card' ? orderData.installments : undefined,
        installment_value: orderData.paymentMethod === 'credit_card' ? installmentValue : undefined,
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
          engraving_symbols: item.engraving?.symbols ? JSON.stringify(item.engraving.symbols) : undefined
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

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Forma de Pagamento</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Método de Pagamento *</Label>
                    <RadioGroup
                      value={orderData.paymentMethod}
                      onValueChange={(value: 'pix' | 'credit_card' | 'debit_card' | 'cash') =>
                        setOrderData(prev => ({ ...prev, paymentMethod: value, installments: value === 'credit_card' ? prev.installments : 1 }))
                      }
                      className="mt-2"
                    >
                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="pix" id="pix" />
                        <Label htmlFor="pix" className="flex-1 flex items-center gap-3 cursor-pointer">
                          <Smartphone className="h-4 w-4 text-green-600" />
                          <div>
                            <div className="font-medium">PIX</div>
                            <div className="text-sm text-green-600">5% de desconto</div>
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="credit_card" id="credit_card" />
                        <Label htmlFor="credit_card" className="flex-1 flex items-center gap-3 cursor-pointer">
                          <CreditCard className="h-4 w-4 text-blue-600" />
                          <div>
                            <div className="font-medium">Cartão de Crédito</div>
                            <div className="text-sm text-muted-foreground">Parcelamento disponível</div>
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="debit_card" id="debit_card" />
                        <Label htmlFor="debit_card" className="flex-1 flex items-center gap-3 cursor-pointer">
                          <CreditCard className="h-4 w-4 text-purple-600" />
                          <div>
                            <div className="font-medium">Cartão de Débito</div>
                            <div className="text-sm text-muted-foreground">À vista</div>
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="cash" id="cash" />
                        <Label htmlFor="cash" className="flex-1 flex items-center gap-3 cursor-pointer">
                          <Banknote className="h-4 w-4 text-green-700" />
                          <div>
                            <div className="font-medium">Dinheiro</div>
                            <div className="text-sm text-muted-foreground">Pagamento em espécie</div>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {orderData.paymentMethod === 'credit_card' && (
                    <div>
                      <Label htmlFor="installments">Parcelas</Label>
                      <Select
                        value={orderData.installments.toString()}
                        onValueChange={(value) =>
                          setOrderData(prev => ({ ...prev, installments: parseInt(value) }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num}x de R$ {(total / num).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              {num === 1 ? ' (à vista)' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
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
                          symbols={item.engraving.symbols}
                          symbolPosition={item.engraving.symbolPosition}
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

                  {pixDiscount > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-green-800">Desconto PIX (5%):</span>
                        <span className="font-bold text-green-800">
                          -R$ {pixDiscount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  )}

                  {orderData.paymentMethod === 'credit_card' && orderData.installments > 1 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-800">
                          Parcelamento {orderData.installments}x:
                        </span>
                        <span className="font-medium text-blue-800">
                          R$ {installmentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês
                        </span>
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-primary">
                      R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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