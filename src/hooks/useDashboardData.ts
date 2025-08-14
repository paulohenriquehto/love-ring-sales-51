import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type RequestWithProfile = {
  id: string;
  title: string;
  status: string;
  departments: { name: string } | null;
  requester_profile: { full_name: string } | null;
};

export const useDashboardData = () => {
  // Requisições pendentes
  const { data: pendingRequests = 0 } = useQuery({
    queryKey: ['dashboard-pending-requests'],
    queryFn: async () => {
      const { count } = await supabase
        .from('requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending_approval');
      return count || 0;
    }
  });

  // Departamentos ativos
  const { data: activeDepartments = 0 } = useQuery({
    queryKey: ['dashboard-active-departments'],
    queryFn: async () => {
      const { count } = await supabase
        .from('departments')
        .select('*', { count: 'exact', head: true })
        .eq('active', true);
      return count || 0;
    }
  });

  // Usuários ativos
  const { data: activeUsers = 0 } = useQuery({
    queryKey: ['dashboard-active-users'],
    queryFn: async () => {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('active', true);
      return count || 0;
    }
  });

  // Gastos do mês atual
  const { data: monthlyExpenses = 0 } = useQuery({
    queryKey: ['dashboard-monthly-expenses'],
    queryFn: async () => {
      const currentDate = new Date();
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const { data } = await supabase
        .from('requests')
        .select('total_amount')
        .gte('created_at', startOfMonth.toISOString())
        .lte('created_at', endOfMonth.toISOString())
        .in('status', ['approved', 'completed']);

      const total = data?.reduce((sum, request) => sum + (request.total_amount || 0), 0) || 0;
      return total;
    }
  });

  // Requisições recentes
  const { data: recentRequests = [] } = useQuery<RequestWithProfile[]>({
    queryKey: ['dashboard-recent-requests'],
    queryFn: async () => {
      const { data } = await supabase
        .from('requests')
        .select(`
          id,
          title,
          status,
          requester_user_id,
          departments(name)
        `)
        .order('created_at', { ascending: false })
        .limit(3);

      // Buscar dados dos usuários separadamente
      if (data) {
        const requestsWithUsers = await Promise.all(
          data.map(async (request) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('user_id', request.requester_user_id)
              .maybeSingle();
            
            return {
              id: request.id,
              title: request.title,
              status: request.status,
              departments: request.departments,
              requester_profile: profile
            };
          })
        );
        return requestsWithUsers as RequestWithProfile[];
      }

      return [];
    }
  });

  return {
    pendingRequests,
    activeDepartments,
    activeUsers,
    monthlyExpenses,
    recentRequests,
  };
};