import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ImportStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'paused';
  total_products: number;
  processed_products: number;
  success_count: number;
  error_count: number;
  error_log: any[];
  success_log: any[];
  created_at: string;
  updated_at: string;
}

interface ImportMetrics {
  progress: number;
  eta: string;
  rate: number;
  elapsedTime: string;
}

export const useImportProgress = (importId: string | null) => {
  const [status, setStatus] = useState<ImportStatus | null>(null);
  const [metrics, setMetrics] = useState<ImportMetrics | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const { toast } = useToast();

  const calculateMetrics = useCallback((importStatus: ImportStatus): ImportMetrics => {
    const progress = importStatus.total_products > 0 
      ? (importStatus.processed_products / importStatus.total_products) * 100 
      : 0;

    const now = new Date();
    const start = startTime || new Date(importStatus.created_at);
    const elapsedMs = now.getTime() - start.getTime();
    const elapsedTime = formatDuration(elapsedMs);

    const rate = elapsedMs > 0 
      ? (importStatus.processed_products / (elapsedMs / 1000)) 
      : 0;

    const remaining = importStatus.total_products - importStatus.processed_products;
    const etaMs = rate > 0 ? (remaining / rate) * 1000 : 0;
    const eta = etaMs > 0 ? formatDuration(etaMs) : 'Calculando...';

    return { progress, eta, rate, elapsedTime };
  }, [startTime]);

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const pollStatus = useCallback(async () => {
    if (!importId) return;

    try {
      const { data, error } = await supabase
        .from('import_logs')
        .select('*')
        .eq('id', importId)
        .single();

      if (error) {
        console.error('Error polling import status:', error);
        toast({
          title: "Erro ao verificar status",
          description: "Não foi possível obter o status da importação",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        setStatus(data as ImportStatus);
        setMetrics(calculateMetrics(data as ImportStatus));

        // Stop polling if completed or failed
        if (['completed', 'failed', 'cancelled'].includes(data.status)) {
          setIsPolling(false);
        }
      }
    } catch (error) {
      console.error('Polling error:', error);
      setIsPolling(false);
    }
  }, [importId, calculateMetrics, toast]);

  const startPolling = useCallback(() => {
    if (!importId) return;
    
    setIsPolling(true);
    setStartTime(new Date());
    
    // Initial poll
    pollStatus();
  }, [importId, pollStatus]);

  const cancelImport = useCallback(async () => {
    if (!importId || !status) return;

    try {
      const { error } = await supabase
        .from('import_logs')
        .update({ status: 'cancelled' })
        .eq('id', importId);

      if (error) throw error;

      toast({
        title: "Importação cancelada",
        description: "A importação foi cancelada com sucesso",
      });

      setIsPolling(false);
    } catch (error) {
      console.error('Error cancelling import:', error);
      toast({
        title: "Erro ao cancelar",
        description: "Não foi possível cancelar a importação",
        variant: "destructive",
      });
    }
  }, [importId, status, toast]);

  const pauseImport = useCallback(async () => {
    if (!importId) return;

    try {
      const { error } = await supabase
        .from('import_logs')
        .update({ status: 'paused' })
        .eq('id', importId);

      if (error) throw error;

      toast({
        title: "Importação pausada",
        description: "A importação foi pausada",
      });
    } catch (error) {
      console.error('Error pausing import:', error);
      toast({
        title: "Erro ao pausar",
        description: "Não foi possível pausar a importação",
        variant: "destructive",
      });
    }
  }, [importId, toast]);

  const resumeImport = useCallback(async () => {
    if (!importId) return;

    try {
      const { error } = await supabase
        .from('import_logs')
        .update({ status: 'processing' })
        .eq('id', importId);

      if (error) throw error;

      toast({
        title: "Importação retomada",
        description: "A importação foi retomada",
      });
    } catch (error) {
      console.error('Error resuming import:', error);
      toast({
        title: "Erro ao retomar",
        description: "Não foi possível retomar a importação",
        variant: "destructive",
      });
    }
  }, [importId, toast]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPolling && importId) {
      interval = setInterval(pollStatus, 2000); // Poll every 2 seconds for better UX
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPolling, pollStatus, importId]);

  return {
    status,
    metrics,
    isPolling,
    startPolling,
    cancelImport,
    pauseImport,
    resumeImport,
    pollStatus,
  };
};