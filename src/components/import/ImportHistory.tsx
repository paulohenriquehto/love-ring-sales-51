import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, FileText, Download, RefreshCw, Eye, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ImportLog {
  id: string;
  filename: string;
  total_products: number;
  processed_products: number;
  success_count: number;
  error_count: number;
  status: string;
  created_at: string;
  updated_at: string;
}

const ImportHistory: React.FC = () => {
  const [imports, setImports] = useState<ImportLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchImportHistory();
  }, []);

  const fetchImportHistory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('import_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setImports(data || []);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      toast({
        title: "Erro ao carregar histórico",
        description: "Não foi possível carregar o histórico de importações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500 text-white">Concluído</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500 text-white">Processando</Badge>;
      case 'failed':
        return <Badge variant="destructive">Falhou</Badge>;
      case 'cancelled':
        return <Badge variant="secondary">Cancelado</Badge>;
      case 'pending':
        return <Badge variant="outline">Pendente</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const downloadReport = async (importLog: ImportLog) => {
    try {
      const { data, error } = await supabase
        .from('import_logs')
        .select('error_log, success_log')
        .eq('id', importLog.id)
        .single();

      if (error) throw error;

      const reportData = {
        summary: {
          filename: importLog.filename,
          date: new Date(importLog.created_at).toLocaleString(),
          total: importLog.total_products,
          success: importLog.success_count,
          errors: importLog.error_count,
          status: importLog.status,
        },
        errors: data.error_log || [],
        successes: data.success_log || [],
      };

      const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
        type: 'application/json' 
      });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `import_report_${importLog.id}_${new Date().toISOString().split('T')[0]}.json`;
      link.click();

      toast({
        title: "Relatório baixado",
        description: "O relatório de importação foi baixado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao baixar relatório:', error);
      toast({
        title: "Erro ao baixar relatório",
        description: "Não foi possível baixar o relatório.",
        variant: "destructive",
      });
    }
  };

  const deleteImportLog = async (importId: string) => {
    if (!confirm('Tem certeza que deseja excluir este log de importação?')) return;

    try {
      const { error } = await supabase
        .from('import_logs')
        .delete()
        .eq('id', importId);

      if (error) throw error;

      setImports(prev => prev.filter(imp => imp.id !== importId));
      toast({
        title: "Log excluído",
        description: "O log de importação foi excluído com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao excluir log:', error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o log de importação.",
        variant: "destructive",
      });
    }
  };

  const getSuccessRate = (importLog: ImportLog) => {
    if (importLog.total_products === 0) return 0;
    return Math.round((importLog.success_count / importLog.total_products) * 100);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2">Carregando histórico...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Histórico de Importações
            </CardTitle>
            <CardDescription>
              Visualize e gerencie o histórico das suas importações
            </CardDescription>
          </div>
          <Button onClick={fetchImportHistory} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {imports.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Nenhuma importação encontrada</h3>
            <p className="text-muted-foreground">
              Faça sua primeira importação para ver o histórico aqui.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Arquivo</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Produtos</TableHead>
                  <TableHead>Sucessos</TableHead>
                  <TableHead>Erros</TableHead>
                  <TableHead>Taxa</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {imports.map((importLog) => (
                  <TableRow key={importLog.id}>
                    <TableCell className="font-medium max-w-[200px]">
                      <div className="truncate" title={importLog.filename}>
                        {importLog.filename}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(importLog.created_at).toLocaleDateString()}</div>
                        <div className="text-muted-foreground">
                          {new Date(importLog.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(importLog.status)}
                    </TableCell>
                    <TableCell>{importLog.total_products}</TableCell>
                    <TableCell>
                      <span className="text-green-600 font-medium">
                        {importLog.success_count}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-red-600 font-medium">
                        {importLog.error_count}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={getSuccessRate(importLog) >= 90 ? "default" : 
                               getSuccessRate(importLog) >= 70 ? "secondary" : "destructive"}
                      >
                        {getSuccessRate(importLog)}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadReport(importLog)}
                          title="Baixar relatório"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteImportLog(importLog.id)}
                          title="Excluir log"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default ImportHistory;