import { useFonts } from "@/contexts/FontContext";
import { type FontValue, type SelectedSymbol, type EngravingSymbol } from "@/types/engraving";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface EngravingDisplayProps {
  text: string;
  font: FontValue;
  selectedSymbols?: SelectedSymbol[];
  compact?: boolean;
  showTitle?: boolean;
}

export function EngravingDisplay({ 
  text, 
  font, 
  selectedSymbols = [], 
  compact = false,
  showTitle = true 
}: EngravingDisplayProps) {
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
          <div key={`${symbol?.id}-${index}`} className={`flex items-center justify-center ${compact ? "w-4 h-4" : "w-6 h-6"}`}>
            {(symbol as any)?.image_url ? (
              <img 
                src={(symbol as any).image_url} 
                alt={symbol?.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <span className={compact ? "text-sm" : "text-lg"}>
                {symbol?.unicode_char}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  };

  const hasContent = text || selectedSymbols.length > 0;

  if (!hasContent) return null;

  return (
    <div className="space-y-2">
      {showTitle && (
        <p className="text-xs text-muted-foreground">Gravação personalizada:</p>
      )}
      
      <div className={`border border-border rounded-lg p-3 bg-background ${
        compact ? 'min-h-[60px]' : 'min-h-[80px]'
      } flex items-center justify-center`}>
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
              <span className={`${fontConfig?.className || 'font-sans'} ${
                compact ? 'text-sm' : 'text-lg'
              } text-foreground font-medium`}>
                "{text}"
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
      </div>
      
      {!compact && (
        <div className="flex justify-center gap-4 text-xs text-muted-foreground">
          <span>Fonte: {fontConfig?.label || font}</span>
          {selectedSymbols.length > 0 && (
            <span>{selectedSymbols.length} símbolo{selectedSymbols.length > 1 ? 's' : ''}</span>
          )}
        </div>
      )}
    </div>
  );
}