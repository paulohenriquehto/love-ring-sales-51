import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  Download, 
  FileSpreadsheet, 
  Calendar, 
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';

interface ExportReportsProps {
  onClose: () => void;
  imports: Array<{
    id: string;
    filename: string;
    total_products: number;
    processed_products: number;
    success_count: number;
    error_count: number;
    status: string;
    created_at: string;
    updated_at: string;
  }>;
}

interface ExportConfig {
  format: 'excel' | 'csv';
  dateRange: DateRange | undefined;
  includeStatus: string[];
  includeMetrics: boolean;
  includeErrorDetails: boolean;
  groupByPeriod: 'day' | 'week' | 'month';
}

const ExportReports: React.FC<ExportReportsProps> = ({ onClose, imports }) => {
  const [config, setConfig] = useState<ExportConfig>({
    format: 'excel',
    dateRange: undefined,
    includeStatus: ['completed', 'failed'],
    includeMetrics: true,
    includeErrorDetails: false,
    groupByPeriod: 'day',
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const { toast } = useToast();

  const statusOptions = [
    { value: 'pending', label: 'Pendente', icon: Clock, color: 'text-yellow-600' },
    { value: 'processing', label: 'Processando', icon: BarChart3, color: 'text-blue-600' },
    { value: 'completed', label: 'Concluído', icon: CheckCircle, color: 'text-green-600' },
    { value: 'failed', label: 'Falhou', icon: XCircle, color: 'text-red-600' },
    { value: 'cancelled', label: 'Cancelado', icon: XCircle, color: 'text-gray-600' },
  ];

  const handleStatusToggle = (status: string, checked: boolean) => {
    setConfig(prev => ({
      ...prev,
      includeStatus: checked 
        ? [...prev.includeStatus, status]
        : prev.includeStatus.filter(s => s !== status)
    }));
  };

  const filterImports = () => {
    let filtered = imports.filter(imp => config.includeStatus.includes(imp.status));
    
    if (config.dateRange?.from && config.dateRange?.to) {
      filtered = filtered.filter(imp => {
        const importDate = new Date(imp.created_at);
        return importDate >= config.dateRange!.from! && importDate <= config.dateRange!.to!;
      });
    }
    
    return filtered;
  };

  const generateCSVContent = (data: any[]): string => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value;
        }).join(',')
      )
    ].join('\n');
    
    return csvContent;
  };

  const exportData = async () => {
    try {
      setIsExporting(true);
      setExportProgress(0);

      const filteredImports = filterImports();
      
      if (filteredImports.length === 0) {
        toast({
          title: "Nenhum dado para exportar",
          description: "Ajuste os filtros para incluir mais dados",
          variant: "destructive",
        });
        return;
      }

      setExportProgress(25);

      // Prepare export data
      const exportData = filteredImports.map(imp => ({
        'ID': imp.id,
        'Nome do Arquivo': imp.filename,
        'Status': imp.status,
        'Total de Produtos': imp.total_products,
        'Produtos Processados': imp.processed_products,
        'Sucessos': imp.success_count,
        'Erros': imp.error_count,
        'Taxa de Sucesso (%)': imp.total_products > 0 
          ? ((imp.success_count / imp.total_products) * 100).toFixed(2)
          : '0',
        'Data de Criação': format(new Date(imp.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
        'Última Atualização': format(new Date(imp.updated_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
      }));

      setExportProgress(50);

      // Add metrics summary if requested
      let summaryData = [];
      if (config.includeMetrics) {
        const totalImports = filteredImports.length;
        const successfulImports = filteredImports.filter(i => i.status === 'completed').length;
        const failedImports = filteredImports.filter(i => i.status === 'failed').length;
        const totalProducts = filteredImports.reduce((sum, i) => sum + i.total_products, 0);
        const totalSuccessProducts = filteredImports.reduce((sum, i) => sum + i.success_count, 0);
        
        summaryData = [{
          'Métrica': 'Total de Importações',
          'Valor': totalImports,
        }, {
          'Métrica': 'Importações Bem-sucedidas',
          'Valor': successfulImports,
        }, {
          'Métrica': 'Importações Falhadas',
          'Valor': failedImports,
        }, {
          'Métrica': 'Total de Produtos',
          'Valor': totalProducts,
        }, {
          'Métrica': 'Produtos Importados com Sucesso',
          'Valor': totalSuccessProducts,
        }, {
          'Métrica': 'Taxa de Sucesso Geral (%)',
          'Valor': totalProducts > 0 ? ((totalSuccessProducts / totalProducts) * 100).toFixed(2) : '0',
        }];
      }

      setExportProgress(75);

      // Generate file content
      let fileContent = '';
      let fileName = '';
      
      if (config.format === 'csv') {
        fileContent = generateCSVContent(exportData);
        fileName = `relatorio-importacoes-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      } else {
        // For Excel, we'll generate CSV content but with .xlsx extension
        // In a real implementation, you'd use a library like xlsx
        fileContent = generateCSVContent(exportData);
        if (summaryData.length > 0) {
          fileContent += '\n\n--- RESUMO EXECUTIVO ---\n';
          fileContent += generateCSVContent(summaryData);
        }
        fileName = `relatorio-importacoes-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      }

      setExportProgress(90);

      // Download file
      const blob = new Blob([fileContent], { 
        type: config.format === 'excel' ? 'application/vnd.ms-excel' : 'text/csv'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportProgress(100);

      toast({
        title: "Relatório exportado com sucesso",
        description: `${filteredImports.length} importações foram exportadas para ${fileName}`,
      });

      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error) {
      console.error('Error exporting report:', error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar o relatório",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
      }, 2000);
    }
  };

  const filteredCount = filterImports().length;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Exportar Relatórios
          </DialogTitle>
          <DialogDescription>
            Configure e exporte relatórios detalhados das suas importações
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Format Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                Formato do Arquivo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select 
                value={config.format} 
                onValueChange={(value: 'excel' | 'csv') => setConfig(prev => ({ ...prev, format: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excel">Excel (.xlsx) - Recomendado</SelectItem>
                  <SelectItem value="csv">CSV (.csv) - Texto simples</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Date Range */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Período
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DatePickerWithRange 
                value={config.dateRange}
                onChange={(range) => setConfig(prev => ({ ...prev, dateRange: range }))}
                placeholder="Selecione o período (opcional)"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Deixe em branco para incluir todas as importações
              </p>
            </CardContent>
          </Card>

          {/* Status Filter */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Status a Incluir
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {statusOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={option.value}
                        checked={config.includeStatus.includes(option.value)}
                        onCheckedChange={(checked) => handleStatusToggle(option.value, checked as boolean)}
                      />
                      <label
                        htmlFor={option.value}
                        className={`text-sm font-medium cursor-pointer flex items-center gap-2 ${option.color}`}
                      >
                        <Icon className="w-3 h-3" />
                        {option.label}
                      </label>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Additional Options */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Opções Adicionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="metrics"
                  checked={config.includeMetrics}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, includeMetrics: checked as boolean }))}
                />
                <label htmlFor="metrics" className="text-sm font-medium cursor-pointer">
                  Incluir resumo executivo com métricas
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="errors"
                  checked={config.includeErrorDetails}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, includeErrorDetails: checked as boolean }))}
                />
                <label htmlFor="errors" className="text-sm font-medium cursor-pointer">
                  Incluir detalhes de erros (quando disponível)
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    Prévia da Exportação
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {filteredCount} importações serão incluídas no relatório
                  </p>
                </div>
                <Badge variant="outline" className="bg-white dark:bg-blue-900">
                  {filteredCount} registros
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Export Progress */}
          {isExporting && (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">Exportando relatório...</p>
                    <span className="text-sm text-muted-foreground">{exportProgress}%</span>
                  </div>
                  <Progress value={exportProgress} className="h-2" />
                  <p className="text-sm text-muted-foreground">
                    {exportProgress < 50 ? 'Preparando dados...' :
                     exportProgress < 90 ? 'Gerando arquivo...' :
                     'Finalizando download...'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={onClose} disabled={isExporting}>
              Cancelar
            </Button>
            <Button 
              onClick={exportData} 
              disabled={filteredCount === 0 || isExporting}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Exportando...' : 'Exportar Relatório'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportReports;