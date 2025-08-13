import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Filter } from "lucide-react";

interface FilterBarProps {
  selectedMaterial: string | null;
  selectedCategory: string | null;
  selectedPriceRange: string | null;
  onMaterialChange: (material: string | null) => void;
  onCategoryChange: (category: string | null) => void;
  onPriceRangeChange: (range: string | null) => void;
  onClearFilters: () => void;
}

const materials = [
  { value: "ouro", label: "Ouro", color: "bg-gradient-gold" },
  { value: "prata", label: "Prata", color: "bg-luxury-platinum" },
  { value: "titanio", label: "Titânio", color: "bg-gradient-elegant" },
  { value: "aco", label: "Aço Inox", color: "bg-muted" }
];

const categories = [
  { value: "alianca", label: "💍 Alianças" },
  { value: "anel", label: "💎 Anéis" },
  { value: "colar", label: "📿 Colares" }
];

const priceRanges = [
  { value: "0-100", label: "Até R$ 100" },
  { value: "100-300", label: "R$ 100 - R$ 300" },
  { value: "300-500", label: "R$ 300 - R$ 500" },
  { value: "500+", label: "Acima de R$ 500" }
];

export function FilterBar({
  selectedMaterial,
  selectedCategory,
  selectedPriceRange,
  onMaterialChange,
  onCategoryChange,
  onPriceRangeChange,
  onClearFilters
}: FilterBarProps) {
  const hasActiveFilters = selectedMaterial || selectedCategory || selectedPriceRange;

  return (
    <div className="bg-background border-b border-border/50 py-4">
      <div className="container mx-auto px-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-foreground">Filtros:</span>
          </div>
          
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3 mr-1" />
              Limpar tudo
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {/* Materials */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Material:</h3>
            <div className="flex flex-wrap gap-2">
              {materials.map((material) => (
                <Button
                  key={material.value}
                  variant={selectedMaterial === material.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => 
                    onMaterialChange(selectedMaterial === material.value ? null : material.value)
                  }
                  className={selectedMaterial === material.value ? material.color : ""}
                >
                  {material.label}
                  {selectedMaterial === material.value && (
                    <X className="h-3 w-3 ml-1" />
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Categoria:</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => 
                    onCategoryChange(selectedCategory === category.value ? null : category.value)
                  }
                >
                  {category.label}
                  {selectedCategory === category.value && (
                    <X className="h-3 w-3 ml-1" />
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* Price Ranges */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Preço:</h3>
            <div className="flex flex-wrap gap-2">
              {priceRanges.map((range) => (
                <Button
                  key={range.value}
                  variant={selectedPriceRange === range.value ? "luxury" : "outline"}
                  size="sm"
                  onClick={() => 
                    onPriceRangeChange(selectedPriceRange === range.value ? null : range.value)
                  }
                >
                  {range.label}
                  {selectedPriceRange === range.value && (
                    <X className="h-3 w-3 ml-1" />
                  )}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Filtros ativos:</span>
              {selectedMaterial && (
                <Badge variant="secondary" className="gap-1">
                  {materials.find(m => m.value === selectedMaterial)?.label}
                  <button onClick={() => onMaterialChange(null)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedCategory && (
                <Badge variant="secondary" className="gap-1">
                  {categories.find(c => c.value === selectedCategory)?.label}
                  <button onClick={() => onCategoryChange(null)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedPriceRange && (
                <Badge variant="secondary" className="gap-1">
                  {priceRanges.find(r => r.value === selectedPriceRange)?.label}
                  <button onClick={() => onPriceRangeChange(null)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}