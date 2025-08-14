export interface Order {
  id: string;
  user_id: string;
  customer_name: string;
  customer_cpf: string;
  customer_email: string;
  customer_phone: string;
  subtotal: number;
  discount: number;
  total: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  delivery_method: 'pickup' | 'delivery';
  notes?: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id?: string;
  product_name: string;
  size?: string;
  width?: string;
  material?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  engraving_text?: string;
  engraving_font?: string;
  engraving_symbols?: string; // JSON string
  created_at: string;
}

export interface CreateOrderData {
  customer_name: string;
  customer_cpf: string;
  customer_email: string;
  customer_phone: string;
  subtotal: number;
  discount: number;
  total: number;
  delivery_method: 'pickup' | 'delivery';
  notes?: string;
  items: CreateOrderItemData[];
}

export interface CreateOrderItemData {
  product_id: string;
  variant_id?: string;
  product_name: string;
  size?: string;
  width?: string;
  material?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  engraving_text?: string;
  engraving_font?: string;
  engraving_symbols?: string;
}