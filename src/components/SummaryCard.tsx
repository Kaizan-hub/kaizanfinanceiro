import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: number;
  percentage?: number;
  icon?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  delay?: number;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const SummaryCard = ({ 
  title, 
  value, 
  percentage, 
  icon,
  variant = 'default',
  delay = 0 
}: SummaryCardProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'border-l-4 border-l-success';
      case 'warning':
        return 'border-l-4 border-l-warning';
      case 'danger':
        return 'border-l-4 border-l-destructive';
      default:
        return 'border-l-4 border-l-primary';
    }
  };

  const getPercentageStyle = () => {
    if (percentage === undefined) return null;
    if (percentage > 0) return 'percentage-positive';
    if (percentage < 0) return 'percentage-negative';
    return 'percentage-neutral';
  };

  const getPercentageIcon = () => {
    if (percentage === undefined) return null;
    if (percentage > 0) return <TrendingUp className="w-3 h-3" />;
    if (percentage < 0) return <TrendingDown className="w-3 h-3" />;
    return <Minus className="w-3 h-3" />;
  };

  return (
    <div 
      className={cn(
        'stat-card animate-slide-up opacity-0',
        getVariantStyles()
      )}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="metric-label">{title}</p>
          <p className={cn(
            'metric-value',
            variant === 'success' && 'text-success',
            variant === 'warning' && 'text-warning',
            variant === 'danger' && 'text-destructive'
          )}>
            {formatCurrency(value)}
          </p>
        </div>
        {icon && (
          <div className={cn(
            'p-2 rounded-lg',
            variant === 'success' && 'bg-success/10 text-success',
            variant === 'warning' && 'bg-warning/10 text-warning',
            variant === 'danger' && 'bg-destructive/10 text-destructive',
            variant === 'default' && 'bg-primary/10 text-primary'
          )}>
            {icon}
          </div>
        )}
      </div>
      {percentage !== undefined && (
        <div className="mt-3">
          <span className={cn(getPercentageStyle())}>
            {getPercentageIcon()}
            {Math.abs(percentage).toFixed(1)}%
          </span>
          <span className="text-xs text-muted-foreground ml-2">da receita</span>
        </div>
      )}
    </div>
  );
};
