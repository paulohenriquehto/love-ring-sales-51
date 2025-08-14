import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { FilterBar } from "@/components/FilterBar";
import { ProductCard } from "@/components/ProductCard";
import { Cart } from "@/components/Cart";
import { useToast } from "@/hooks/use-toast";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Loader2 } from "lucide-react";
import { type EngravingCustomization, type EngravingConfig } from "@/types/engraving";

// Interfaces para os dados do Supabase
interface Category {
  id: string;
  name: string;
  description?: string;
}

interface Material {
  id: string;
  name: string;
  description?: string;
  price_multiplier: number;
}

interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
}

interface ProductVariant {
  id: string;
  product_id: string;
  size?: string;
  width?: string;
  color?: string;
  price_adjustment: number;
  materials?: Material;
}

interface ProductImage {
  id: string;
  image_url: string;
  alt_text?: string;
  is_primary: boolean;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  base_price: number;
  weight?: number;
  active: boolean;
  categories?: Category;
  suppliers?: Supplier;
  product_variants?: ProductVariant[];
  product_images?: ProductImage[];
}

// Interface para produtos do Supabase (com tipos mais flexíveis)
interface SupabaseProduct {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  base_price: number;
  weight?: number;
  active: boolean;
  categories?: Category;
  suppliers?: Supplier;
  product_variants?: any[];
  product_images?: any[];
}

// Tipos aceitos pelo ProductCard (limitados)
type MaterialType = "ouro" | "prata" | "titanio" | "aco";
type CategoryType = "alianca" | "anel" | "colar";

// Interface para produtos transformados para display (compatível com ProductCard)
interface DisplayProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  material: MaterialType;
  category: CategoryType;
  stock: number;
  sizes: string[];
  widths?: string[];
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  material: string;
  size: string;
  width?: string;
  quantity: number;
  variant_id?: string;
  engraving?: EngravingCustomization;
}

const Index = () => {
  const { profile } = useAuth();
  
  // Estados para dados do Supabase
  const [products, setProducts] = useState<SupabaseProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [engravingConfigs, setEngravingConfigs] = useState<EngravingConfig[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados do carrinho e filtros
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | null>(null);

  const { toast } = useToast();

  // Carregar dados do Supabase
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Buscar produtos com relacionamentos
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select(`
          *,
          categories:category_id(id, name, description),
          suppliers:supplier_id(id, name, contact_person),
          product_variants(
            id,
            size,
            width,
            color,
            price_adjustment,
            materials:material_id(id, name, description, price_multiplier)
          ),
          product_images(
            id,
            image_url,
            alt_text,
            is_primary
          )
        `)
        .eq("active", true)
        .order("name");

      if (productsError) throw productsError;

      // Buscar categorias
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .eq("active", true)
        .order("name");

      if (categoriesError) throw categoriesError;

      // Buscar materiais
      const { data: materialsData, error: materialsError } = await supabase
        .from("materials")
        .select("*")
        .eq("active", true)
        .order("name");

      if (materialsError) throw materialsError;

      // Buscar configurações de gravação
      const { data: engravingData, error: engravingError } = await supabase
        .from("product_engraving_config")
        .select("*")
        .eq("supports_engraving", true);

      if (engravingError) throw engravingError;

      setProducts(productsData || []);
      setCategories(categoriesData || []);
      setMaterials(materialsData || []);
      setEngravingConfigs(engravingData || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar produtos. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Calcular preço do produto com variação
  const calculateProductPrice = (product: SupabaseProduct, variant?: any) => {
    let basePrice = product.base_price;
    if (variant?.materials?.price_multiplier) {
      basePrice *= variant.materials.price_multiplier;
    }
    if (variant?.price_adjustment) {
      basePrice += variant.price_adjustment;
    }
    return basePrice;
  };

  // Mapear categoria do banco para valores do filtro (limitado aos tipos do ProductCard)
  const mapCategoryToFilter = (categoryName: string): CategoryType => {
    const mapping: { [key: string]: CategoryType } = {
      "Anéis": "anel",
      "Colares": "colar",
      "Brincos": "anel", // Mapeado para anel por compatibilidade
      "Pulseiras": "anel", // Mapeado para anel por compatibilidade
      "Relógios": "anel", // Mapeado para anel por compatibilidade
      "Pingentes": "colar" // Mapeado para colar por compatibilidade
    };
    return mapping[categoryName] || "anel";
  };

  // Mapear material do banco para valores do filtro
  const mapMaterialToFilter = (materialName: string): MaterialType => {
    const mapping: { [key: string]: MaterialType } = {
      "Ouro 18k": "ouro",
      "Prata 925": "prata",
      "Titânio": "titanio",
      "Aço Inox": "aco",
      "Ouro Branco 18k": "ouro",
      "Ouro Rose 18k": "ouro"
    };
    return mapping[materialName] || "ouro";
  };

  // Filtrar produtos
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Filtro por categoria
      if (selectedCategory) {
        const productCategory = mapCategoryToFilter(product.categories?.name || "");
        if (productCategory !== selectedCategory) {
          return false;
        }
      }

      // Filtro por material
      if (selectedMaterial) {
        const hasVariantWithMaterial = product.product_variants?.some(variant => {
          const materialFilter = mapMaterialToFilter(variant.materials?.name || "");
          return materialFilter === selectedMaterial;
        });
        if (!hasVariantWithMaterial) {
          return false;
        }
      }

      // Filtro por faixa de preço
      if (selectedPriceRange) {
        const price = calculateProductPrice(product);
        if (selectedPriceRange === '500+') {
          if (price < 500) return false;
        } else {
          const [min, max] = selectedPriceRange.split('-').map(Number);
          if (price < min || price > max) return false;
        }
      }

      return true;
    });
  }, [products, selectedCategory, selectedMaterial, selectedPriceRange]);

  const cartItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  const handleAddToCart = (product: any, size: string, width?: string, engraving?: EngravingCustomization) => {
    // Para compatibilidade com o ProductCard existente, tratamos product como um produto transformado
    const existingItemIndex = cartItems.findIndex(
      item => item.id === product.id && 
              item.size === size && 
              item.width === width &&
              JSON.stringify(item.engraving) === JSON.stringify(engraving)
    );

    if (existingItemIndex >= 0) {
      const newItems = [...cartItems];
      newItems[existingItemIndex].quantity += 1;
      setCartItems(newItems);
    } else {
      const newItem: CartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        material: product.material,
        size: size,
        width: width,
        quantity: 1,
        engraving: engraving
      };
      setCartItems([...cartItems, newItem]);
    }

    const widthText = width ? ` • Largura ${width}` : '';
    const engravingText = engraving ? ` • Gravação: "${engraving.text}"` : '';
    toast({
      title: "Produto adicionado!",
      description: `${product.name} (Tamanho ${size}${widthText}${engravingText}) foi adicionado ao carrinho.`,
    });
  };

  const handleUpdateQuantity = (id: string, size: string, width: string | undefined, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(id, size, width);
      return;
    }

    setCartItems(items =>
      items.map(item =>
        item.id === id && item.size === size && item.width === width
          ? { ...item, quantity }
          : item
      )
    );
  };

  const handleRemoveItem = (id: string, size: string, width?: string) => {
    setCartItems(items =>
      items.filter(item => !(item.id === id && item.size === size && item.width === width))
    );

    toast({
      title: "Produto removido",
      description: "Item removido do carrinho.",
    });
  };

  const handleCheckout = () => {
    toast({
      title: "Iniciando checkout...",
      description: "Redirecionando para finalização da venda.",
    });
  };

  const handleClearFilters = () => {
    setSelectedMaterial(null);
    setSelectedCategory(null);
    setSelectedPriceRange(null);
  };

  // Transformar produtos do Supabase para o formato esperado pelo ProductCard
  const transformProductsForDisplay = (products: SupabaseProduct[]): DisplayProduct[] => {
    return products.map(product => {
      const primaryVariant = product.product_variants?.[0];
      const primaryImage = product.product_images?.find(img => img.is_primary)?.image_url || "/placeholder.svg";
      
      return {
        id: product.id,
        name: product.name,
        price: calculateProductPrice(product, primaryVariant),
        image: primaryImage,
        material: mapMaterialToFilter(primaryVariant?.materials?.name || ""),
        category: mapCategoryToFilter(product.categories?.name || ""),
        stock: 10, // TODO: Integrar com sistema de estoque
        sizes: [...new Set(product.product_variants?.map(v => v.size).filter(Boolean) || [])],
        widths: [...new Set(product.product_variants?.map(v => v.width).filter(Boolean) || [])]
      };
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Carregando catálogo...</p>
        </div>
      </div>
    );
  }

  const displayProducts = transformProductsForDisplay(filteredProducts);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-subtle">
        <Header
          cartItemsCount={cartItemsCount}
          cartTotal={cartTotal}
          onCartClick={() => setIsCartOpen(true)}
          employeeName={profile?.full_name || "Usuário"}
        />

        <FilterBar
          selectedMaterial={selectedMaterial}
          selectedCategory={selectedCategory}
          selectedPriceRange={selectedPriceRange}
          onMaterialChange={setSelectedMaterial}
          onCategoryChange={setSelectedCategory}
          onPriceRangeChange={setSelectedPriceRange}
          onClearFilters={handleClearFilters}
        />

        <main className="container mx-auto px-6 py-8">
          {/* Results Summary */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Catálogo de Produtos
            </h2>
            <p className="text-muted-foreground">
              {displayProducts.length} produto{displayProducts.length !== 1 ? 's' : ''} encontrado{displayProducts.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayProducts.map((product) => {
              const engravingConfig = engravingConfigs.find(config => config.product_id === product.id);
              
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  engravingConfig={engravingConfig}
                />
              );
            })}
          </div>

          {/* Empty State */}
          {displayProducts.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">💍</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Nenhum produto encontrado
              </h3>
              <p className="text-muted-foreground mb-4">
                Tente ajustar os filtros para encontrar o que procura
              </p>
              <button
                onClick={handleClearFilters}
                className="text-primary hover:text-primary-glow underline"
              >
                Limpar todos os filtros
              </button>
            </div>
          )}
        </main>

        <Cart
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
        />
      </div>
    </ProtectedRoute>
  );
};

export default Index;