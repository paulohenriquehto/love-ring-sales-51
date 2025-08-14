import { useFonts } from "@/contexts/FontContext";
import { type FontValue, type SelectedSymbol, type EngravingSymbol } from "@/types/engraving";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface EngravingPreviewProps {
  text: string;
  font: FontValue;
  selectedSymbols?: SelectedSymbol[];
}

export function EngravingPreview({ text, font, selectedSymbols = [] }: EngravingPreviewProps) {
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
    <div className="bg-card border border-border rounded-lg p-6 min-h-[120px] flex items-center justify-center">
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground mb-3">Visualização:</p>
        
        {text || selectedSymbols.length > 0 ? (
          <div className="flex flex-col items-center gap-2">
            {/* Símbolos acima */}
            {renderSymbols('above')}
            
            {/* Linha principal com texto e símbolos laterais */}
            <div className="flex items-center gap-2">
              {/* Símbolos à esquerda */}
              {renderSymbols('left')}
              
              {/* Texto principal */}
              {text && (
                <div 
                  className={`text-foreground transition-all duration-300 ${fontConfig?.className || 'font-sans'}`}
                >
                  {text}
                </div>
              )}
              
              {/* Símbolos à direita */}
              {renderSymbols('right')}
            </div>
            
            {/* Símbolos abaixo */}
            {renderSymbols('below')}
          </div>
        ) : (
          <div className="text-muted-foreground/60 italic">
            Digite o texto ou selecione símbolos para ver a prévia
          </div>
        )}
      </div>
    </div>
  );
}