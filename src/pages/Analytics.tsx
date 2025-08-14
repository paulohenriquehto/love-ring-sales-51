import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Package, 
  DollarSign, 
  ShoppingCart,
  Clock,
  Target,
  Zap,
  Activity,
  FileText,
  Download,
  RefreshCw,
  Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { DateRange } from 'react-day-picker';

interface AnalyticsMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  avgOrderValue: number;
  conversionRate: number;
  monthlyGrowth: number;
  topSellingProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
  salesByDepartment: Array<{
    department: string;
    sales: number;
    target: number;
  }>;
  userActivity: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
}

interface KPIConfig {
  id: string;
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ComponentType<any>;
  color: string;
}

const Analytics = () => {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();
  const { profile } = useAuth();

  useEffect(() => {
    loadAnalytics();
  }, [dateRange, selectedDepartment]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Simulate analytics data - in production this would come from analytics engine
      const mockMetrics: AnalyticsMetrics = {
        totalRevenue: 245678.90,
        totalOrders: 1234,
        totalProducts: 567,
        totalUsers: 89,
        avgOrderValue: 199.20,
        conversionRate: 12.5,
        monthlyGrowth: 18.7,
        topSellingProducts: [
          { name: 'Anel de Ouro 18k', sales: 45, revenue: 15678.90 },
          { name: 'Colar de Prata', sales: 38, revenue: 8945.20 },
          { name: 'Brincos de Diamante', sales: 32, revenue: 21456.80 },
          { name: 'Pulseira Personalizada', sales: 28, revenue: 5678.40 },
          { name: 'Relógio Casual', sales: 25, revenue: 7890.50 }
        ],
        salesByDepartment: [
          { department: 'Joias', sales: 156, target: 150 },
          { department: 'Relógios', sales: 89, target: 100 },
          { department: 'Acessórios', sales: 134, target: 120 },
          { department: 'Bijuterias', sales: 78, target: 80 }
        ],
        userActivity: Array.from({ length: 30 }, (_, i) => ({
          date: format(subDays(new Date(), 29 - i), 'dd/MM'),
          orders: Math.floor(Math.random() * 50) + 10,
          revenue: Math.floor(Math.random() * 5000) + 1000
        }))
      };

      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: "Erro ao carregar analytics",
        description: "Não foi possível carregar os dados de análise",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshAnalytics = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
    toast({
      title: "Dados atualizados",
      description: "Os dados de analytics foram atualizados com sucesso",
    });
  };

  const exportReport = async () => {
    try {
      // Generate CSV report
      const csvData = metrics?.topSellingProducts.map(product => 
        `${product.name},${product.sales},${product.revenue.toFixed(2)}`
      ).join('\n');
      
      const csvContent = `Produto,Vendas,Receita\n${csvData}`;
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Relatório exportado",
        description: "O relatório foi gerado e baixado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível gerar o relatório",
        variant: "destructive",
      });
    }
  };

  const kpiCards: KPIConfig[] = metrics ? [
    {
      id: 'revenue',
      title: 'Receita Total',
      value: `R$ ${metrics.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: metrics.monthlyGrowth,
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      id: 'orders',
      title: 'Pedidos',
      value: metrics.totalOrders.toLocaleString('pt-BR'),
      change: 12.3,
      trend: 'up',
      icon: ShoppingCart,
      color: 'text-blue-600'
    },
    {
      id: 'products',
      title: 'Produtos',
      value: metrics.totalProducts.toLocaleString('pt-BR'),
      change: 5.7,
      trend: 'up',
      icon: Package,
      color: 'text-purple-600'
    },
    {
      id: 'users',
      title: 'Usuários Ativos',
      value: metrics.totalUsers.toLocaleString('pt-BR'),
      change: 8.9,
      trend: 'up',
      icon: Users,
      color: 'text-orange-600'
    },
    {
      id: 'avgOrder',
      title: 'Ticket Médio',
      value: `R$ ${metrics.avgOrderValue.toFixed(2)}`,
      change: 15.2,
      trend: 'up',
      icon: Target,
      color: 'text-teal-600'
    },
    {
      id: 'conversion',
      title: 'Taxa Conversão',
      value: `${metrics.conversionRate}%`,
      change: 3.1,
      trend: 'up',
      icon: Zap,
      color: 'text-indigo-600'
    }
  ] : [];

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 animate-pulse mx-auto mb-4 text-primary" />
            <p className="text-lg font-medium">Carregando analytics...</p>
            <p className="text-sm text-muted-foreground">Analisando dados empresariais</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Empresarial</h1>
          <p className="text-muted-foreground mt-2">
            Insights avançados e métricas de performance do negócio
          </p>
        </div>
        <div className="flex gap-3">
          <DatePickerWithRange 
            value={dateRange} 
            onChange={setDateRange}
          />
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar departamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os departamentos</SelectItem>
              <SelectItem value="joias">Joias</SelectItem>
              <SelectItem value="relogios">Relógios</SelectItem>
              <SelectItem value="acessorios">Acessórios</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={refreshAnalytics}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button onClick={exportReport} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{kpi.title}</p>
                    <p className="text-2xl font-bold">{kpi.value}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className={`w-3 h-3 ${kpi.color}`} />
                      <span className={`text-sm font-medium ${kpi.color}`}>
                        +{kpi.change}%
                      </span>
                    </div>
                  </div>
                  <Icon className={`w-8 h-8 ${kpi.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="sales">Vendas</TabsTrigger>
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Selling Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Produtos Mais Vendidos
                </CardTitle>
                <CardDescription>
                  Top 5 produtos por volume de vendas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics?.topSellingProducts.map((product, index) => (
                    <div key={product.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.sales} vendas
                          </p>
                        </div>
                      </div>
                      <p className="font-medium text-green-600">
                        R$ {product.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sales by Department */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Performance por Departamento
                </CardTitle>
                <CardDescription>
                  Vendas vs. metas departamentais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics?.salesByDepartment.map((dept) => {
                    const percentage = (dept.sales / dept.target) * 100;
                    return (
                      <div key={dept.department} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{dept.department}</span>
                          <span className="text-sm text-muted-foreground">
                            {dept.sales}/{dept.target}
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {percentage.toFixed(1)}% da meta atingida
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Tendências de Vendas
              </CardTitle>
              <CardDescription>
                Análise temporal de vendas e receita
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                  <p>Gráfico de vendas seria renderizado aqui</p>
                  <p className="text-sm">Integração com biblioteca de gráficos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Estoque</CardTitle>
                <CardDescription>
                  Status do estoque por categoria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Estoque Total</span>
                    <Badge variant="secondary">{metrics?.totalProducts} itens</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Baixo Estoque</span>
                    <Badge variant="destructive">23 itens</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Sem Estoque</span>
                    <Badge variant="outline">5 itens</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rotatividade de Produtos</CardTitle>
                <CardDescription>
                  Análise de giro de estoque
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Giro Médio</span>
                    <span className="font-medium">4.2x/mês</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Produtos Parados</span>
                    <span className="text-orange-600 font-medium">12 itens</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Sazonalidade</span>
                    <span className="text-green-600 font-medium">Alta</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Tempo Médio de Processamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">2.4h</p>
                  <p className="text-sm text-muted-foreground">Melhoria de 65%</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Taxa de Erro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">0.8%</p>
                  <p className="text-sm text-muted-foreground">Dentro da meta</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Satisfação do Cliente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">94.5%</p>
                  <p className="text-sm text-muted-foreground">+2.3% este mês</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;