import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SecurityEvent {
  id: string;
  event_type: string;
  description: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  user_id?: string;
  metadata?: Record<string, any>;
  resolved: boolean;
  resolved_at?: string;
  created_at: string;
}

export interface SecurityStats {
  totalEvents: number;
  criticalEvents: number;
  resolvedEvents: number;
  unresolvedEvents: number;
  riskDistribution: Record<string, number>;
}

export const useSecurityMonitoring = () => {
  const queryClient = useQueryClient();

  // Security Events
  const { data: securityEvents = [], isLoading: loadingEvents } = useQuery({
    queryKey: ['security-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('security_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching security events:', error);
        return [];
      }

      return data || [];
    }
  });

  // Security Statistics
  const { data: securityStats, isLoading: loadingStats } = useQuery({
    queryKey: ['security-stats'],
    queryFn: async () => {
      const { data: events } = await supabase
        .from('security_events')
        .select('risk_level, resolved')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (!events) return null;

      const totalEvents = events.length;
      const criticalEvents = events.filter(e => e.risk_level === 'critical').length;
      const resolvedEvents = events.filter(e => e.resolved).length;
      const unresolvedEvents = totalEvents - resolvedEvents;

      const riskDistribution = events.reduce((acc, event) => {
        acc[event.risk_level] = (acc[event.risk_level] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalEvents,
        criticalEvents,
        resolvedEvents,
        unresolvedEvents,
        riskDistribution
      };
    }
  });

  // Recent Audit Logs for Security Context
  const { data: recentAuditLogs = [], isLoading: loadingLogs } = useQuery({
    queryKey: ['recent-audit-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('severity', 'critical')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching audit logs:', error);
        return [];
      }

      return data || [];
    }
  });

  // Resolve Security Event
  const resolveSecurityEvent = useMutation({
    mutationFn: async (eventId: string) => {
      const { data, error } = await supabase
        .from('security_events')
        .update({ 
          resolved: true, 
          resolved_at: new Date().toISOString() 
        })
        .eq('id', eventId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-events'] });
      queryClient.invalidateQueries({ queryKey: ['security-stats'] });
      toast.success('Evento de segurança resolvido!');
    },
    onError: (error) => {
      console.error('Error resolving security event:', error);
      toast.error('Erro ao resolver evento de segurança');
    }
  });

  // Create Security Alert
  const createSecurityAlert = useMutation({
    mutationFn: async ({
      eventType,
      description,
      riskLevel,
      metadata
    }: {
      eventType: string;
      description: string;
      riskLevel: 'low' | 'medium' | 'high' | 'critical';
      metadata?: Record<string, any>;
    }) => {
      const { data, error } = await supabase
        .from('security_events')
        .insert([{
          event_type: eventType,
          description,
          risk_level: riskLevel,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          metadata: metadata || {}
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-events'] });
      queryClient.invalidateQueries({ queryKey: ['security-stats'] });
      toast.success('Alerta de segurança criado!');
    },
    onError: (error) => {
      console.error('Error creating security alert:', error);
      toast.error('Erro ao criar alerta de segurança');
    }
  });

  return {
    securityEvents,
    securityStats,
    recentAuditLogs,
    isLoading: loadingEvents || loadingStats || loadingLogs,
    resolveSecurityEvent,
    createSecurityAlert
  };
};