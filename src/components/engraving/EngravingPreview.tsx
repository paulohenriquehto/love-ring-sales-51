import { useState, useEffect } from "react";
import { useFonts } from "@/contexts/FontContext";
import { supabase } from "@/integrations/supabase/client";
import { type FontValue, type EngravingSymbol } from "@/types/engraving";

interface EngravingPreviewProps {
  text: string;
  font: FontValue;
  symbols?: string[];
  symbolPosition?: 'before' | 'middle' | 'after';
}

export function EngravingPreview({ text, font, symbols = [], symbolPosition = 'after' }: EngravingPreviewProps) {
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
        className="w-6 h-6 object-contain"
        title={symbol.name}
      />
    ));
  };

  const renderEngravingContent = () => {
    const textElement = text ? (
      <span className={`${fontConfig?.className || 'font-sans'} text-lg text-foreground`}>
        {symbolPosition === 'middle' ? renderTextWithMiddleSymbols() : text}
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
    if (!text || symbols.length === 0) return text;
    
    const words = text.split(' ');
    if (words.length === 1) {
      // Se só tem uma palavra, coloca símbolos no final
      return (
        <>
          {text}
          {renderSymbols()}
        </>
      );
    }
    
    // Insere símbolos entre a primeira e segunda palavra
    const firstWord = words[0];
    const restOfText = words.slice(1).join(' ');
    
    return (
      <>
        {firstWord}
        {renderSymbols()}
        {restOfText}
      </>
    );
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
          <div className="flex items-center justify-center flex-wrap gap-2">
            {renderEngravingContent()}
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