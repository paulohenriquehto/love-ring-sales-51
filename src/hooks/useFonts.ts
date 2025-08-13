import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FONT_OPTIONS } from "@/types/engraving";

interface CustomFont {
  id: string;
  name: string;
  font_family: string;
  google_fonts_url: string;
  css_class_name: string;
  active: boolean;
}

export function useFonts() {
  const [fonts, setFonts] = useState<CustomFont[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFonts = async () => {
    try {
      const { data, error } = await supabase
        .from("custom_fonts")
        .select("*")
        .eq("active", true)
        .order("name");

      if (error) throw error;
      
      setFonts(data || []);
      
      // Update FONT_OPTIONS globally
      FONT_OPTIONS.length = 0;
      FONT_OPTIONS.push(...(data || []).map(font => ({
        value: font.css_class_name.replace('font-', ''),
        label: font.name,
        className: font.css_class_name
      })));

      // Load Google Fonts dynamically
      data?.forEach(font => {
        if (font.google_fonts_url) {
          const existingLink = document.querySelector(`link[href="${font.google_fonts_url}"]`);
          if (!existingLink) {
            const link = document.createElement('link');
            link.href = font.google_fonts_url;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
          }
        }
      });
      
    } catch (error) {
      console.error("Erro ao carregar fontes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFonts();
  }, []);

  return { fonts, loading, reloadFonts: loadFonts };
}