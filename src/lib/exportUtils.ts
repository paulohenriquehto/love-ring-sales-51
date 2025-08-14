import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const exportAnalyticsToCSV = async (dateRange: { from: Date; to: Date }) => {
  try {
    // Buscar dados detalhados
    const { data: orders } = await supabase
      .from('orders')
      .select(`
        order_number,
        customer_name,
        total,
        status,
        created_at,
        order_items(
          product_name,
          quantity,
          unit_price,
          total_price
        )
      `)
      .gte('created_at', dateRange.from.toISOString())
      .lte('created_at', dateRange.to.toISOString())
      .order('created_at', { ascending: false });

    if (!orders?.length) {
      throw new Error('Nenhum dado encontrado para o período selecionado');
    }

    // Preparar dados para CSV
    const csvData = [];
    csvData.push([
      'Número do Pedido',
      'Cliente',
      'Data',
      'Status',
      'Produto',
      'Quantidade',
      'Preço Unitário',
      'Total Item',
      'Total Pedido'
    ]);

    orders.forEach(order => {
      if (order.order_items?.length) {
        order.order_items.forEach(item => {
          csvData.push([
            order.order_number || '',
            order.customer_name || '',
            format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
            order.status || '',
            item.product_name || '',
            item.quantity?.toString() || '0',
            `R$ ${(item.unit_price || 0).toFixed(2)}`,
            `R$ ${(item.total_price || 0).toFixed(2)}`,
            `R$ ${(order.total || 0).toFixed(2)}`
          ]);
        });
      } else {
        csvData.push([
          order.order_number || '',
          order.customer_name || '',
          format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
          order.status || '',
          '-',
          '0',
          'R$ 0,00',
          'R$ 0,00',
          `R$ ${(order.total || 0).toFixed(2)}`
        ]);
      }
    });

    // Converter para CSV
    const csvContent = csvData.map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio-vendas-${format(dateRange.from, 'dd-MM-yyyy')}-${format(dateRange.to, 'dd-MM-yyyy')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return { success: true };
  } catch (error) {
    console.error('Erro ao exportar:', error);
    throw error;
  }
};

export const generateAnalyticsReport = async (dateRange: { from: Date; to: Date }) => {
  // Esta função pode ser expandida para gerar relatórios mais complexos
  // Por enquanto, vamos usar a exportação CSV
  return exportAnalyticsToCSV(dateRange);
};