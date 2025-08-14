import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown,
  Users,
  DollarSign,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Brain,
  Zap
} from 'lucide-react';
import { useAdvancedAnalytics } from '@/hooks/useAdvancedAnalytics';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const EnterpriseAnalytics = () => {
  const { enterpriseMetrics, predictiveInsights, businessIntelligence, isLoading } = useAdvancedAnalytics();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <Brain className="h-8 w-8 animate-pulse mr-2" />
          <span>Processando insights empresariais...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Brain className="h-8 w-8" />
          Analytics Empresarial
        </h1>
        <p className="text-muted-foreground">
          Insights avançados e análise preditiva para tomada de decisão estratégica
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {enterpriseMetrics?.revenue.current.toLocaleString('pt-BR') || 0}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {(enterpriseMetrics?.revenue.growth || 0) >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              {Math.abs(enterpriseMetrics?.revenue.growth || 0).toFixed(1)}% vs mês anterior
            </div>
            <Progress value={enterpriseMetrics?.revenue.achievement || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiência Operacional</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {enterpriseMetrics?.operations.efficiency.toFixed(1) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {enterpriseMetrics?.operations.fulfillment || 0} de {enterpriseMetrics?.operations.orders || 0} pedidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {enterpriseMetrics?.customers.total || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              +{enterpriseMetrics?.customers.new || 0} novos este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventário</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {enterpriseMetrics?.inventory.totalProducts || 0}
            </div>
            <div className="flex items-center text-xs">
              <AlertTriangle className="h-3 w-3 mr-1 text-orange-500" />
              {enterpriseMetrics?.inventory.lowStock || 0} com estoque baixo
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList>
          <TabsTrigger value="insights">Insights Preditivos</TabsTrigger>
          <TabsTrigger value="kpis">KPIs & Metas</TabsTrigger>
          <TabsTrigger value="products">Produtos</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {predictiveInsights?.map((insight) => (
              <Card key={insight.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{insight.title}</CardTitle>
                    <Badge variant={
                      insight.impact === 'high' ? 'destructive' : 
                      insight.impact === 'medium' ? 'default' : 'secondary'
                    }>
                      {insight.impact === 'high' ? 'Alto Impacto' : 
                       insight.impact === 'medium' ? 'Médio Impacto' : 'Baixo Impacto'}
                    </Badge>
                  </div>
                  <CardDescription>{insight.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Confiança</span>
                      <span className="font-medium">{insight.confidence}%</span>
                    </div>
                    <Progress value={insight.confidence} />
                    <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        💡 Recomendação: {insight.recommendation}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="kpis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Acompanhamento de Metas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {businessIntelligence?.kpiTargets.map((kpi, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{kpi.metric}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {kpi.current.toLocaleString()} / {kpi.target.toLocaleString()}
                        </span>
                        {kpi.status === 'on-track' && <CheckCircle className="h-4 w-4 text-green-500" />}
                        {kpi.status === 'at-risk' && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                        {kpi.status === 'exceeded' && <TrendingUp className="h-4 w-4 text-blue-500" />}
                      </div>
                    </div>
                    <Progress value={(kpi.current / kpi.target) * 100} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tendência de Vendas</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={businessIntelligence?.salesTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
                    <Line type="monotone" dataKey="forecast" stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Segmentos de Clientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {businessIntelligence?.customerSegments.map((segment, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{segment.segment}</p>
                        <p className="text-sm text-muted-foreground">{segment.count} clientes</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">R$ {segment.avgValue.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">{segment.contribution}% da receita</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Produtos por Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={businessIntelligence?.topPerformingProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnterpriseAnalytics;