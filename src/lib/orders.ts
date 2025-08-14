import { supabase } from '@/integrations/supabase/client';
import { type Order, type CreateOrderData } from '@/types/order';

export async function createOrder(orderData: CreateOrderData): Promise<Order> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  // Create order - using type assertion for tables not in generated types
  const { data: order, error: orderError } = await (supabase as any)
    .from('orders')
    .insert({
      user_id: user.id,
      customer_name: orderData.customer_name,
      customer_cpf: orderData.customer_cpf,
      customer_email: orderData.customer_email,
      customer_phone: orderData.customer_phone,
      subtotal: orderData.subtotal,
      discount: orderData.discount,
      total: orderData.total,
      delivery_method: orderData.delivery_method,
      notes: orderData.notes
    })
    .select()
    .single();

  if (orderError) {
    throw new Error(`Erro ao criar pedido: ${orderError.message}`);
  }

  // Create order items
  const orderItems = orderData.items.map(item => ({
    order_id: order.id,
    product_id: item.product_id,
    variant_id: item.variant_id,
    product_name: item.product_name,
    size: item.size,
    width: item.width,
    material: item.material,
    quantity: item.quantity,
    unit_price: item.unit_price,
    total_price: item.total_price,
    engraving_text: item.engraving_text,
    engraving_font: item.engraving_font,
    engraving_symbols: item.engraving_symbols
  }));

  const { error: itemsError } = await (supabase as any)
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    throw new Error(`Erro ao criar itens do pedido: ${itemsError.message}`);
  }

  return order as Order;
}

export async function getOrderById(orderId: string): Promise<Order> {
  const { data: order, error } = await (supabase as any)
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .eq('id', orderId)
    .single();

  if (error) {
    throw new Error(`Erro ao buscar pedido: ${error.message}`);
  }

  return order as Order;
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const { data: orders, error } = await (supabase as any)
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Erro ao buscar pedidos: ${error.message}`);
  }

  return (orders || []) as Order[];
}