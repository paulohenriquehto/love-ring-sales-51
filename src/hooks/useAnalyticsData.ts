import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, subMonths, format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export type DateRange = {
  from: Date;
  to: Date;
};

export const useAnalyticsData = (dateRange: DateRange) => {
  // Métricas principais
  const { data: salesMetrics, isLoading: loadingMetrics } = useQuery({
    queryKey: ['analytics-metrics', dateRange.from, dateRange.to],
    queryFn: async () => {
      const { data: orders } = await supabase
        .from('orders')
        .select('total, status, created_at')
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString());

      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
      const totalOrders = orders?.length || 0;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const completedOrders = orders?.filter(order => order.status === 'completed').length || 0;

      return {
        totalRevenue,
        totalOrders,
        avgOrderValue,
        completedOrders,
        conversionRate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0
      };
    }
  });

  // Produtos mais vendidos
  const { data: topProducts, isLoading: loadingProducts } = useQuery({
    queryKey: ['analytics-top-products', dateRange.from, dateRange.to],
    queryFn: async () => {
      const { data } = await supabase
        .from('order_items')
        .select(`
          product_name,
          quantity,
          total_price,
          orders!inner(created_at, status)
        `)
        .gte('orders.created_at', dateRange.from.toISOString())
        .lte('orders.created_at', dateRange.to.toISOString())
        .eq('orders.status', 'completed');

      // Agrupar por produto
      const productStats = data?.reduce((acc, item) => {
        const productName = item.product_name;
        if (!acc[productName]) {
          acc[productName] = {
            name: productName,
            totalQuantity: 0,
            totalRevenue: 0
          };
        }
        acc[productName].totalQuantity += item.quantity;
        acc[productName].totalRevenue += item.total_price || 0;
        return acc;
      }, {} as Record<string, { name: string; totalQuantity: number; totalRevenue: number }>);

      return Object.values(productStats || {})
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 5);
    }
  });

  // Vendas por dia
  const { data: dailySales, isLoading: loadingDaily } = useQuery({
    queryKey: ['analytics-daily-sales', dateRange.from, dateRange.to],
    queryFn: async () => {
      const { data } = await supabase
        .from('orders')
        .select('total, created_at, status')
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString())
        .eq('status', 'completed')
        .order('created_at');

      // Agrupar por dia
      const dailyStats = data?.reduce((acc, order) => {
        const date = format(parseISO(order.created_at), 'yyyy-MM-dd');
        if (!acc[date]) {
          acc[date] = {
            date,
            revenue: 0,
            orders: 0
          };
        }
        acc[date].revenue += order.total || 0;
        acc[date].orders += 1;
        return acc;
      }, {} as Record<string, { date: string; revenue: number; orders: number }>);

      return Object.values(dailyStats || {}).sort((a, b) => a.date.localeCompare(b.date));
    }
  });

  // Comparação período anterior
  const { data: previousMetrics } = useQuery({
    queryKey: ['analytics-previous-metrics', dateRange.from, dateRange.to],
    queryFn: async () => {
      const daysDiff = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
      const previousStart = new Date(dateRange.from.getTime() - (daysDiff * 24 * 60 * 60 * 1000));
      const previousEnd = new Date(dateRange.from.getTime() - (24 * 60 * 60 * 1000));

      const { data: orders } = await supabase
        .from('orders')
        .select('total, status')
        .gte('created_at', previousStart.toISOString())
        .lte('created_at', previousEnd.toISOString());

      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
      const totalOrders = orders?.length || 0;

      return { totalRevenue, totalOrders };
    }
  });

  return {
    salesMetrics,
    topProducts,
    dailySales,
    previousMetrics,
    isLoading: loadingMetrics || loadingProducts || loadingDaily
  };
};