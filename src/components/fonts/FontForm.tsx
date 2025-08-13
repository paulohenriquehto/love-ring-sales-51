import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FontPreview } from "./FontPreview";

interface CustomFont {
  id: string;
  name: string;
  font_family: string;
  google_fonts_url: string;
  css_class_name: string;
  active: boolean;
}

interface FontFormProps {
  onFontAdded: (font: CustomFont) => void;
}

export function FontForm({ onFontAdded }: FontFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    googleFontsUrl: "",
  });

  const extractFontInfo = (url: string) => {
    try {
      // Extract font family from Google Fonts URL
      const urlParams = new URLSearchParams(new URL(url).search);
      const family = urlParams.get('family');
      if (!family) throw new Error("URL inválida");

      // Remove weights and styles, keep only the font name
      const fontName = family.split(':')[0].replace(/\+/g, ' ');
      const cssClassName = `font-${fontName.toLowerCase().replace(/\s+/g, '-')}`;
      
      return {
        fontFamily: `'${fontName}', sans-serif`,
        cssClassName,
        displayName: fontName
      };
    } catch (error) {
      throw new Error("URL do Google Fonts inválida");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.googleFontsUrl.trim()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (!formData.googleFontsUrl.includes('fonts.googleapis.com')) {
      toast.error("URL deve ser do Google Fonts");
      return;
    }

    setLoading(true);
    try {
      const { fontFamily, cssClassName } = extractFontInfo(formData.googleFontsUrl);

      const { data, error } = await supabase
        .from("custom_fonts")
        .insert({
          name: formData.name,
          font_family: fontFamily,
          google_fonts_url: formData.googleFontsUrl,
          css_class_name: cssClassName,
          active: true
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          toast.error("Já existe uma fonte com este nome CSS");
          return;
        }
        throw error;
      }

      onFontAdded(data);
      setFormData({ name: "", googleFontsUrl: "" });
    } catch (error: any) {
      console.error("Erro ao adicionar fonte:", error);
      toast.error(error.message || "Erro ao adicionar fonte");
    } finally {
      setLoading(false);
    }
  };

  const previewFont = () => {
    try {
      if (formData.googleFontsUrl) {
        const { fontFamily, cssClassName } = extractFontInfo(formData.googleFontsUrl);
        return {
          fontFamily,
          cssClassName,
          googleFontsUrl: formData.googleFontsUrl
        };
      }
    } catch {
      return null;
    }
    return null;
  };

  const preview = previewFont();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome da Fonte *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ex: Playfair Display"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="googleFontsUrl">URL do Google Fonts *</Label>
        <Input
          id="googleFontsUrl"
          value={formData.googleFontsUrl}
          onChange={(e) => setFormData({ ...formData, googleFontsUrl: e.target.value })}
          placeholder="https://fonts.googleapis.com/css2?family=..."
          required
        />
        <p className="text-xs text-muted-foreground">
          Cole a URL obtida do Google Fonts
        </p>
      </div>

      {preview && (
        <div className="space-y-2">
          <Label>Prévia da Fonte</Label>
          <FontPreview 
            fontFamily={preview.fontFamily}
            className={preview.cssClassName}
            googleFontsUrl={preview.googleFontsUrl}
          />
        </div>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Adicionando..." : "Adicionar Fonte"}
      </Button>
    </form>
  );
}
