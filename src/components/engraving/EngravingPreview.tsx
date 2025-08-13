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
    <div className="bg-card border border-border rounded-lg p-6 min-h-[120px] flex items-center justify-center">
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground mb-3">Visualização:</p>
        
        {text ? (
          <div 
            className={`text-foreground transition-all duration-300 ${fontConfig?.className || 'font-sans'}`}
          >
            {text}
          </div>
        ) : (
          <div className="text-muted-foreground/60 italic">
            Digite o texto para ver a prévia
          </div>
        )}
      </div>
    </div>
  );
}