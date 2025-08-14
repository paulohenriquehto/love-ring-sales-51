import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface APIKey {
  id: string;
  name: string;
  key_hash: string;
  permissions: string[];
  rate_limit: number;
  active: boolean;
  last_used_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface APIRequest {
  id: string;
  api_key_id?: string;
  endpoint: string;
  method: string;
  status_code: number;
  response_time_ms?: number;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret?: string;
  active: boolean;
  created_by_user_id: string;
  created_at: string;
  updated_at: string;
}

export const useAPIManagement = () => {
  const queryClient = useQueryClient();

  // API Keys
  const { data: apiKeys = [], isLoading: loadingKeys } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching API keys:', error);
        return [];
      }

      return data || [];
    }
  });

  // API Requests Analytics
  const { data: requestStats, isLoading: loadingStats } = useQuery({
    queryKey: ['api-request-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('api_requests')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (error) {
        console.error('Error fetching request stats:', error);
        return { totalRequests: 0, avgResponseTime: 0, errorRate: 0 };
      }

      const totalRequests = data?.length || 0;
      const totalResponseTime = data?.reduce((sum, req) => sum + (req.response_time_ms || 0), 0) || 0;
      const errorRequests = data?.filter(req => req.status_code >= 400).length || 0;

      return {
        totalRequests,
        avgResponseTime: totalRequests > 0 ? totalResponseTime / totalRequests : 0,
        errorRate: totalRequests > 0 ? (errorRequests / totalRequests) * 100 : 0
      };
    }
  });

  // Webhooks
  const { data: webhooks = [], isLoading: loadingWebhooks } = useQuery({
    queryKey: ['webhooks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('webhooks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching webhooks:', error);
        return [];
      }

      return data || [];
    }
  });

  // Create API Key
  const createAPIKey = useMutation({
    mutationFn: async ({ name, permissions, rateLimit }: { 
      name: string; 
      permissions: string[];
      rateLimit: number;
    }) => {
      const apiKey = `ak_${Math.random().toString(36).substr(2, 32)}`;
      const keyHash = btoa(apiKey); // In production, use proper hashing

      const { data, error } = await supabase
        .from('api_keys')
        .insert([{
          name,
          key_hash: keyHash,
          permissions,
          rate_limit: rateLimit,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Return the plain key only once for the user to copy
      return { ...data, plain_key: apiKey };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast.success('Chave de API criada com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating API key:', error);
      toast.error('Erro ao criar chave de API');
    }
  });

  // Revoke API Key
  const revokeAPIKey = useMutation({
    mutationFn: async (keyId: string) => {
      const { data, error } = await supabase
        .from('api_keys')
        .update({ active: false })
        .eq('id', keyId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast.success('Chave de API revogada com sucesso!');
    },
    onError: (error) => {
      console.error('Error revoking API key:', error);
      toast.error('Erro ao revogar chave de API');
    }
  });

  // Create Webhook
  const createWebhook = useMutation({
    mutationFn: async ({ name, url, events }: { 
      name: string; 
      url: string;
      events: string[];
    }) => {
      const { data, error } = await supabase
        .from('webhooks')
        .insert([{
          name,
          url,
          events,
          secret: `whsec_${Math.random().toString(36).substr(2, 32)}`,
          created_by_user_id: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      toast.success('Webhook criado com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating webhook:', error);
      toast.error('Erro ao criar webhook');
    }
  });

  // Toggle Webhook Status
  const toggleWebhookStatus = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { data, error } = await supabase
        .from('webhooks')
        .update({ active })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      toast.success('Status do webhook atualizado!');
    },
    onError: (error) => {
      console.error('Error toggling webhook:', error);
      toast.error('Erro ao atualizar webhook');
    }
  });

  return {
    apiKeys,
    requestStats,
    webhooks,
    isLoading: loadingKeys || loadingStats || loadingWebhooks,
    createAPIKey,
    revokeAPIKey,
    createWebhook,
    toggleWebhookStatus
  };
};