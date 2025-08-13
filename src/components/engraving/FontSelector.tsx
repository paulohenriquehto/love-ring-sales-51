import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFonts } from "@/contexts/FontContext";
import { type FontValue } from "@/types/engraving";

interface FontSelectorProps {
  value: FontValue;
  onChange: (font: FontValue) => void;
  availableFonts?: string[];
}

export function FontSelector({ value, onChange, availableFonts = [] }: FontSelectorProps) {
  const { fontOptions } = useFonts();
  
  const filteredFonts = availableFonts.length > 0 
    ? fontOptions.filter(font => availableFonts.includes(font.value))
    : fontOptions;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        Fonte da gravação:
      </label>
      
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {filteredFonts.map((font) => (
            <SelectItem key={font.value} value={font.value}>
              <span className={font.className}>
                {font.label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}