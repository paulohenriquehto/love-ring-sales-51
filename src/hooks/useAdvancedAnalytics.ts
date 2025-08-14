import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, subMonths, format, parseISO, subDays } from 'date-fns';

export interface EnterpriseMetrics {
  revenue: {
    current: number;
    previous: number;
    growth: number;
    target: number;
    achievement: number;
  };
  customers: {
    total: number;
    new: number;
    retention: number;
    churn: number;
  };
  operations: {
    orders: number;
    fulfillment: number;
    avgProcessingTime: number;
    efficiency: number;
  };
  inventory: {
    totalProducts: number;
    lowStock: number;
    turnoverRate: number;
    accuracy: number;
  };
}

export interface PredictiveInsight {
  id: string;
  type: 'revenue' | 'demand' | 'risk' | 'opportunity';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  timeframe: string;
  recommendation: string;
}

export interface BusinessIntelligence {
  topPerformingProducts: Array<{
    id: string;
    name: string;
    revenue: number;
    growth: number;
    margin: number;
  }>;
  customerSegments: Array<{
    segment: string;
    count: number;
    avgValue: number;
    contribution: number;
  }>;
  salesTrends: Array<{
    date: string;
    revenue: number;
    orders: number;
    forecast?: number;
  }>;
  kpiTargets: Array<{
    metric: string;
    current: number;
    target: number;
    status: 'on-track' | 'at-risk' | 'exceeded';
  }>;
}

export const useAdvancedAnalytics = () => {
  // Enterprise Metrics
  const { data: enterpriseMetrics, isLoading: loadingMetrics } = useQuery({
    queryKey: ['enterprise-metrics'],
    queryFn: async () => {
      const currentMonth = new Date();
      const currentStart = startOfMonth(currentMonth);
      const currentEnd = endOfMonth(currentMonth);
      const previousStart = startOfMonth(subMonths(currentMonth, 1));
      const previousEnd = endOfMonth(subMonths(currentMonth, 1));

      // Current month data
      const { data: currentOrders } = await supabase
        .from('orders')
        .select('total, status, created_at, customer_email')
        .gte('created_at', currentStart.toISOString())
        .lte('created_at', currentEnd.toISOString());

      // Previous month data
      const { data: previousOrders } = await supabase
        .from('orders')
        .select('total, status')
        .gte('created_at', previousStart.toISOString())
        .lte('created_at', previousEnd.toISOString());

      // Product data
      const { data: products } = await supabase
        .from('products')
        .select('id, name, base_price')
        .eq('active', true);

      // Inventory data
      const { data: inventory } = await supabase
        .from('inventory')
        .select('quantity_available, minimum_stock');

      const currentRevenue = currentOrders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
      const previousRevenue = previousOrders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
      const revenueGrowth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

      const totalProducts = products?.length || 0;
      const lowStockItems = inventory?.filter(item => 
        item.quantity_available <= (item.minimum_stock || 0)
      ).length || 0;

      const uniqueCustomers = new Set(currentOrders?.map(order => order.customer_email)).size;
      const totalOrders = currentOrders?.length || 0;
      const completedOrders = currentOrders?.filter(order => order.status === 'completed').length || 0;

      return {
        revenue: {
          current: currentRevenue,
          previous: previousRevenue,
          growth: revenueGrowth,
          target: previousRevenue * 1.15, // 15% growth target
          achievement: previousRevenue > 0 ? (currentRevenue / (previousRevenue * 1.15)) * 100 : 0
        },
        customers: {
          total: uniqueCustomers,
          new: Math.max(0, uniqueCustomers - 50), // Simplified calculation
          retention: 85, // Mock data
          churn: 15 // Mock data
        },
        operations: {
          orders: totalOrders,
          fulfillment: completedOrders,
          avgProcessingTime: 24, // Mock data in hours
          efficiency: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0
        },
        inventory: {
          totalProducts,
          lowStock: lowStockItems,
          turnoverRate: 4.2, // Mock data
          accuracy: 98.5 // Mock data
        }
      } as EnterpriseMetrics;
    }
  });

  // Predictive Insights
  const { data: predictiveInsights, isLoading: loadingInsights } = useQuery({
    queryKey: ['predictive-insights'],
    queryFn: async () => {
      // This would typically come from ML models or advanced analytics
      const insights: PredictiveInsight[] = [
        {
          id: '1',
          type: 'revenue',
          title: 'Previsão de Receita Q1',
          description: 'Baseado nos dados atuais, a receita do Q1 deve crescer 23% comparado ao trimestre anterior.',
          confidence: 87,
          impact: 'high',
          timeframe: '3 meses',
          recommendation: 'Aumentar estoque dos produtos de maior demanda em 15%'
        },
        {
          id: '2',
          type: 'demand',
          title: 'Pico de Demanda - Anéis Personalizados',
          description: 'Esperado aumento de 40% na demanda por anéis personalizados nas próximas 2 semanas.',
          confidence: 93,
          impact: 'medium',
          timeframe: '2 semanas',
          recommendation: 'Preparar equipe para aumento na produção de gravações'
        },
        {
          id: '3',
          type: 'risk',
          title: 'Risco de Estoque Baixo',
          description: 'Anéis de prata podem entrar em falta em 10 dias se o ritmo de vendas continuar.',
          confidence: 78,
          impact: 'medium',
          timeframe: '10 dias',
          recommendation: 'Reposição urgente de estoque de anéis de prata'
        },
        {
          id: '4',
          type: 'opportunity',
          title: 'Oportunidade de Cross-sell',
          description: 'Clientes que compram anéis têm 65% de chance de comprar acessórios complementares.',
          confidence: 82,
          impact: 'high',
          timeframe: 'Contínuo',
          recommendation: 'Implementar recomendações automáticas de produtos relacionados'
        }
      ];

      return insights;
    }
  });

  // Business Intelligence
  const { data: businessIntelligence, isLoading: loadingBI } = useQuery({
    queryKey: ['business-intelligence'],
    queryFn: async () => {
      const last30Days = subDays(new Date(), 30);

      // Top performing products
      const { data: orderItems } = await supabase
        .from('order_items')
        .select(`
          product_name,
          quantity,
          total_price,
          unit_price,
          orders!inner(created_at, status)
        `)
        .gte('orders.created_at', last30Days.toISOString())
        .eq('orders.status', 'completed');

      const productStats = orderItems?.reduce((acc, item) => {
        const productName = item.product_name;
        if (!acc[productName]) {
          acc[productName] = {
            id: productName,
            name: productName,
            revenue: 0,
            quantity: 0,
            avgPrice: 0
          };
        }
        acc[productName].revenue += item.total_price || 0;
        acc[productName].quantity += item.quantity;
        acc[productName].avgPrice = item.unit_price || 0;
        return acc;
      }, {} as Record<string, any>);

      const topProducts = Object.values(productStats || {})
        .sort((a: any, b: any) => b.revenue - a.revenue)
        .slice(0, 5)
        .map((product: any) => ({
          ...product,
          growth: Math.random() * 40 - 10, // Mock growth data
          margin: (Math.random() * 30 + 20) // Mock margin data
        }));

      // Sales trends with forecast
      const { data: dailySales } = await supabase
        .from('orders')
        .select('total, created_at')
        .gte('created_at', last30Days.toISOString())
        .eq('status', 'completed')
        .order('created_at');

      const salesTrends = dailySales?.reduce((acc, order) => {
        const date = format(parseISO(order.created_at), 'yyyy-MM-dd');
        if (!acc[date]) {
          acc[date] = { date, revenue: 0, orders: 0 };
        }
        acc[date].revenue += order.total || 0;
        acc[date].orders += 1;
        return acc;
      }, {} as Record<string, any>);

      const trendsArray = Object.values(salesTrends || {}).map((day: any, index, array) => ({
        ...day,
        forecast: index > array.length - 8 ? day.revenue * (1 + Math.random() * 0.2) : undefined
      }));

      return {
        topPerformingProducts: topProducts,
        customerSegments: [
          { segment: 'VIP', count: 23, avgValue: 1250, contribution: 35 },
          { segment: 'Frequente', count: 67, avgValue: 450, contribution: 28 },
          { segment: 'Ocasional', count: 156, avgValue: 180, contribution: 25 },
          { segment: 'Novo', count: 89, avgValue: 95, contribution: 12 }
        ],
        salesTrends: trendsArray,
        kpiTargets: [
          { metric: 'Receita Mensal', current: 45000, target: 50000, status: 'on-track' },
          { metric: 'Novos Clientes', current: 89, target: 100, status: 'at-risk' },
          { metric: 'Taxa de Conversão', current: 3.2, target: 2.8, status: 'exceeded' },
          { metric: 'Ticket Médio', current: 275, target: 300, status: 'at-risk' }
        ]
      } as BusinessIntelligence;
    }
  });

  return {
    enterpriseMetrics,
    predictiveInsights,
    businessIntelligence,
    isLoading: loadingMetrics || loadingInsights || loadingBI
  };
};