export interface EngravingCustomization {
  text: string;
  font: string;
  productId: string;
  variantId?: string;
}

export interface EngravingConfig {
  id: string;
  product_id: string;
  supports_engraving: boolean;
  max_characters: number;
  price_adjustment: number;
  available_fonts: string[];
}

// Dynamic font options - will be loaded from database
export let FONT_OPTIONS: Array<{ value: string; label: string; className: string }> = [];

export type FontValue = typeof FONT_OPTIONS[number]['value'];