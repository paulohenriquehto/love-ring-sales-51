import { useFonts } from "@/contexts/FontContext";
import { type FontValue } from "@/types/engraving";

interface EngravingDisplayProps {
  text: string;
  font: FontValue;
  compact?: boolean;
  showTitle?: boolean;
}

export function EngravingDisplay({ 
  text, 
  font, 
  compact = false,
  showTitle = true 
}: EngravingDisplayProps) {
  const { fontOptions } = useFonts();
  
  const fontConfig = fontOptions.find(f => f.value === font);

  if (!text) return null;

  return (
    <div className="space-y-2">
      {showTitle && (
        <p className="text-xs text-muted-foreground">Gravação personalizada:</p>
      )}
      
      <div className={`border border-border rounded-lg p-3 bg-background ${
        compact ? 'min-h-[60px]' : 'min-h-[80px]'
      } flex items-center justify-center`}>
        <div className="flex flex-col items-center justify-center">
          <span className={`${fontConfig?.className || 'font-sans'} ${
            compact ? 'text-sm' : 'text-lg'
          } text-foreground font-medium`}>
            "{text}"
          </span>
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