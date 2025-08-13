import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X, Minus, Plus, ShoppingBag, CreditCard, Smartphone, Paintbrush } from "lucide-react";
import { useState } from "react";
import { type EngravingCustomization } from "@/types/engraving";

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  material: string;
  size: string;
  width?: string;
  quantity: number;
  engraving?: EngravingCustomization;
}

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, size: string, width: string | undefined, quantity: number) => void;
  onRemoveItem: (id: string, size: string, width?: string) => void;
  onCheckout: () => void;
}

export function Cart({ isOpen, onClose, items, onUpdateQuantity, onRemoveItem, onCheckout }: CartProps) {
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('pickup');

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const pixDiscount = subtotal * 0.05;
  const pixTotal = subtotal - pixDiscount;
  const installmentValue = subtotal / 12;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Cart Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-background z-50 shadow-elegant transform transition-transform duration-300 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-subtle">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Carrinho de Compras</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Cart Content */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Carrinho vazio</h3>
              <p className="text-muted-foreground">Adicione produtos para começar a venda</p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {items.map((item) => (
                <Card key={`${item.id}-${item.size}-${item.width || 'no-width'}`} className="p-4 shadow-card">
                  <div className="flex gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg bg-muted"
                    />
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-foreground">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {item.material} • Tamanho {item.size}{item.width ? ` • Largura ${item.width}` : ''}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onRemoveItem(item.id, item.size, item.width)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Engraving Details */}
                      {item.engraving && (
                        <div className="bg-muted/50 rounded-lg p-2 border-l-2 border-primary">
                          <div className="flex items-center gap-2 mb-1">
                            <Paintbrush className="h-3 w-3 text-primary" />
                            <span className="text-xs font-medium text-primary">Gravação Personalizada</span>
                          </div>
                          <p className="text-sm text-foreground font-medium">"{item.engraving.text}"</p>
                          <p className="text-xs text-muted-foreground">Fonte: {item.engraving.font}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onUpdateQuantity(item.id, item.size, item.width, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="font-medium min-w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onUpdateQuantity(item.id, item.size, item.width, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-bold text-primary">
                            R$ {(item.price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-xs text-muted-foreground">
                              R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} cada
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border bg-gradient-subtle p-6 space-y-4">
            {/* Delivery Method */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Forma de entrega:</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={deliveryMethod === 'pickup' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDeliveryMethod('pickup')}
                  className="justify-start"
                >
                  🏠 Retirar na loja
                </Button>
                <Button
                  variant={deliveryMethod === 'delivery' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDeliveryMethod('delivery')}
                  className="justify-start"
                >
                  🚚 Entregar
                </Button>
              </div>
            </div>

            <Separator />

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">
                  R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">PIX (5% desconto):</span>
                  </div>
                  <span className="font-bold text-green-800">
                    R$ {pixTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <p className="text-xs text-green-600">
                  Economia de R$ {pixDiscount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">12x no cartão:</span>
                </div>
                <span className="font-medium">
                  R$ {installmentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total:</span>
              <span className="text-primary">
                R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Checkout Button */}
            <Button
              variant="cart"
              size="tablet"
              className="w-full"
              onClick={onCheckout}
            >
              <CreditCard className="h-5 w-5 mr-2" />
              Finalizar Venda
            </Button>
          </div>
        )}
      </div>
    </>
  );
}