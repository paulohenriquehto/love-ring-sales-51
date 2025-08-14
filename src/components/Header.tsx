import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Search, Filter, Menu, User, LogOut } from "lucide-react";
import logoImage from "@/assets/logo.jpg";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

interface HeaderProps {
  onCartClick: () => void;
  employeeName?: string;
}

export function Header({ onCartClick, employeeName = "Funcionária" }: HeaderProps) {
  const { signOut } = useAuth();
  const { getTotalItems, getTotalPrice } = useCart();
  return (
    <header className="sticky top-0 z-50 bg-gradient-subtle backdrop-blur-sm border-b border-border/50 shadow-card">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img 
              src={logoImage} 
              alt="In Love Store" 
              className="h-12 w-auto object-contain"
            />
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-primary">In Love Store</h1>
              <p className="text-sm text-muted-foreground">Sistema de Vendas</p>
            </div>
          </div>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Employee Info */}
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-xl">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">{employeeName}</span>
            </div>

            {/* Filter Button - Mobile */}
            <Button variant="outline" size="icon" className="md:hidden">
              <Filter className="h-4 w-4" />
            </Button>

            {/* Search Button - Mobile */}
            <Button variant="outline" size="icon" className="md:hidden">
              <Search className="h-4 w-4" />
            </Button>

            {/* Cart Button */}
            <Button
              variant="cart-discrete"
              size="tablet"
              onClick={onCartClick}
              className="relative group"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              
              {/* Cart Count Badge */}
              {getTotalItems() > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-primary text-white font-bold min-w-6 h-6 rounded-full flex items-center justify-center text-xs">
                  {getTotalItems()}
                </Badge>
              )}

              <div className="flex flex-col items-start">
                <span className="font-medium">
                  {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'itens'}
                </span>
                <span className="text-sm opacity-75">
                  R$ {getTotalPrice().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </Button>

            {/* Logout Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={signOut}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              title="Sair do sistema"
            >
              <LogOut className="h-4 w-4" />
            </Button>

            {/* Menu Button - Mobile */}
            <Button variant="outline" size="icon" className="lg:hidden">
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}