import { useState, useEffect } from "react";
import { useFonts } from "@/contexts/FontContext";
import { supabase } from "@/integrations/supabase/client";
import { type FontValue, type EngravingSymbol } from "@/types/engraving";

interface EngravingDisplayProps {
  text: string;
  font: FontValue;
  symbols?: string[];
  symbolPosition?: 'before' | 'middle' | 'after';
  compact?: boolean;
  showTitle?: boolean;
}

export function EngravingDisplay({ 
  text, 
  font,
  symbols = [],
  symbolPosition = 'after',
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

  const renderSymbols = () => {
    return symbolsData.map(symbol => (
      <img
        key={symbol.id}
        src={symbol.image_url || ''}
        alt={symbol.name}
        className={`object-contain ${compact ? 'w-4 h-4' : 'w-5 h-5'}`}
        title={symbol.name}
      />
    ));
  };

  const renderEngravingContent = () => {
    const textElement = text ? (
      <span className={`${fontConfig?.className || 'font-sans'} ${
        compact ? 'text-sm' : 'text-lg'
      } text-foreground font-medium`}>
        {symbolPosition === 'middle' ? renderTextWithMiddleSymbols() : `"${text}"`}
      </span>
    ) : null;

    const symbolElements = symbols.length > 0 && symbolPosition !== 'middle' ? renderSymbols() : null;

    switch (symbolPosition) {
      case 'before':
        return (
          <>
            {symbolElements}
            {textElement}
          </>
        );
      case 'middle':
        return textElement; // Símbolos já inseridos no meio do texto
      case 'after':
      default:
        return (
          <>
            {textElement}
            {symbolElements}
          </>
        );
    }
  };

  const renderTextWithMiddleSymbols = () => {
    if (!text || symbols.length === 0) return `"${text}"`;
    
    const words = text.split(' ');
    if (words.length === 1) {
      // Se só tem uma palavra, coloca símbolos no final
      return (
        <>
          "{text}"
          {renderSymbols()}
        </>
      );
    }
    
    // Insere símbolos entre a primeira e segunda palavra
    const firstWord = words[0];
    const restOfText = words.slice(1).join(' ');
    
    return (
      <>
        "{firstWord}
        {renderSymbols()}
        {restOfText}"
      </>
    );
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
        <div className="flex items-center justify-center flex-wrap gap-1">
          {renderEngravingContent()}
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