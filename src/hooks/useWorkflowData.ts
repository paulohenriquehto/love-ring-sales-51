import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useWorkflowData = () => {
  const queryClient = useQueryClient();

  // Workflows
  const { data: workflows = [], isLoading: loadingWorkflows } = useQuery({
    queryKey: ['workflows'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching workflows:', error);
        return [];
      }

      return data || [];
    }
  });

  // Execuções de workflows
  const { data: executions = [], isLoading: loadingExecutions } = useQuery({
    queryKey: ['workflow-executions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflow_executions')
        .select(`
          *,
          workflows(name)
        `)
        .order('started_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching workflow executions:', error);
        return [];
      }

      return data || [];
    }
  });

  // Estatísticas de workflows
  const { data: workflowStats } = useQuery({
    queryKey: ['workflow-stats'],
    queryFn: async () => {
      const { data: workflowData } = await supabase
        .from('workflows')
        .select('status');
      
      const { data: executionData } = await supabase
        .from('workflow_executions')
        .select('status')
        .gte('started_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const totalWorkflows = workflowData?.length || 0;
      const activeWorkflows = workflowData?.filter(w => w.status === 'active').length || 0;
      const totalExecutions = executionData?.length || 0;
      const successfulExecutions = executionData?.filter(e => e.status === 'completed').length || 0;

      return {
        totalWorkflows,
        activeWorkflows,
        totalExecutions,
        successfulExecutions,
        successRate: totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0
      };
    }
  });

  // Criar workflow
  const createWorkflow = useMutation({
    mutationFn: async (workflow: {
      name: string;
      description?: string;
      steps: any[];
      trigger_type: string;
    }) => {
      const { data, error } = await supabase
        .from('workflows')
        .insert([{
          ...workflow,
          created_by_user_id: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      queryClient.invalidateQueries({ queryKey: ['workflow-stats'] });
      toast.success('Workflow criado com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating workflow:', error);
      toast.error('Erro ao criar workflow');
    }
  });

  // Executar workflow
  const executeWorkflow = useMutation({
    mutationFn: async (workflowId: string) => {
      const { data, error } = await supabase
        .from('workflow_executions')
        .insert([{
          workflow_id: workflowId,
          started_by_user_id: (await supabase.auth.getUser()).data.user?.id,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-executions'] });
      queryClient.invalidateQueries({ queryKey: ['workflow-stats'] });
      toast.success('Workflow executado com sucesso!');
    },
    onError: (error) => {
      console.error('Error executing workflow:', error);
      toast.error('Erro ao executar workflow');
    }
  });

  // Atualizar status do workflow
  const updateWorkflowStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from('workflows')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      queryClient.invalidateQueries({ queryKey: ['workflow-stats'] });
      toast.success('Status do workflow atualizado!');
    },
    onError: (error) => {
      console.error('Error updating workflow:', error);
      toast.error('Erro ao atualizar workflow');
    }
  });

  return {
    workflows,
    executions,
    workflowStats,
    isLoading: loadingWorkflows || loadingExecutions,
    createWorkflow,
    executeWorkflow,
    updateWorkflowStatus
  };
};