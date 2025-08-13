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

export const FONT_OPTIONS = [
  { value: 'arial', label: 'Arial', className: 'font-sans' },
  { value: 'poiret', label: 'Poiret One', className: 'font-poiret' },
  { value: 'josefin', label: 'Josefin Sans', className: 'font-josefin' },
  { value: 'cinzel', label: 'Cinzel', className: 'font-cinzel' },
  { value: 'handlee', label: 'Handlee', className: 'font-handlee' },
  { value: 'tangerine', label: 'Tangerine', className: 'font-tangerine text-2xl' },
  { value: 'reenie', label: 'Reenie Beanie', className: 'font-reenie text-xl' },
  { value: 'annie', label: 'Annie Use Your Telescope', className: 'font-annie' },
] as const;

export type FontValue = typeof FONT_OPTIONS[number]['value'];