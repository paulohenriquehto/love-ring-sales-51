import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type RequestWithProfile = {
  id: string;
  title: string;
  status: string;
  departments: { name: string } | null;
  requester_profile: { full_name: string } | null;
};

export const useDashboardData = () => {
  const queryClient = useQueryClient();

  // Função para invalidar todas as queries do dashboard
  const refreshDashboard = () => {
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  // Requisições pendentes
  const { data: pendingRequests = 0, error: pendingError, isLoading: loadingPending } = useQuery({
    queryKey: ['dashboard-pending-requests'],
    queryFn: async () => {
      try {
        const { count, error } = await supabase
          .from('requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending_approval');
        
        if (error) {
          console.error('Error fetching pending requests:', error);
          return 0;
        }
        
        return count || 0;
      } catch (error) {
        console.error('Error in pending requests query:', error);
        return 0;
      }
    },
    retry: 1,
    staleTime: 0, // Força refresh imediato
    gcTime: 0, // Remove cache persistente
  });

  // Departamentos ativos
  const { data: activeDepartments = 0, error: departmentsError, isLoading: loadingDepartments } = useQuery({
    queryKey: ['dashboard-active-departments'],
    queryFn: async () => {
      try {
        const { count, error } = await supabase
          .from('departments')
          .select('*', { count: 'exact', head: true })
          .eq('active', true);
        
        if (error) {
          console.error('Error fetching departments:', error);
          return 0;
        }
        
        return count || 0;
      } catch (error) {
        console.error('Error in departments query:', error);
        return 0;
      }
    },
    retry: 1,
    staleTime: 0,
    gcTime: 0,
  });

  // Usuários ativos
  const { data: activeUsers = 0, error: usersError, isLoading: loadingUsers } = useQuery({
    queryKey: ['dashboard-active-users'],
    queryFn: async () => {
      try {
        const { count, error } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('active', true);
        
        if (error) {
          console.error('Error fetching users:', error);
          return 0;
        }
        
        return count || 0;
      } catch (error) {
        console.error('Error in users query:', error);
        return 0;
      }
    },
    retry: 1,
    staleTime: 0,
    gcTime: 0,
  });

  // Gastos do mês atual
  const { data: monthlyExpenses = 0, error: expensesError, isLoading: loadingExpenses } = useQuery({
    queryKey: ['dashboard-monthly-expenses'],
    queryFn: async () => {
      try {
        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        const { data, error } = await supabase
          .from('requests')
          .select('total_amount')
          .gte('created_at', startOfMonth.toISOString())
          .lte('created_at', endOfMonth.toISOString())
          .in('status', ['approved', 'completed']);

        if (error) {
          console.error('Error fetching expenses:', error);
          return 0;
        }

        const total = data?.reduce((sum, request) => sum + (request.total_amount || 0), 0) || 0;
        return total;
      } catch (error) {
        console.error('Error in expenses query:', error);
        return 0;
      }
    },
    retry: 1,
    staleTime: 0,
    gcTime: 0,
  });

  // Requisições recentes
  const { data: recentRequests = [], error: recentError, isLoading: loadingRecent } = useQuery<RequestWithProfile[]>({
    queryKey: ['dashboard-recent-requests'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
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

        if (error) {
          console.error('Error fetching recent requests:', error);
          return [];
        }

        if (!data) return [];

        // Buscar dados dos usuários separadamente
        const requestsWithUsers = await Promise.all(
          data.map(async (request) => {
            try {
              const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('user_id', request.requester_user_id)
                .maybeSingle();
              
              if (profileError) {
                console.error('Error fetching profile:', profileError);
              }
              
              return {
                id: request.id,
                title: request.title,
                status: request.status,
                departments: request.departments,
                requester_profile: profile
              };
            } catch (error) {
              console.error('Error processing request:', error);
              return {
                id: request.id,
                title: request.title,
                status: request.status,
                departments: request.departments,
                requester_profile: null
              };
            }
          })
        );
        
        return requestsWithUsers as RequestWithProfile[];
      } catch (error) {
        console.error('Error in recent requests query:', error);
        return [];
      }
    },
    retry: 1,
    staleTime: 0,
    gcTime: 0,
  });

  // Log errors for debugging
  if (pendingError) console.error('Pending requests error:', pendingError);
  if (departmentsError) console.error('Departments error:', departmentsError);
  if (usersError) console.error('Users error:', usersError);
  if (expensesError) console.error('Expenses error:', expensesError);
  if (recentError) console.error('Recent requests error:', recentError);

  // Estado de loading geral
  const isLoading = loadingPending || loadingDepartments || loadingUsers || loadingExpenses || loadingRecent;

  return {
    pendingRequests,
    activeDepartments,
    activeUsers,
    monthlyExpenses,
    recentRequests,
    refreshDashboard,
    isLoading,
  };
};