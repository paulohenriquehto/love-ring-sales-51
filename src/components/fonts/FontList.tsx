import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { FontPreview } from "./FontPreview";

interface CustomFont {
  id: string;
  name: string;
  font_family: string;
  google_fonts_url: string;
  css_class_name: string;
  active: boolean;
}

interface FontListProps {
  fonts: CustomFont[];
  onToggleFont: (fontId: string, active: boolean) => void;
}

export function FontList({ fonts, onToggleFont }: FontListProps) {
  if (fonts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Nenhuma fonte encontrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {fonts.map((font) => (
        <div
          key={font.id}
          className="border border-border rounded-lg p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{font.name}</h4>
                <Badge variant={font.active ? "default" : "secondary"}>
                  {font.active ? "Ativa" : "Inativa"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {font.font_family}
              </p>
              {font.google_fonts_url && (
                <p className="text-xs text-muted-foreground">
                  Google Fonts: {font.google_fonts_url}
                </p>
              )}
            </div>
            
            <Switch
              checked={font.active}
              onCheckedChange={(checked) => onToggleFont(font.id, checked)}
            />
          </div>

          <FontPreview 
            fontFamily={font.font_family}
            className={font.css_class_name}
            googleFontsUrl={font.google_fonts_url}
          />
        </div>
      ))}
    </div>
  );
}