import { useState, useEffect } from "react";
import { useFonts } from "@/contexts/FontContext";
import { supabase } from "@/integrations/supabase/client";
import { type FontValue, type EngravingSymbol } from "@/types/engraving";

interface EngravingPreviewProps {
  text: string;
  font: FontValue;
  symbols?: string[];
}

export function EngravingPreview({ text, font, symbols = [] }: EngravingPreviewProps) {
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

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          Pré-visualização:
        </label>
      </div>
      
      <div className="border border-border rounded-lg p-4 bg-background min-h-[80px] flex items-center justify-center">
        {text || symbols.length > 0 ? (
          <div className="flex flex-col items-center justify-center space-y-3">
            {/* Texto */}
            {text && (
              <span className={`${fontConfig?.className || 'font-sans'} text-lg text-foreground`}>
                {text}
              </span>
            )}
            
            {/* Símbolos */}
            {symbols.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap justify-center">
                {symbolsData.map(symbol => (
                  <img
                    key={symbol.id}
                    src={symbol.image_url || ''}
                    alt={symbol.name}
                    className="w-6 h-6 object-contain"
                    title={symbol.name}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            Digite um texto ou selecione símbolos para ver a pré-visualização
          </p>
        )}
      </div>
    </div>
  );
}