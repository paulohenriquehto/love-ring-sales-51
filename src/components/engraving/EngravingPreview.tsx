import { useFonts } from "@/contexts/FontContext";
import { type FontValue } from "@/types/engraving";

interface EngravingPreviewProps {
  text: string;
  font: FontValue;
}

export function EngravingPreview({ text, font }: EngravingPreviewProps) {
  const { fontOptions } = useFonts();
  
  const fontConfig = fontOptions.find(f => f.value === font);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          Pré-visualização:
        </label>
      </div>
      
      <div className="border border-border rounded-lg p-4 bg-background min-h-[80px] flex items-center justify-center">
        {text ? (
          <div className="flex flex-col items-center justify-center">
            <span className={`${fontConfig?.className || 'font-sans'} text-lg text-foreground`}>
              {text}
            </span>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            Digite um texto para ver a pré-visualização
          </p>
        )}
      </div>
    </div>
  );
}