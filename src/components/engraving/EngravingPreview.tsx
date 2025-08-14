import { useFonts } from "@/contexts/FontContext";
import { type FontValue, type SelectedSymbol, type EngravingSymbol } from "@/types/engraving";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface EngravingPreviewProps {
  text: string;
  font: FontValue;
  selectedSymbols?: SelectedSymbol[];
  onSymbolRemove?: (symbolId: string) => void;
}

export function EngravingPreview({ text, font, selectedSymbols = [], onSymbolRemove }: EngravingPreviewProps) {
  const { fontOptions } = useFonts();
  const [symbols, setSymbols] = useState<EngravingSymbol[]>([]);
  
  const fontConfig = fontOptions.find(f => f.value === font);

  useEffect(() => {
    if (selectedSymbols.length > 0) {
      loadSymbols();
    }
  }, [selectedSymbols]);

  const loadSymbols = async () => {
    const symbolIds = selectedSymbols.map(s => s.symbolId);
    const { data } = await supabase
      .from("engraving_symbols")
      .select("*")
      .in("id", symbolIds);
    
    if (data) {
      setSymbols(data);
    }
  };

  const getSymbolsByPosition = (position: 'left' | 'right' | 'above' | 'below') => {
    return selectedSymbols
      .filter(s => s.position === position)
      .map(s => symbols.find(sym => sym.id === s.symbolId))
      .filter(Boolean);
  };

  const renderSymbols = (position: 'left' | 'right' | 'above' | 'below') => {
    const positionSymbols = getSymbolsByPosition(position);
    if (positionSymbols.length === 0) return null;

    return (
      <div className={`flex gap-1 ${position === 'above' || position === 'below' ? 'justify-center' : ''}`}>
        {positionSymbols.map((symbol, index) => (
          <span key={`${symbol?.id}-${index}`} className="text-lg">
            {symbol?.unicode_char}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          Pré-visualização:
        </label>
        {selectedSymbols.length > 0 && (
          <div className="flex gap-1">
            {selectedSymbols.map((selected) => {
              const symbol = symbols.find(s => s.id === selected.symbolId);
              if (!symbol) return null;
              
              return (
                <div
                  key={selected.symbolId}
                  className="flex items-center gap-1 bg-secondary px-1.5 py-0.5 rounded text-xs"
                >
                  <span>{symbol.unicode_char}</span>
                  <span className="text-[10px]">
                    {selected.position === 'left' ? '←' : 
                     selected.position === 'right' ? '→' : 
                     selected.position === 'above' ? '↑' : '↓'}
                  </span>
                  {onSymbolRemove && (
                    <button
                      className="hover:text-destructive"
                      onClick={() => onSymbolRemove(selected.symbolId)}
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="border border-border rounded-lg p-4 bg-background min-h-[80px] flex items-center justify-center">
        {(text || selectedSymbols.length > 0) ? (
          <div className="flex flex-col items-center space-y-1">
            {/* Symbols above */}
            <div className="flex items-center space-x-1">
              {renderSymbols('above')}
            </div>
            
            <div className="flex items-center space-x-1">
              {/* Symbols left */}
              <div className="flex items-center space-x-1">
                {renderSymbols('left')}
              </div>
              
              {/* Main text */}
              {text && (
                <span className={`${fontConfig?.className || 'font-sans'} text-lg text-foreground`}>
                  {text}
                </span>
              )}
              
              {/* Symbols right */}
              <div className="flex items-center space-x-1">
                {renderSymbols('right')}
              </div>
            </div>
            
            {/* Symbols below */}
            <div className="flex items-center space-x-1">
              {renderSymbols('below')}
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            Digite um texto ou escolha símbolos para ver a pré-visualização
          </p>
        )}
      </div>
    </div>
  );
}