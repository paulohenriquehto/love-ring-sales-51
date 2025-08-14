import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { type EngravingSymbol, type EngravingCategory } from "@/types/engraving";
import { X } from "lucide-react";

interface SymbolSelectorProps {
  selectedSymbols: string[];
  onChange: (symbols: string[]) => void;
}

export function SymbolSelector({ selectedSymbols, onChange }: SymbolSelectorProps) {
  const [symbols, setSymbols] = useState<EngravingSymbol[]>([]);
  const [categories, setCategories] = useState<EngravingCategory[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">Símbolos:</Label>
        <div className="text-sm text-muted-foreground">Carregando símbolos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
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

      {/* Grid de símbolos disponíveis */}
      <div className="max-h-60 overflow-y-auto border border-border rounded-lg p-3">
        {categories.map(category => {
          const categorySymbols = symbols.filter(symbol => symbol.category_id === category.id);
          
          if (categorySymbols.length === 0) return null;

          return (
            <div key={category.id} className="space-y-2 mb-4 last:mb-0">
              <Label className="text-xs font-medium text-muted-foreground">
                {category.name}
              </Label>
              <div className="grid grid-cols-6 gap-2">
                {categorySymbols.map(symbol => (
                  <button
                    key={symbol.id}
                    type="button"
                    onClick={() => handleSymbolToggle(symbol.id)}
                    className={`relative p-2 rounded-lg border-2 transition-all hover:scale-105 ${
                      selectedSymbols.includes(symbol.id)
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                    title={symbol.name}
                  >
                    <img
                      src={symbol.image_url || ''}
                      alt={symbol.name}
                      className="w-8 h-8 object-contain mx-auto"
                    />
                    {selectedSymbols.includes(symbol.id) && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-xs text-primary-foreground font-bold">✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}