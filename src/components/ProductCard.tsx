import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart } from "lucide-react";
import { useState } from "react";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  material: "ouro" | "prata" | "titanio" | "aco";
  category: "alianca" | "anel" | "colar";
  stock: number;
  sizes: string[];
  widths?: string[];
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, size: string, width?: string) => void;
}

const materialColors = {
  ouro: "bg-gradient-gold text-white",
  prata: "bg-luxury-platinum text-luxury-dark",
  titanio: "bg-gradient-elegant text-white",
  aco: "bg-muted text-muted-foreground"
};

const stockColors = {
  high: "bg-green-500",
  low: "bg-yellow-500", 
  out: "bg-red-500"
};

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || "");
  const [selectedWidth, setSelectedWidth] = useState<string>(product.widths?.[0] || "");
  const [isHovered, setIsHovered] = useState(false);

  const getStockStatus = (stock: number) => {
    if (stock === 0) return "out";
    if (stock <= 4) return "low";
    return "high";
  };

  const getStockText = (stock: number) => {
    if (stock === 0) return "Indisponível";
    if (stock <= 4) return `Apenas ${stock} unidades`;
    return "Disponível";
  };

  const stockStatus = getStockStatus(product.stock);
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  return (
    <Card 
      className="group relative overflow-hidden bg-gradient-subtle border-border/50 shadow-card hover:shadow-luxury transition-all duration-500 transform hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Discount Badge */}
      {hasDiscount && (
        <Badge className="absolute top-3 left-3 z-10 bg-destructive text-white font-bold">
          -{discountPercent}%
        </Badge>
      )}

      {/* Stock Indicator */}
      <div className="absolute top-3 right-3 z-10">
        <div className={`w-3 h-3 rounded-full ${stockColors[stockStatus]}`} />
      </div>

      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-background">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Overlay on hover */}
        <div className={`absolute inset-0 bg-gradient-elegant/20 transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`} />

        {/* Favorite button */}
        <Button
          size="icon"
          variant="ghost"
          className={`absolute top-4 right-4 bg-white/90 hover:bg-white text-luxury-dark transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          <Heart className="h-4 w-4" />
        </Button>
      </div>

      {/* Product Info */}
      <div className="p-6 space-y-4">
        {/* Material Badge */}
        <Badge className={`${materialColors[product.material]} text-xs font-semibold uppercase tracking-wide`}>
          {product.material}
        </Badge>

        {/* Product Name */}
        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {/* Price */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">
              R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                R$ {product.originalPrice!.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            ou 12x de R$ {(product.price / 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* Stock Status */}
        <p className={`text-sm font-medium ${
          stockStatus === 'out' ? 'text-destructive' : 
          stockStatus === 'low' ? 'text-yellow-600' : 
          'text-green-600'
        }`}>
          {getStockText(product.stock)}
        </p>

        {/* Size Selection */}
        {product.sizes.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Tamanho:</label>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                    selectedSize === size
                      ? 'bg-primary text-white shadow-luxury'
                      : 'bg-muted text-muted-foreground hover:bg-primary/20'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Width Selection */}
        {product.widths && product.widths.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Largura:</label>
            <div className="flex flex-wrap gap-2">
              {product.widths.map((width) => (
                <button
                  key={width}
                  onClick={() => setSelectedWidth(width)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                    selectedWidth === width
                      ? 'bg-primary text-white shadow-luxury'
                      : 'bg-muted text-muted-foreground hover:bg-primary/20'
                  }`}
                >
                  {width}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add to Cart Button */}
        <Button
          className="w-full"
          variant={product.stock === 0 ? "outline" : "default"}
          size="tablet"
          disabled={product.stock === 0 || !selectedSize || (product.widths && product.widths.length > 0 && !selectedWidth)}
          onClick={() => selectedSize && onAddToCart(product, selectedSize, selectedWidth)}
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          {product.stock === 0 ? 'Indisponível' : 'Adicionar ao Carrinho'}
        </Button>
      </div>
    </Card>
  );
}