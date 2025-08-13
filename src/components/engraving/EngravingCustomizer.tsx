import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EngravingPreview } from "./EngravingPreview";
import { FontSelector } from "./FontSelector";
import { type EngravingCustomization, type EngravingConfig, type FontValue } from "@/types/engraving";

interface EngravingCustomizerProps {
  config: EngravingConfig;
  onConfirm: (customization: EngravingCustomization) => void;
  onCancel: () => void;
  productId: string;
  variantId?: string;
}

export function EngravingCustomizer({ 
  config, 
  onConfirm, 
  onCancel, 
  productId, 
  variantId 
}: EngravingCustomizerProps) {
  const [text, setText] = useState("");
  const [font, setFont] = useState<FontValue>("arial");

  const handleConfirm = () => {
    if (!text.trim()) return;
    
    onConfirm({
      text: text.trim(),
      font,
      productId,
      variantId
    });
  };

  const remainingChars = config.max_characters - text.length;
  const isTextValid = text.length > 0 && text.length <= config.max_characters;

  return (
    <div className="space-y-6 p-6">
      <div className="text-center border-b border-border pb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Personalização da Gravação
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Adicione um toque pessoal à sua peça
        </p>
      </div>

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
              Aqui somente até {config.max_characters} caracteres
            </span>
            <span className={`font-medium ${
              remainingChars < 5 ? 'text-destructive' : 'text-muted-foreground'
            }`}>
              {remainingChars} restantes
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
      <EngravingPreview text={text} font={font} />

      {/* Price Info */}
      {config.price_adjustment > 0 && (
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <p className="text-sm text-muted-foreground">
            Gravação personalizada:{" "}
            <span className="font-semibold text-foreground">
              +R$ {config.price_adjustment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={!isTextValid}
          className="flex-1 bg-gradient-elegant text-white hover:bg-gradient-elegant/90"
        >
          Confirmar gravação
        </Button>
      </div>
    </div>
  );
}