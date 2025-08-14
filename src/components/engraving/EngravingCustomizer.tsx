import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { EngravingPreview } from "./EngravingPreview";
import { FontSelector } from "./FontSelector";
import { SymbolSelector } from "./SymbolSelector";
import { type EngravingCustomization, type EngravingConfig, type FontValue } from "@/types/engraving";

interface EngravingCustomizerProps {
  config: EngravingConfig;
  onConfirm: (customization: EngravingCustomization) => void;
  onCancel: () => void;
  productId: string;
  variantId?: string;
  existingCustomization?: EngravingCustomization;
}

export function EngravingCustomizer({ 
  config, 
  onConfirm, 
  onCancel, 
  productId, 
  variantId,
  existingCustomization 
}: EngravingCustomizerProps) {
  const [text, setText] = useState(existingCustomization?.text || "");
  const [font, setFont] = useState<FontValue>(existingCustomization?.font || "arial");
  const [symbols, setSymbols] = useState<string[]>(existingCustomization?.symbols || []);
  const [symbolPosition, setSymbolPosition] = useState<'before' | 'middle' | 'after'>(
    existingCustomization?.symbolPosition || 'after'
  );

  const handleConfirm = () => {
    if (!text.trim() && symbols.length === 0) return;
    
    onConfirm({
      text: text.trim(),
      font,
      symbols,
      symbolPosition,
      productId,
      variantId
    });
  };

  const isValid = (text.length > 0 && text.length <= config.max_characters) || symbols.length > 0;

  return (
    <div className="max-h-[85vh] overflow-hidden flex flex-col">
      <div className="text-center border-b border-border pb-3 px-4 pt-4">
        <h3 className="text-lg font-semibold text-foreground">
          {existingCustomization ? 'Editar Gravação' : 'Personalização da Gravação'}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {existingCustomization ? 'Modifique sua personalização' : 'Adicione um toque pessoal à sua peça'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text">Texto</TabsTrigger>
            <TabsTrigger value="symbols">Símbolos</TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-3 mt-3">
            {/* Text Input */}
            <div className="space-y-2">
              <Label htmlFor="engraving-text" className="text-sm font-medium">
                Texto da gravação:
              </Label>
              <div className="space-y-1">
                <Input
                  id="engraving-text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Digite seu texto aqui..."
                  maxLength={config.max_characters}
                  className="w-full"
                />
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">
                    Máx. {config.max_characters} caracteres
                  </span>
                  <span className={`font-medium ${
                    text.length > config.max_characters ? 'text-destructive' : 'text-muted-foreground'
                  }`}>
                    {text.length}/{config.max_characters}
                  </span>
                </div>
              </div>
            </div>

            {/* Font Selection */}
            <FontSelector
              value={font}
              onChange={setFont}
              availableFonts={config.available_fonts}
            />
          </TabsContent>

          <TabsContent value="symbols" className="space-y-3 mt-3">
            <SymbolSelector
              selectedSymbols={symbols}
              onChange={setSymbols}
            />
            
            {/* Controle de posicionamento de símbolos */}
            {symbols.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border">
                <Label className="text-sm font-medium">
                  Posição dos símbolos:
                </Label>
                <RadioGroup
                  value={symbolPosition}
                  onValueChange={(value: 'before' | 'middle' | 'after') => setSymbolPosition(value)}
                  className="grid grid-cols-1 gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="before" id="before" />
                    <Label htmlFor="before" className="text-sm cursor-pointer">
                      Antes do nome
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="middle" id="middle" />
                    <Label htmlFor="middle" className="text-sm cursor-pointer">
                      No meio do nome
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="after" id="after" />
                    <Label htmlFor="after" className="text-sm cursor-pointer">
                      Após o nome
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Preview */}
        <div className="mt-4">
          <EngravingPreview 
            text={text} 
            font={font}
            symbols={symbols}
            symbolPosition={symbolPosition}
          />
        </div>

        {/* Price Info */}
        {config.price_adjustment > 0 && (
          <div className="bg-muted/50 rounded-lg p-2 text-center">
            <p className="text-sm text-muted-foreground">
              Gravação: <span className="font-semibold text-foreground">
                +R$ {config.price_adjustment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons - Sticky bottom */}
      <div className="border-t border-border bg-background p-4">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isValid}
            className="flex-1 bg-gradient-elegant text-white hover:bg-gradient-elegant/90"
          >
            {existingCustomization ? 'Salvar alterações' : 'Confirmar personalização'}
          </Button>
        </div>
      </div>
    </div>
  );
}