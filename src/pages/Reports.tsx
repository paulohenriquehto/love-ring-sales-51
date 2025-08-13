import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Building2, 
  DollarSign,
  Download,
  Calendar,
  Shield,
  Activity
} from "lucide-react";

export default function Reports() {
  const { profile } = useAuth();
  const [timeRange, setTimeRange] = useState("30");
  const [reportType, setReportType] = useState("overview");

  // Mock data for demonstration
  const mockData = {
    overview: {
      totalUsers: 24,
      activeDepartments: 5,
      monthlyBudget: 125000,
      systemActivity: 89,
    },
    users: {
      admins: 3,
      managers: 8,
      vendors: 13,
      newThisMonth: 4,
    },
    departments: {
      most_active: "Vendas",
      highest_budget: "Marketing",
      newest: "TI",
    },
    activity: {
      dailyLogins: 18,
      weeklyOrders: 156,
      systemUptime: 99.8,
    }
  };

  if (!profile || !["admin", "manager"].includes(profile.role)) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-semibold text-foreground">Acesso Restrito</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Apenas administradores e gerentes podem visualizar relatórios.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Relatórios e Analytics
          </h1>
          <p className="text-muted-foreground">
            Visualize métricas e estatísticas do sistema
          </p>
        </div>
        <div className="flex space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
              <SelectItem value="365">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="flex space-x-2">
        <Button 
          variant={reportType === "overview" ? "default" : "outline"}
          onClick={() => setReportType("overview")}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Visão Geral
        </Button>
        <Button 
          variant={reportType === "users" ? "default" : "outline"}
          onClick={() => setReportType("users")}
        >
          <Users className="w-4 h-4 mr-2" />
          Usuários
        </Button>
        <Button 
          variant={reportType === "departments" ? "default" : "outline"}
          onClick={() => setReportType("departments")}
        >
          <Building2 className="w-4 h-4 mr-2" />
          Departamentos
        </Button>
        <Button 
          variant={reportType === "activity" ? "default" : "outline"}
          onClick={() => setReportType("activity")}
        >
          <Activity className="w-4 h-4 mr-2" />
          Atividade
        </Button>
      </div>

      {/* Overview Reports */}
      {reportType === "overview" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockData.overview.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                <Badge variant="secondary" className="text-xs">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12% este mês
                </Badge>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departamentos Ativos</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockData.overview.activeDepartments}</div>
              <p className="text-xs text-muted-foreground">
                <Badge variant="outline" className="text-xs">
                  Estável
                </Badge>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orçamento Mensal</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {mockData.overview.monthlyBudget.toLocaleString('pt-BR')}
              </div>
              <p className="text-xs text-muted-foreground">
                <Badge variant="secondary" className="text-xs">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +8% este mês
                </Badge>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Atividade do Sistema</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockData.overview.systemActivity}%</div>
              <p className="text-xs text-muted-foreground">
                <Badge variant="default" className="text-xs">
                  Excelente
                </Badge>
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Users Reports */}
      {reportType === "users" && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Usuários por Função</CardTitle>
              <CardDescription>Breakdown de funções no sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive"></div>
                  <span>Administradores</span>
                </div>
                <span className="font-medium">{mockData.users.admins}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <span>Gerentes</span>
                </div>
                <span className="font-medium">{mockData.users.managers}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-secondary"></div>
                  <span>Vendedores</span>
                </div>
                <span className="font-medium">{mockData.users.vendors}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Crescimento de Usuários</CardTitle>
              <CardDescription>Novos usuários este mês</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                +{mockData.users.newThisMonth}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Novos usuários cadastrados nos últimos 30 dias
              </p>
              <Badge variant="secondary" className="mt-4">
                <TrendingUp className="w-3 h-3 mr-1" />
                +25% comparado ao mês anterior
              </Badge>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Departments Reports */}
      {reportType === "departments" && (
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Departamento Mais Ativo</CardTitle>
              <CardDescription>Maior número de transações</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {mockData.departments.most_active}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                156 transações este mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Maior Orçamento</CardTitle>
              <CardDescription>Departamento com maior limite</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {mockData.departments.highest_budget}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                R$ 45.000 de limite mensal
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mais Recente</CardTitle>
              <CardDescription>Último departamento criado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {mockData.departments.newest}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Criado há 5 dias
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Activity Reports */}
      {reportType === "activity" && (
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Logins Diários</CardTitle>
              <CardDescription>Média de logins por dia</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {mockData.activity.dailyLogins}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Usuários únicos por dia
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pedidos Semanais</CardTitle>
              <CardDescription>Total de pedidos esta semana</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {mockData.activity.weeklyOrders}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                +18% comparado à semana anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Uptime do Sistema</CardTitle>
              <CardDescription>Disponibilidade do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {mockData.activity.systemUptime}%
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Últimos 30 dias
              </p>
              <Badge variant="default" className="mt-2">
                Excelente
              </Badge>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Informações do Relatório
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>Período:</strong> Últimos {timeRange} dias</p>
            <p><strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
            <p><strong>Gerado por:</strong> {profile.full_name}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}