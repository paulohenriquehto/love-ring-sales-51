import { useState, useEffect } from "react";
import { useFonts } from "@/contexts/FontContext";
import { supabase } from "@/integrations/supabase/client";
import { type FontValue, type EngravingSymbol } from "@/types/engraving";

interface EngravingDisplayProps {
  text: string;
  font: FontValue;
  symbols?: string[];
  compact?: boolean;
  showTitle?: boolean;
}

export function EngravingDisplay({ 
  text, 
  font,
  symbols = [],
  compact = false,
  showTitle = true 
}: EngravingDisplayProps) {
  const { fontOptions } = useFonts();
  const [symbolsData, setSymbolsData] = useState<EngravingSymbol[]>([]);
  
  const fontConfig = fontOptions.find(f => f.value === font);

  useEffect(() => {
    if (symbols.length > 0) {
      loadSymbols();
    } else {
      setSymbolsData([]);
    }
  }, [symbols]);

  const loadSymbols = async () => {
    try {
      const { data, error } = await supabase
        .from('engraving_symbols')
        .select('*')
        .in('id', symbols);

      if (error) throw error;
      setSymbolsData(data || []);
    } catch (error) {
      console.error('Erro ao carregar símbolos:', error);
    }
  };

  if (!text && symbols.length === 0) return null;

  return (
    <div className="space-y-2">
      {showTitle && (
        <p className="text-xs text-muted-foreground">Gravação personalizada:</p>
      )}
      
      <div className={`border border-border rounded-lg p-3 bg-background ${
        compact ? 'min-h-[60px]' : 'min-h-[80px]'
      } flex items-center justify-center`}>
        <div className="flex flex-col items-center justify-center space-y-2">
          {/* Texto */}
          {text && (
            <span className={`${fontConfig?.className || 'font-sans'} ${
              compact ? 'text-sm' : 'text-lg'
            } text-foreground font-medium`}>
              "{text}"
            </span>
          )}
          
          {/* Símbolos */}
          {symbols.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap justify-center">
              {symbolsData.map(symbol => (
                <img
                  key={symbol.id}
                  src={symbol.image_url || ''}
                  alt={symbol.name}
                  className={`object-contain ${compact ? 'w-4 h-4' : 'w-5 h-5'}`}
                  title={symbol.name}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      
      {!compact && (
        <div className="flex justify-center text-xs text-muted-foreground">
          <span>Fonte: {fontConfig?.label || font}</span>
        </div>
      )}
    </div>
  );
}