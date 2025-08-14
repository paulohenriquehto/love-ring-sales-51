import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, AlertCircle, Download, RefreshCw, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ImportResultsProps {
  importId: string;
  onNewImport: () => void;
}

interface ImportResult {
  id: string;
  filename: string;
  total_products: number;
  processed_products: number;
  success_count: number;
  error_count: number;
  status: string;
  error_log: any[];
  success_log: any[];
  created_at: string;
  updated_at: string;
}

const ImportResults: React.FC<ImportResultsProps> = ({ importId, onNewImport }) => {
  const [result, setResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchImportResult();
  }, [importId]);

  const fetchImportResult = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('import_logs')
        .select('*')
        .eq('id', importId)
        .single();

      if (error) throw error;
      setResult({
        ...data,
        error_log: Array.isArray(data.error_log) ? data.error_log : [],
        success_log: Array.isArray(data.success_log) ? data.success_log : [],
      });
    } catch (error) {
      console.error('Erro ao buscar resultado:', error);
      toast({
        title: "Erro ao carregar resultados",
        description: "Não foi possível carregar os resultados da importação.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadErrorReport = () => {
    if (!result || !result.error_log || result.error_log.length === 0) return;

    const csvContent = [
      ['Linha', 'Produto', 'Erro', 'Detalhes'],
      ...result.error_log.map((error: any) => [
        error.row || '',
        error.product || '',
        error.error || '',
        error.details || ''
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `errors_${result.filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const downloadSuccessReport = () => {
    if (!result || !result.success_log || result.success_log.length === 0) return;

    const csvContent = [
      ['Produto', 'SKU', 'ID', 'Status'],
      ...result.success_log.map((success: any) => [
        success.product || '',
        success.sku || '',
        success.id || '',
        success.status || 'Criado'
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `success_${result.filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500 text-white">Concluído</Badge>;
      case 'failed':
        return <Badge variant="destructive">Falhou</Badge>;
      case 'cancelled':
        return <Badge variant="secondary">Cancelado</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getSuccessRate = () => {
    if (!result || result.total_products === 0) return 0;
    return Math.round((result.success_count / result.total_products) * 100);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2">Carregando resultados...</span>
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <AlertCircle className="w-8 h-8 text-red-500" />
          <span className="ml-2">Erro ao carregar resultados</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Resultados da Importação
              </CardTitle>
              <CardDescription>
                Importação de {result.filename} - {new Date(result.created_at).toLocaleString()}
              </CardDescription>
            </div>
            {getStatusBadge(result.status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{result.total_products}</p>
              <p className="text-sm text-blue-600">Total de Produtos</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{result.success_count}</p>
              <p className="text-sm text-green-600">Importados com Sucesso</p>
            </div>
            
            <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{result.error_count}</p>
              <p className="text-sm text-red-600">Erros Encontrados</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{getSuccessRate()}%</p>
              <p className="text-sm text-purple-600">Taxa de Sucesso</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações</CardTitle>
          <CardDescription>
            Opções para gerenciar os resultados da importação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button onClick={onNewImport} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Nova Importação
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => window.open('/products', '_blank')}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Ver Produtos
            </Button>
            
            {result.success_count > 0 && (
              <Button 
                variant="outline" 
                onClick={downloadSuccessReport}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Baixar Relatório de Sucessos
              </Button>
            )}
            
            {result.error_count > 0 && (
              <Button 
                variant="outline" 
                onClick={downloadErrorReport}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Baixar Relatório de Erros
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Details */}
      {result.error_count > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Detalhes dos Erros ({result.error_count})
            </CardTitle>
            <CardDescription>
              Lista detalhada dos erros encontrados durante a importação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Linha</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Erro</TableHead>
                    <TableHead>Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.error_log.map((error: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{error.row || '-'}</TableCell>
                      <TableCell>{error.product || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="destructive">{error.error || 'Erro desconhecido'}</Badge>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <div className="truncate" title={error.details}>
                          {error.details || '-'}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Success Summary */}
      {result.success_count > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Produtos Importados com Sucesso ({result.success_count})
            </CardTitle>
            <CardDescription>
              Resumo dos produtos que foram importados com sucesso
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result.success_log && result.success_log.length > 0 ? (
              <ScrollArea className="h-64">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.success_log.slice(0, 100).map((success: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{success.product || '-'}</TableCell>
                        <TableCell>{success.sku || '-'}</TableCell>
                        <TableCell className="font-mono text-xs">{success.id || '-'}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-500 text-white">
                            {success.status || 'Criado'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {result.success_log.length > 100 && (
                  <p className="text-center text-sm text-muted-foreground mt-4">
                    Mostrando primeiros 100 itens. Baixe o relatório completo acima.
                  </p>
                )}
              </ScrollArea>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Log de sucessos não disponível
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImportResults;