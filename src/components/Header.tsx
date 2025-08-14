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
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <img 
              src={logoImage} 
              alt="In Love Store" 
              className="h-8 sm:h-10 lg:h-12 w-auto object-contain shrink-0"
            />
            <div className="hidden md:block min-w-0">
              <h1 className="text-lg lg:text-xl font-bold text-primary truncate">In Love Store</h1>
              <p className="text-xs lg:text-sm text-muted-foreground truncate">Sistema de Vendas</p>
            </div>
          </div>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden lg:flex flex-1 max-w-sm xl:max-w-md mx-4 xl:mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                className="w-full pl-10 pr-4 py-2.5 lg:py-3 rounded-xl border border-border bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 shrink-0">
            {/* Employee Info */}
            <div className="hidden md:flex items-center gap-2 px-3 lg:px-4 py-1.5 lg:py-2 bg-muted/50 rounded-xl">
              <User className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-muted-foreground" />
              <span className="text-xs lg:text-sm font-medium text-foreground truncate max-w-24 lg:max-w-none">
                {employeeName}
              </span>
            </div>

            {/* Search Button - Mobile/Tablet */}
            <Button variant="outline" size="icon" className="lg:hidden h-8 w-8 sm:h-9 sm:w-9">
              <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>

            {/* Cart Button */}
            <Button
              variant="cart-discrete"
              size="sm"
              onClick={onCartClick}
              className="relative group h-8 sm:h-9 lg:h-auto px-2 sm:px-3 lg:px-4"
            >
              <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 sm:mr-1 lg:mr-2" />
              
              {/* Cart Count Badge */}
              {getTotalItems() > 0 && (
                <Badge className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-primary text-white font-bold min-w-4 h-4 sm:min-w-5 sm:h-5 lg:min-w-6 lg:h-6 rounded-full flex items-center justify-center text-xs">
                  {getTotalItems()}
                </Badge>
              )}

              <div className="hidden sm:flex flex-col items-start">
                <span className="text-xs lg:text-sm font-medium">
                  {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'itens'}
                </span>
                <span className="text-xs opacity-75">
                  R$ {getTotalPrice().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </Button>

            {/* Logout Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={signOut}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 sm:h-9 sm:w-9"
              title="Sair do sistema"
            >
              <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}