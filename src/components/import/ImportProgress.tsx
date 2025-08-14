import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Activity, CheckCircle, AlertCircle, Clock, Pause, Play, Square } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { CSVData, ImportConfig } from '@/pages/ImportProducts';

interface ImportProgressProps {
  csvData: CSVData;
  config: ImportConfig;
  onImportComplete: (importId: string) => void;
}

interface ImportStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  total_products: number;
  processed_products: number;
  success_count: number;
  error_count: number;
  error_log: any[];
}

interface LogEntry {
  timestamp: string;
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
  product?: string;
}

const ImportProgress: React.FC<ImportProgressProps> = ({ csvData, config, onImportComplete }) => {
  const [importStatus, setImportStatus] = useState<ImportStatus | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const { toast } = useToast();
  const { profile } = useAuth();

  const addLog = (type: LogEntry['type'], message: string, product?: string) => {
    setLogs(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
      product,
    }]);
  };

  const startImport = async () => {
    try {
      setStartTime(new Date());
      addLog('info', 'Iniciando importação de produtos...');

      // Create import log entry
      const { data: importLog, error: logError } = await supabase
        .from('import_logs')
        .insert({
          user_id: profile?.user_id || '',
          filename: csvData.fileName,
          total_products: csvData.totalRows,
          status: 'processing' as const,
          mapping_config: config as any,
        })
        .select()
        .single();

      if (logError) throw logError;

      setImportStatus({
        id: importLog.id,
        status: 'processing',
        total_products: csvData.totalRows,
        processed_products: 0,
        success_count: 0,
        error_count: 0,
        error_log: [],
      });

      addLog('info', `Log de importação criado: ${importLog.id}`);

      // Start the import process via Edge Function
      const { data, error } = await supabase.functions.invoke('import-products', {
        body: {
          importId: importLog.id,
          csvData,
          config,
        },
      });

      if (error) {
        throw error;
      }

      addLog('info', 'Processo de importação iniciado com sucesso');

      // Start polling for updates
      pollImportStatus(importLog.id);

    } catch (error) {
      console.error('Erro ao iniciar importação:', error);
      addLog('error', `Erro ao iniciar importação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      toast({
        title: "Erro na importação",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const pollImportStatus = async (importId: string) => {
    const interval = setInterval(async () => {
      if (isPaused) return;

      try {
        const { data, error } = await supabase
          .from('import_logs')
          .select('*')
          .eq('id', importId)
          .single();

        if (error) throw error;

        setImportStatus({
          id: data.id,
          status: data.status as any,
          total_products: data.total_products,
          processed_products: data.processed_products,
          success_count: data.success_count,
          error_count: data.error_count,
          error_log: Array.isArray(data.error_log) ? data.error_log : [],
        });

        // Add logs for new errors
        if (Array.isArray(data.error_log) && data.error_log.length > 0) {
          const newErrors = data.error_log.slice(logs.filter(l => l.type === 'error').length);
          newErrors.forEach((error: any) => {
            addLog('error', error.message, error.product);
          });
        }

        if (data.status === 'completed') {
          clearInterval(interval);
          addLog('success', `Importação concluída! ${data.success_count} produtos importados com sucesso.`);
          toast({
            title: "Importação concluída",
            description: `${data.success_count} produtos importados com sucesso.`,
          });
          onImportComplete(importId);
        } else if (data.status === 'failed') {
          clearInterval(interval);
          addLog('error', 'Importação falhou');
          toast({
            title: "Importação falhou",
            description: "Verifique os logs para mais detalhes.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
      }
    }, 2000); // Poll every 2 seconds

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
    addLog('info', isPaused ? 'Importação retomada' : 'Importação pausada');
  };

  const handleCancel = async () => {
    if (!importStatus) return;

    try {
      await supabase
        .from('import_logs')
        .update({ status: 'cancelled' })
        .eq('id', importStatus.id);

      setImportStatus(prev => prev ? { ...prev, status: 'cancelled' } : null);
      addLog('warning', 'Importação cancelada pelo usuário');
      
      toast({
        title: "Importação cancelada",
        description: "O processo de importação foi interrompido.",
      });
    } catch (error) {
      console.error('Erro ao cancelar importação:', error);
    }
  };

  useEffect(() => {
    startImport();
  }, []);

  const getProgressPercentage = () => {
    if (!importStatus) return 0;
    return Math.round((importStatus.processed_products / importStatus.total_products) * 100);
  };

  const getElapsedTime = () => {
    if (!startTime) return '00:00';
    const elapsed = new Date().getTime() - startTime.getTime();
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500';
      case 'failed': return 'text-red-500';
      case 'cancelled': return 'text-orange-500';
      case 'processing': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Progresso da Importação
          </CardTitle>
          <CardDescription>
            Acompanhe o progresso da importação em tempo real
          </CardDescription>
        </CardHeader>
        <CardContent>
          {importStatus && (
            <div className="space-y-6">
              {/* Overall Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progresso Geral</span>
                  <span className="text-sm text-muted-foreground">
                    {importStatus.processed_products}/{importStatus.total_products} produtos
                  </span>
                </div>
                <Progress value={getProgressPercentage()} className="h-2" />
                <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                  <span>{getProgressPercentage()}% concluído</span>
                  <span>Tempo: {getElapsedTime()}</span>
                </div>
              </div>

              {/* Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <p className={`text-lg font-bold ${getStatusColor(importStatus.status)}`}>
                        {importStatus.status === 'processing' ? 'Processando' :
                         importStatus.status === 'completed' ? 'Concluído' :
                         importStatus.status === 'failed' ? 'Falhou' :
                         importStatus.status === 'cancelled' ? 'Cancelado' : 'Pendente'}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Sucessos</p>
                      <p className="text-lg font-bold text-green-600">{importStatus.success_count}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <div>
                      <p className="text-sm font-medium">Erros</p>
                      <p className="text-lg font-bold text-red-600">{importStatus.error_count}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">Restantes</p>
                      <p className="text-lg font-bold text-blue-600">
                        {importStatus.total_products - importStatus.processed_products}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Controls */}
              {importStatus.status === 'processing' && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={handlePauseResume}
                    className="flex items-center gap-2"
                  >
                    {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                    {isPaused ? 'Retomar' : 'Pausar'}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleCancel}
                    className="flex items-center gap-2"
                  >
                    <Square className="w-4 h-4" />
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Log em Tempo Real</CardTitle>
          <CardDescription>
            Acompanhe o que está acontecendo durante a importação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {logs.map((log, index) => (
                <div key={index} className="flex items-start gap-3 p-2 text-sm border-l-2 border-l-gray-200">
                  <Badge 
                    variant={
                      log.type === 'success' ? 'default' :
                      log.type === 'error' ? 'destructive' :
                      log.type === 'warning' ? 'secondary' : 'outline'
                    }
                    className="mt-0.5"
                  >
                    {log.type}
                  </Badge>
                  <div className="flex-1">
                    <p className="text-foreground">{log.message}</p>
                    {log.product && (
                      <p className="text-muted-foreground text-xs">Produto: {log.product}</p>
                    )}
                    <p className="text-muted-foreground text-xs">{log.timestamp}</p>
                  </div>
                </div>
              ))}
              {logs.length === 0 && (
                <p className="text-muted-foreground text-center py-8">
                  Aguardando início da importação...
                </p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImportProgress;