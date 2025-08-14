import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export type DateRange = {
  from: Date;
  to: Date;
};

export const useAuditData = (dateRange?: DateRange) => {
  const defaultRange = {
    from: subDays(new Date(), 30),
    to: new Date()
  };
  
  const range = dateRange || defaultRange;

  // Logs de auditoria
  const { data: auditLogs = [], isLoading: loadingLogs } = useQuery({
    queryKey: ['audit-logs', range.from, range.to],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .gte('created_at', range.from.toISOString())
        .lte('created_at', range.to.toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching audit logs:', error);
        return [];
      }

      return data || [];
    }
  });

  // Estatísticas de auditoria
  const { data: auditStats, isLoading: loadingStats } = useQuery({
    queryKey: ['audit-stats', range.from, range.to],
    queryFn: async () => {
      const { data: logs } = await supabase
        .from('audit_logs')
        .select('action, severity, status')
        .gte('created_at', range.from.toISOString())
        .lte('created_at', range.to.toISOString());

      if (!logs) return null;

      const totalLogs = logs.length;
      const successfulActions = logs.filter(log => log.status === 'success').length;
      const failedActions = logs.filter(log => log.status === 'error').length;
      const criticalEvents = logs.filter(log => log.severity === 'critical').length;
      
      // Contagem por ação
      const actionCounts = logs.reduce((acc, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalLogs,
        successfulActions,
        failedActions,
        criticalEvents,
        successRate: totalLogs > 0 ? (successfulActions / totalLogs) * 100 : 0,
        topActions: Object.entries(actionCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([action, count]) => ({ action, count }))
      };
    }
  });

  // Eventos de segurança
  const { data: securityEvents = [], isLoading: loadingSecurity } = useQuery({
    queryKey: ['security-events', range.from, range.to],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('security_events')
        .select('*')
        .gte('created_at', range.from.toISOString())
        .lte('created_at', range.to.toISOString())
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching security events:', error);
        return [];
      }

      return data || [];
    }
  });

  // Atividade por dia
  const { data: dailyActivity = [], isLoading: loadingActivity } = useQuery({
    queryKey: ['audit-daily-activity', range.from, range.to],
    queryFn: async () => {
      const { data } = await supabase
        .from('audit_logs')
        .select('created_at, action, severity')
        .gte('created_at', range.from.toISOString())
        .lte('created_at', range.to.toISOString())
        .order('created_at');

      if (!data) return [];

      // Agrupar por dia
      const dailyStats = data.reduce((acc, log) => {
        const date = format(parseISO(log.created_at), 'yyyy-MM-dd');
        if (!acc[date]) {
          acc[date] = {
            date,
            total: 0,
            critical: 0,
            warning: 0,
            info: 0
          };
        }
        acc[date].total += 1;
        acc[date][log.severity] = (acc[date][log.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, any>);

      return Object.values(dailyStats).sort((a: any, b: any) => a.date.localeCompare(b.date));
    }
  });

  return {
    auditLogs,
    auditStats,
    securityEvents,
    dailyActivity,
    isLoading: loadingLogs || loadingStats || loadingSecurity || loadingActivity
  };
};