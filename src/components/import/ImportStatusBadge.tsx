import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Activity, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Pause 
} from 'lucide-react';

interface ImportStatusBadgeProps {
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'paused';
  className?: string;
}

const ImportStatusBadge: React.FC<ImportStatusBadgeProps> = ({ status, className }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          variant: 'outline' as const,
          icon: Clock,
          label: 'Pendente',
          className: 'text-muted-foreground border-muted-foreground',
        };
      case 'processing':
        return {
          variant: 'default' as const,
          icon: Activity,
          label: 'Processando',
          className: 'bg-blue-500 text-white border-blue-500 animate-pulse',
        };
      case 'completed':
        return {
          variant: 'default' as const,
          icon: CheckCircle,
          label: 'Concluído',
          className: 'bg-green-500 text-white border-green-500',
        };
      case 'failed':
        return {
          variant: 'destructive' as const,
          icon: XCircle,
          label: 'Falhou',
          className: 'bg-red-500 text-white border-red-500',
        };
      case 'cancelled':
        return {
          variant: 'outline' as const,
          icon: AlertCircle,
          label: 'Cancelado',
          className: 'text-orange-600 border-orange-600',
        };
      case 'paused':
        return {
          variant: 'outline' as const,
          icon: Pause,
          label: 'Pausado',
          className: 'text-yellow-600 border-yellow-600',
        };
      default:
        return {
          variant: 'outline' as const,
          icon: Clock,
          label: 'Desconhecido',
          className: 'text-muted-foreground border-muted-foreground',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant} 
      className={`flex items-center gap-1.5 px-2.5 py-1 ${config.className} ${className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </Badge>
  );
};

export default ImportStatusBadge;