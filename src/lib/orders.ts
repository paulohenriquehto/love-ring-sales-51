import { supabase } from '@/integrations/supabase/client';
import { type Order, type CreateOrderData } from '@/types/order';

export interface SearchOrdersParams {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  deliveryMethod?: string;
  page?: number;
  limit?: number;
}

export interface OrdersResponse {
  orders: Order[];
  totalCount: number;
  totalPages: number;
}

export interface SalesMetrics {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  pendingOrders: number;
  completedOrders: number;
}

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

export async function searchOrders(params: SearchOrdersParams): Promise<OrdersResponse> {
  const { search = '', status = '', dateFrom = '', dateTo = '', deliveryMethod = '', page = 1, limit = 10 } = params;
  
  let query = (supabase as any)
    .from('orders')
    .select(`
      *,
      order_items (*)
    `, { count: 'exact' });

  // Apply search filters
  if (search) {
    query = query.or(`customer_cpf.ilike.%${search}%,customer_name.ilike.%${search}%,order_number.ilike.%${search}%`);
  }

  if (status) {
    query = query.eq('status', status);
  }

  if (deliveryMethod) {
    query = query.eq('delivery_method', deliveryMethod);
  }

  if (dateFrom) {
    query = query.gte('created_at', dateFrom);
  }

  if (dateTo) {
    query = query.lte('created_at', dateTo);
  }

  // Apply pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  query = query
    .order('created_at', { ascending: false })
    .range(from, to);

  const { data: orders, error, count } = await query;

  if (error) {
    throw new Error(`Erro ao buscar pedidos: ${error.message}`);
  }

  const totalPages = Math.ceil((count || 0) / limit);

  return {
    orders: (orders || []) as Order[],
    totalCount: count || 0,
    totalPages
  };
}

export async function getSalesMetrics(): Promise<SalesMetrics> {
  const { data: orders, error } = await (supabase as any)
    .from('orders')
    .select('total, status');

  if (error) {
    throw new Error(`Erro ao buscar métricas: ${error.message}`);
  }

  const totalSales = orders?.reduce((sum: number, order: any) => sum + parseFloat(order.total || 0), 0) || 0;
  const totalOrders = orders?.length || 0;
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
  const pendingOrders = orders?.filter((order: any) => order.status === 'pending').length || 0;
  const completedOrders = orders?.filter((order: any) => order.status === 'completed').length || 0;

  return {
    totalSales,
    totalOrders,
    averageOrderValue,
    pendingOrders,
    completedOrders
  };
}

export async function getTopProducts(limit: number = 5) {
  const { data: items, error } = await (supabase as any)
    .from('order_items')
    .select('product_name, quantity, total_price');

  if (error) {
    throw new Error(`Erro ao buscar produtos mais vendidos: ${error.message}`);
  }

  const productStats = items?.reduce((acc: any, item: any) => {
    const name = item.product_name;
    if (!acc[name]) {
      acc[name] = { name, quantity: 0, revenue: 0 };
    }
    acc[name].quantity += item.quantity;
    acc[name].revenue += parseFloat(item.total_price || 0);
    return acc;
  }, {}) || {};

  return Object.values(productStats)
    .sort((a: any, b: any) => b.quantity - a.quantity)
    .slice(0, limit);
}