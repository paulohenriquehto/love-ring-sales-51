import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SymbolGrid } from "./SymbolGrid";
import { EngravingCategory, EngravingSymbol, SelectedSymbol } from "@/types/engraving";

interface SymbolSelectorProps {
  selectedSymbols: SelectedSymbol[];
  onSymbolSelect: (symbol: EngravingSymbol, position: 'left' | 'right' | 'above' | 'below') => void;
  onSymbolRemove: (symbolId: string) => void;
}

export function SymbolSelector({ selectedSymbols, onSymbolSelect, onSymbolRemove }: SymbolSelectorProps) {
  const [categories, setCategories] = useState<EngravingCategory[]>([]);
  const [symbols, setSymbols] = useState<EngravingSymbol[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategoriesAndSymbols();
  }, []);

  const loadCategoriesAndSymbols = async () => {
    try {
      const [categoriesResult, symbolsResult] = await Promise.all([
        supabase
          .from("engraving_categories")
          .select("*")
          .eq("active", true)
          .order("sort_order"),
        supabase
          .from("engraving_symbols")
          .select("*")
          .eq("active", true)
      ]);

      if (categoriesResult.error) throw categoriesResult.error;
      if (symbolsResult.error) throw symbolsResult.error;

      setCategories(categoriesResult.data || []);
      setSymbols(symbolsResult.data || []);
    } catch (error) {
      console.error("Erro ao carregar símbolos:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSymbolsByCategory = (categoryId: string) => {
    return symbols.filter(symbol => symbol.category_id === categoryId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-sm text-muted-foreground">Carregando símbolos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-foreground mb-2">
          Elementos Decorativos:
        </h3>
        <p className="text-xs text-muted-foreground">
          Adicione símbolos, signos ou elementos de times à sua gravação
        </p>
      </div>

      <Tabs defaultValue={categories[0]?.id} className="w-full">
        <TabsList className={`grid w-full ${categories.length === 3 ? 'grid-cols-3' : `grid-cols-${categories.length}`}`}>
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="text-xs">
              <span className="mr-1">{category.icon}</span>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="mt-4">
            <SymbolGrid
              symbols={getSymbolsByCategory(category.id)}
              selectedSymbols={selectedSymbols}
              onSymbolSelect={onSymbolSelect}
              onSymbolRemove={onSymbolRemove}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}