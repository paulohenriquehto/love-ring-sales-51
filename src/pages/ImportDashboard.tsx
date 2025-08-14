import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  Download, 
  TrendingUp, 
  BarChart3, 
  FileText, 
  Calendar,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import ImportStatusBadge from '@/components/import/ImportStatusBadge';
import ExportReports from '@/components/import/ExportReports';
import ImportTemplates from '@/components/import/ImportTemplates';
import { format } from 'date-fns';

interface ImportLog {
  id: string;
  filename: string;
  total_products: number;
  processed_products: number;
  success_count: number;
  error_count: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface ImportStats {
  total_imports: number;
  successful_imports: number;
  failed_imports: number;
  total_products_imported: number;
  avg_success_rate: number;
  imports_this_month: number;
}

const ImportDashboard = () => {
  const [imports, setImports] = useState<ImportLog[]>([]);
  const [stats, setStats] = useState<ImportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const { toast } = useToast();
  const { profile } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load import logs
      const { data: importData, error: importError } = await supabase
        .from('import_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (importError) throw importError;

      setImports(importData as ImportLog[] || []);

      // Calculate stats
      if (importData) {
        const total_imports = importData.length;
        const successful_imports = importData.filter(i => i.status === 'completed').length;
        const failed_imports = importData.filter(i => i.status === 'failed').length;
        const total_products_imported = importData
          .filter(i => i.status === 'completed')
          .reduce((sum, i) => sum + i.success_count, 0);
        
        const avg_success_rate = total_imports > 0 
          ? importData.reduce((sum, i) => {
              const rate = i.total_products > 0 ? (i.success_count / i.total_products) * 100 : 0;
              return sum + rate;
            }, 0) / total_imports 
          : 0;

        const currentMonth = new Date().getMonth();
        const imports_this_month = importData.filter(i => 
          new Date(i.created_at).getMonth() === currentMonth
        ).length;

        setStats({
          total_imports,
          successful_imports,
          failed_imports,
          total_products_imported,
          avg_success_rate,
          imports_this_month,
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados do dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredImports = imports.filter(imp => {
    const matchesSearch = imp.filename.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || imp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getSuccessRate = (imp: ImportLog) => {
    return imp.total_products > 0 ? (imp.success_count / imp.total_products) * 100 : 0;
  };

  const navigateToImport = () => {
    window.location.href = '/import-products';
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 animate-pulse mx-auto mb-4 text-primary" />
            <p className="text-lg font-medium">Carregando dashboard...</p>
            <p className="text-sm text-muted-foreground">Analisando dados de importação</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard de Importações</h1>
          <p className="text-muted-foreground mt-2">
            Monitore e gerencie todas as importações de produtos
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => setShowTemplates(true)}
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Templates
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowExport(true)}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar
          </Button>
          <Button onClick={navigateToImport} className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Nova Importação
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total_imports}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Sucessos</p>
                  <p className="text-2xl font-bold text-green-600">{stats.successful_imports}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Falhas</p>
                  <p className="text-2xl font-bold text-red-600">{stats.failed_imports}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Produtos</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.total_products_imported}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taxa Sucesso</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.avg_success_rate.toFixed(1)}%</p>
                </div>
                <Progress value={stats.avg_success_rate} className="w-8 h-2 mt-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Este Mês</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.imports_this_month}</p>
                </div>
                <Calendar className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Histórico de Importações
          </CardTitle>
          <CardDescription>
            Visualize e gerencie todas as importações realizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por nome do arquivo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="processing">Processando</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="failed">Falhou</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredImports.length === 0 ? (
            <div className="text-center py-12">
              <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma importação encontrada</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Tente ajustar os filtros para ver mais resultados'
                  : 'Comece importando seus primeiros produtos'
                }
              </p>
              <Button onClick={navigateToImport}>
                <Upload className="w-4 h-4 mr-2" />
                Nova Importação
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Arquivo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Produtos</TableHead>
                  <TableHead>Sucessos</TableHead>
                  <TableHead>Erros</TableHead>
                  <TableHead>Taxa</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredImports.map((imp) => (
                  <TableRow key={imp.id}>
                    <TableCell className="font-medium">{imp.filename}</TableCell>
                    <TableCell>
                      <ImportStatusBadge status={imp.status} />
                    </TableCell>
                    <TableCell>{imp.total_products}</TableCell>
                    <TableCell className="text-green-600 font-medium">{imp.success_count}</TableCell>
                    <TableCell className="text-red-600 font-medium">{imp.error_count}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={getSuccessRate(imp)} className="w-16 h-2" />
                        <span className="text-sm text-muted-foreground">
                          {getSuccessRate(imp).toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(imp.created_at), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Templates Modal */}
      {showTemplates && (
        <ImportTemplates onClose={() => setShowTemplates(false)} />
      )}

      {/* Export Modal */}
      {showExport && (
        <ExportReports onClose={() => setShowExport(false)} imports={imports} />
      )}
    </div>
  );
};

export default ImportDashboard;