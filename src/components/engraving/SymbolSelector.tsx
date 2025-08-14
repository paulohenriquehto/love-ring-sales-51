import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { type EngravingSymbol, type EngravingCategory } from "@/types/engraving";
import { X, Search } from "lucide-react";

interface SymbolSelectorProps {
  selectedSymbols: string[];
  onChange: (symbols: string[]) => void;
}

export function SymbolSelector({ selectedSymbols, onChange }: SymbolSelectorProps) {
  const [symbols, setSymbols] = useState<EngravingSymbol[]>([]);
  const [categories, setCategories] = useState<EngravingCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesResult, symbolsResult] = await Promise.all([
        supabase
          .from('engraving_categories')
          .select('*')
          .eq('active', true)
          .order('sort_order'),
        supabase
          .from('engraving_symbols')
          .select('*')
          .eq('active', true)
          .order('name')
      ]);

      if (categoriesResult.error) throw categoriesResult.error;
      if (symbolsResult.error) throw symbolsResult.error;

      setCategories(categoriesResult.data || []);
      setSymbols(symbolsResult.data || []);
    } catch (error) {
      console.error('Erro ao carregar símbolos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSymbolToggle = (symbolId: string) => {
    const isSelected = selectedSymbols.includes(symbolId);
    if (isSelected) {
      onChange(selectedSymbols.filter(id => id !== symbolId));
    } else {
      onChange([...selectedSymbols, symbolId]);
    }
  };

  const getSelectedSymbolsData = () => {
    return symbols.filter(symbol => selectedSymbols.includes(symbol.id));
  };

  const getSymbolsByCategory = (categoryId: string) => {
    return symbols.filter(symbol => 
      symbol.category_id === categoryId && 
      (searchTerm === "" || symbol.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">Símbolos:</Label>
        <div className="text-sm text-muted-foreground">Carregando símbolos...</div>
      </div>
    );
  }

  const renderSymbolGrid = (categorySymbols: EngravingSymbol[]) => (
    <div className="grid grid-cols-5 gap-3">
      {categorySymbols.map(symbol => (
        <button
          key={symbol.id}
          type="button"
          onClick={() => handleSymbolToggle(symbol.id)}
          className={`relative p-3 rounded-lg border-2 transition-all hover:scale-105 ${
            selectedSymbols.includes(symbol.id)
              ? 'border-primary bg-primary/10'
              : 'border-border hover:border-primary/50'
          }`}
          title={symbol.name}
        >
          <img
            src={symbol.image_url || ''}
            alt={symbol.name}
            className="w-10 h-10 object-contain mx-auto"
          />
          {selectedSymbols.includes(symbol.id) && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
              <span className="text-xs text-primary-foreground font-bold">✓</span>
            </div>
          )}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">
          Símbolos: ({selectedSymbols.length} selecionados)
        </Label>
      </div>

      {/* Símbolos selecionados */}
      {selectedSymbols.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Selecionados:</Label>
          <div className="flex flex-wrap gap-2">
            {getSelectedSymbolsData().map(symbol => (
              <div
                key={symbol.id}
                className="relative group bg-muted rounded-lg p-2 flex items-center gap-2"
              >
                <img
                  src={symbol.image_url || ''}
                  alt={symbol.name}
                  className="w-6 h-6 object-contain"
                />
                <span className="text-xs">{symbol.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => handleSymbolToggle(symbol.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Barra de busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar símbolos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Abas por categorias */}
      <Tabs defaultValue={categories[0]?.id || ""} className="w-full">
        <TabsList className="grid grid-cols-3 w-full">
          {categories.map(category => (
            <TabsTrigger key={category.id} value={category.id} className="text-xs">
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map(category => {
          const categorySymbols = getSymbolsByCategory(category.id);
          
          return (
            <TabsContent key={category.id} value={category.id} className="mt-4">
              <div className="max-h-80 overflow-y-auto">
                {categorySymbols.length > 0 ? (
                  renderSymbolGrid(categorySymbols)
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchTerm ? 'Nenhum símbolo encontrado' : 'Nenhum símbolo disponível'}
                  </div>
                )}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}