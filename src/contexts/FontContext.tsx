import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FontOption } from "@/types/engraving";

interface CustomFont {
  id: string;
  name: string;
  font_family: string;
  google_fonts_url: string;
  css_class_name: string;
  active: boolean;
}

interface FontContextType {
  fontOptions: FontOption[];
  loading: boolean;
  reloadFonts: () => Promise<void>;
}

const FontContext = createContext<FontContextType | undefined>(undefined);

export const useFonts = () => {
  const context = useContext(FontContext);
  if (context === undefined) {
    throw new Error('useFonts must be used within a FontProvider');
  }
  return context;
};

export const FontProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontOptions, setFontOptions] = useState<FontOption[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFonts = async () => {
    try {
      const { data, error } = await supabase
        .from("custom_fonts")
        .select("*")
        .eq("active", true)
        .order("name");

      if (error) throw error;
      
      const options: FontOption[] = (data || []).map(font => ({
        value: font.css_class_name.replace('font-', ''),
        label: font.name,
        className: font.css_class_name
      }));

      setFontOptions(options);

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

  return (
    <FontContext.Provider value={{ fontOptions, loading, reloadFonts: loadFonts }}>
      {children}
    </FontContext.Provider>
  );
};