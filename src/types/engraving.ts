// Tipos para sistema completo - texto, fontes e símbolos

export interface EngravingCustomization {
  text: string;
  font: string;
  symbols: string[];
  productId: string;
  variantId?: string;
}

export interface EngravingCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  image_url?: string;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EngravingSymbol {
  id: string;
  category_id: string;
  name: string;
  unicode_char?: string;
  svg_content?: string;
  image_url?: string;
  icon_path?: string;
  price_adjustment?: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EngravingConfig {
  id: string;
  product_id: string;
  supports_engraving: boolean;
  max_characters: number;
  price_adjustment: number;
  available_fonts: string[];
}

// Default font options
export const DEFAULT_FONT_OPTIONS = [
  { value: 'arial', label: 'Arial', className: 'font-sans' },
  { value: 'poiret', label: 'Poiret One', className: 'font-poiret' },
  { value: 'josefin', label: 'Josefin Sans', className: 'font-josefin' },
  { value: 'cinzel', label: 'Cinzel', className: 'font-cinzel' },
  { value: 'handlee', label: 'Handlee', className: 'font-handlee' },
  { value: 'tangerine', label: 'Tangerine', className: 'font-tangerine text-2xl' },
  { value: 'reenie', label: 'Reenie Beanie', className: 'font-reenie text-xl' },
  { value: 'annie', label: 'Annie Use Your Telescope', className: 'font-annie' },
] as const;

export type FontOption = {
  value: string;
  label: string;
  className: string;
};

export type FontValue = string;