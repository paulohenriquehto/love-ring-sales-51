import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { EngravingPreview } from "./EngravingPreview";
import { FontSelector } from "./FontSelector";
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

  const handleConfirm = () => {
    if (!text.trim()) return;
    
    onConfirm({
      text: text.trim(),
      font,
      productId,
      variantId
    });
  };

  const isValid = text.length > 0 && text.length <= config.max_characters;

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

      <div className="flex-1 overflow-y-auto px-4 space-y-3">
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

        {/* Preview */}
        <EngravingPreview 
          text={text} 
          font={font} 
        />

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
            {existingCustomization ? 'Salvar alterações' : 'Confirmar gravação'}
          </Button>
        </div>
      </div>
    </div>
  );
}