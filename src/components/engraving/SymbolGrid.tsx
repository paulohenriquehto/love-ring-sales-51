import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EngravingSymbol, SelectedSymbol } from "@/types/engraving";
import { X } from "lucide-react";

interface SymbolGridProps {
  symbols: EngravingSymbol[];
  selectedSymbols: SelectedSymbol[];
  onSymbolSelect: (symbol: EngravingSymbol, position: 'left' | 'right' | 'above' | 'below') => void;
  onSymbolRemove: (symbolId: string) => void;
}

export function SymbolGrid({ symbols, selectedSymbols, onSymbolSelect, onSymbolRemove }: SymbolGridProps) {
  const [selectedSymbolForPosition, setSelectedSymbolForPosition] = useState<EngravingSymbol | null>(null);
  const [positionDialogOpen, setPositionDialogOpen] = useState(false);

  const handleSymbolClick = (symbol: EngravingSymbol) => {
    const isSelected = selectedSymbols.some(s => s.symbolId === symbol.id);
    
    if (isSelected) {
      onSymbolRemove(symbol.id);
    } else {
      setSelectedSymbolForPosition(symbol);
      setPositionDialogOpen(true);
    }
  };

  const handlePositionSelect = (position: 'left' | 'right' | 'above' | 'below') => {
    if (selectedSymbolForPosition) {
      onSymbolSelect(selectedSymbolForPosition, position);
      setPositionDialogOpen(false);
      setSelectedSymbolForPosition(null);
    }
  };

  const isSymbolSelected = (symbolId: string) => {
    return selectedSymbols.some(s => s.symbolId === symbolId);
  };

  const getSymbolPosition = (symbolId: string) => {
    const symbol = selectedSymbols.find(s => s.symbolId === symbolId);
    return symbol?.position;
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-8 gap-1.5 max-h-48 overflow-y-auto">
        {symbols.map((symbol) => {
          const isSelected = isSymbolSelected(symbol.id);
          const position = getSymbolPosition(symbol.id);
          
          return (
            <div
              key={symbol.id}
              className={`relative group cursor-pointer p-2 border rounded-md transition-all hover:border-primary ${
                isSelected ? 'border-primary bg-primary/10' : 'border-border'
              }`}
              onClick={() => handleSymbolClick(symbol)}
            >
              <div className="text-xl text-center">{symbol.unicode_char}</div>
              <div className="text-[10px] text-center text-muted-foreground mt-0.5 truncate">
                {symbol.name}
              </div>
              
              {isSelected && (
                <>
                  <div className="absolute -top-1 -right-1">
                    <X className="h-4 w-4 text-destructive" />
                  </div>
                  {position && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                      <div className="text-xs bg-primary text-primary-foreground px-1 rounded">
                        {position === 'left' ? '←' : position === 'right' ? '→' : position === 'above' ? '↑' : '↓'}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>


      <Dialog open={positionDialogOpen} onOpenChange={setPositionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Escolha a Posição</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Onde você gostaria de posicionar o símbolo "{selectedSymbolForPosition?.name}"?
            </p>
            
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => handlePositionSelect('left')}
                className="flex items-center gap-2"
              >
                ← Esquerda
              </Button>
              <Button
                variant="outline"
                onClick={() => handlePositionSelect('right')}
                className="flex items-center gap-2"
              >
                Direita →
              </Button>
              <Button
                variant="outline"
                onClick={() => handlePositionSelect('above')}
                className="flex items-center gap-2"
              >
                ↑ Acima
              </Button>
              <Button
                variant="outline"
                onClick={() => handlePositionSelect('below')}
                className="flex items-center gap-2"
              >
                ↓ Abaixo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}