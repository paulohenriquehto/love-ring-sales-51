import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Activity, CheckCircle, AlertCircle, Clock, Pause, Play, Square, Timer, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useImportProgress } from '@/hooks/useImportProgress';
import ImportStatusBadge from './ImportStatusBadge';
import type { CSVData, ImportConfig } from '@/pages/ImportProducts';

interface ImportProgressProps {
  csvData: CSVData;
  config: ImportConfig;
  onImportComplete: (importId: string) => void;
}

interface LogEntry {
  timestamp: string;
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
  product?: string;
}

const ImportProgress: React.FC<ImportProgressProps> = ({ csvData, config, onImportComplete }) => {
  const [importId, setImportId] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const { toast } = useToast();
  const { profile } = useAuth();
  
  const {
    status: importStatus,
    metrics,
    isPolling,
    startPolling,
    cancelImport,
    pauseImport,
    resumeImport,
  } = useImportProgress(importId);

  const addLog = (type: LogEntry['type'], message: string, product?: string) => {
    setLogs(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
      product,
    }]);
  };

  const startImport = async () => {
    if (!profile?.user_id) {
      toast({
        title: "Erro de autenticação",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return;
    }

    try {
      addLog('info', 'Iniciando importação otimizada...', 'Sistema');
      addLog('info', `Preparando ${csvData.totalRows} produtos para processamento`, 'Sistema');
      
      // Create import log entry
      const { data: importLog, error: logError } = await supabase
        .from('import_logs')
        .insert({
          user_id: profile.user_id,
          filename: csvData.fileName,
          total_products: csvData.totalRows,
          mapping_config: { mapping: config.mapping, config } as any,
          status: 'pending',
        })
        .select()
        .single();

      if (logError) throw logError;

      const currentImportId = importLog.id;
      setImportId(currentImportId);
      addLog('success', `Importação criada com ID: ${currentImportId}`, 'Sistema');

      // Start the optimized import process via Edge Function
      addLog('info', 'Enviando para processamento otimizado...', 'Sistema');
      
      const { data, error } = await supabase.functions.invoke('import-products', {
        body: {
          importId: currentImportId,
          csvData,
          config,
        },
      });

      if (error) throw error;
      
      addLog('success', 'Processamento iniciado - sistema otimizado ativo', 'Sistema');
      
      // Start optimized polling
      startPolling();

    } catch (error) {
      console.error('Error starting import:', error);
      addLog('error', `Erro ao iniciar importação: ${error.message}`, 'Sistema');
      toast({
        title: "Erro na importação",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    startImport();
  }, []);

  useEffect(() => {
    if (importStatus?.status === 'completed' && importId) {
      addLog('success', `Importação concluída! ${importStatus.success_count} produtos importados`, 'Sistema');
      onImportComplete(importId);
    } else if (importStatus?.status === 'failed') {
      addLog('error', 'Importação falhou', 'Sistema');
    } else if (importStatus?.status === 'cancelled') {
      addLog('warning', 'Importação cancelada', 'Sistema');
    }
  }, [importStatus?.status, importId, onImportComplete]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Importação Otimizada
        </CardTitle>
        <CardDescription>
          Acompanhe o progresso com métricas avançadas e controles inteligentes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {importStatus ? (
          <>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Status da Importação</p>
                  <div className="flex items-center gap-3">
                    <ImportStatusBadge status={importStatus.status} />
                    {metrics && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Timer className="w-3 h-3" />
                        <span>{metrics.elapsedTime}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {importStatus.status === 'processing' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={pauseImport}
                        disabled={!isPolling}
                      >
                        <Pause className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={cancelImport}
                        disabled={!isPolling}
                      >
                        <Square className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  {importStatus.status === 'paused' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resumeImport}
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Progresso</span>
                  <span>{importStatus.processed_products} / {importStatus.total_products}</span>
                </div>
                <Progress 
                  value={metrics?.progress || 0} 
                  className="h-3 bg-muted"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{metrics?.progress?.toFixed(1)}% concluído</span>
                  {metrics?.eta && importStatus.status === 'processing' && (
                    <span>ETA: {metrics.eta}</span>
                  )}
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-xl font-bold text-green-600">{importStatus.success_count}</p>
                  <p className="text-xs text-green-700 dark:text-green-300">Sucessos</p>
                </div>
                <div className="text-center p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-xl font-bold text-red-600">{importStatus.error_count}</p>
                  <p className="text-xs text-red-700 dark:text-red-300">Erros</p>
                </div>
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-xl font-bold text-blue-600">
                    {importStatus.total_products - importStatus.processed_products}
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">Restantes</p>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                  <div className="flex items-center justify-center gap-1">
                    <Zap className="w-3 h-3 text-purple-600" />
                    <p className="text-lg font-bold text-purple-600">
                      {metrics?.rate?.toFixed(1) || '0'}
                    </p>
                  </div>
                  <p className="text-xs text-purple-700 dark:text-purple-300">items/s</p>
                </div>
              </div>

              {/* Enhanced Progress Bar with Animation */}
              {importStatus.status === 'processing' && (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg animate-pulse" />
                  <div className="relative p-3 bg-background/80 backdrop-blur border rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <Activity className="w-4 h-4 animate-spin text-primary" />
                      <span className="font-medium">Sistema otimizado ativo</span>
                      <Badge variant="outline" className="text-xs">
                        Processamento em lotes inteligentes
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Log de Atividades</h3>
                <Badge variant="outline" className="text-xs">
                  {logs.length} eventos
                </Badge>
              </div>
              <ScrollArea className="h-48 w-full border rounded-lg p-3">
                <div className="space-y-2">
                  {logs.length === 0 ? (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      Aguardando eventos...
                    </div>
                  ) : (
                    logs.slice().reverse().map((log, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-muted-foreground font-mono text-xs shrink-0">
                          {log.timestamp}
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className={`font-medium ${
                            log.type === 'error' ? 'text-red-600' :
                            log.type === 'success' ? 'text-green-600' :
                            log.type === 'warning' ? 'text-yellow-600' :
                            'text-blue-600'
                          }`}>
                            {log.message}
                          </span>
                          {log.product && (
                            <span className="text-muted-foreground ml-1 truncate">
                              ({log.product})
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="relative">
              <Activity className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-full animate-pulse" />
            </div>
            <p className="text-lg font-medium">Preparando sistema otimizado...</p>
            <p className="text-sm text-muted-foreground mt-1">
              Configurando processamento inteligente para {csvData.totalRows} produtos
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <Badge variant="outline" className="text-xs">
                Lotes adaptativos
              </Badge>
              <Badge variant="outline" className="text-xs">
                Retry automático
              </Badge>
              <Badge variant="outline" className="text-xs">
                ETA inteligente
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImportProgress;