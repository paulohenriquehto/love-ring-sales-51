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

  // Função para invalidar TODAS as queries do dashboard com limpeza completa
  const refreshDashboard = async () => {
    console.log('🔄 INICIANDO REFRESH COMPLETO DO DASHBOARD...');
    
    // Limpeza TOTAL do cache
    await queryClient.clear();
    console.log('🗑️ Cache React Query completamente limpo');
    
    // Invalidar queries específicas do dashboard
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-pending-requests'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-active-departments'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-active-users'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-monthly-expenses'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-recent-requests'] });
    
    console.log('♻️ Todas as queries invalidadas - forçando refetch...');
  };

  // Hard refresh que limpa TUDO e recarrega a página
  const hardRefresh = () => {
    console.log('🚨 HARD REFRESH ATIVADO - Limpando tudo...');
    
    // Limpar caches do navegador
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    // Limpar storage local
    localStorage.clear();
    sessionStorage.clear();
    
    // Recarregar página
    window.location.reload();
  };

  // Requisições pendentes
  const { data: pendingRequests = 0, error: pendingError, isLoading: loadingPending } = useQuery({
    queryKey: ['dashboard-pending-requests', Date.now()], // Cache busting com timestamp
    queryFn: async () => {
      const timestamp = new Date().toISOString();
      console.log(`📊 [${timestamp}] Executando query: Requisições Pendentes`);
      
      try {
        const { count, error } = await supabase
          .from('requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending_approval');
        
        if (error) {
          console.error('❌ Error fetching pending requests:', error);
          return 0;
        }
        
        console.log(`✅ [${timestamp}] Requisições Pendentes retornado:`, count);
        return count || 0;
      } catch (error) {
        console.error('❌ Error in pending requests query:', error);
        return 0;
      }
    },
    retry: 3,
    staleTime: 0, // Força refresh imediato
    gcTime: 0, // Remove cache persistente
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 30000, // Refetch a cada 30 segundos
  });

  // Departamentos ativos
  const { data: activeDepartments = 0, error: departmentsError, isLoading: loadingDepartments } = useQuery({
    queryKey: ['dashboard-active-departments', Date.now()],
    queryFn: async () => {
      const timestamp = new Date().toISOString();
      console.log(`🏢 [${timestamp}] Executando query: Departamentos Ativos`);
      
      try {
        const { count, error } = await supabase
          .from('departments')
          .select('*', { count: 'exact', head: true })
          .eq('active', true);
        
        if (error) {
          console.error('❌ Error fetching departments:', error);
          return 0;
        }
        
        console.log(`✅ [${timestamp}] Departamentos Ativos retornado:`, count);
        return count || 0;
      } catch (error) {
        console.error('❌ Error in departments query:', error);
        return 0;
      }
    },
    retry: 3,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  });

  // Usuários ativos
  const { data: activeUsers = 0, error: usersError, isLoading: loadingUsers } = useQuery({
    queryKey: ['dashboard-active-users', Date.now()],
    queryFn: async () => {
      const timestamp = new Date().toISOString();
      console.log(`👥 [${timestamp}] Executando query: Usuários Ativos`);
      
      try {
        const { count, error } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('active', true);
        
        if (error) {
          console.error('❌ Error fetching users:', error);
          return 0;
        }
        
        console.log(`✅ [${timestamp}] Usuários Ativos retornado:`, count);
        return count || 0;
      } catch (error) {
        console.error('❌ Error in users query:', error);
        return 0;
      }
    },
    retry: 3,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  });

  // Gastos do mês atual
  const { data: monthlyExpenses = 0, error: expensesError, isLoading: loadingExpenses } = useQuery({
    queryKey: ['dashboard-monthly-expenses', Date.now()],
    queryFn: async () => {
      const timestamp = new Date().toISOString();
      console.log(`💰 [${timestamp}] Executando query: Gastos Mensais`);
      
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
          console.error('❌ Error fetching expenses:', error);
          return 0;
        }

        const total = data?.reduce((sum, request) => sum + (request.total_amount || 0), 0) || 0;
        console.log(`✅ [${timestamp}] Gastos Mensais retornado:`, total);
        return total;
      } catch (error) {
        console.error('❌ Error in expenses query:', error);
        return 0;
      }
    },
    retry: 3,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  });

  // Requisições recentes
  const { data: recentRequests = [], error: recentError, isLoading: loadingRecent } = useQuery<RequestWithProfile[]>({
    queryKey: ['dashboard-recent-requests', Date.now()],
    queryFn: async () => {
      const timestamp = new Date().toISOString();
      console.log(`📋 [${timestamp}] Executando query: Requisições Recentes`);
      
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
          console.error('❌ Error fetching recent requests:', error);
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
        
        console.log(`✅ [${timestamp}] Requisições Recentes retornado:`, requestsWithUsers.length, 'items');
        return requestsWithUsers as RequestWithProfile[];
      } catch (error) {
        console.error('❌ Error in recent requests query:', error);
        return [];
      }
    },
    retry: 3,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
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
    hardRefresh,
    isLoading,
  };
};