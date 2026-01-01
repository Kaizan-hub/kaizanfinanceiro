import { WeeklySummary } from '@/hooks/useTimeRecords';
import { Button } from '@/components/ui/button';
import { Clock, AlertCircle, Timer, TrendingUp, FileText } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface WeeklySummaryCardProps {
  summary: WeeklySummary;
}

export const WeeklySummaryCard = ({ summary }: WeeklySummaryCardProps) => {
  const { toast } = useToast();

  const formatHours = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: string) => {
    return format(parseISO(date), "dd/MM/yyyy", { locale: ptBR });
  };

  const handleGenerateReport = () => {
    toast({
      title: 'Relatório Semanal',
      description: `Período: ${formatDate(summary.startDate)} - ${formatDate(summary.endDate)}\n
        Horas Trabalhadas: ${formatHours(summary.totalHours)}\n
        Atrasos: ${formatHours(summary.accumulatedDelays)}\n
        Horas Extras: ${formatHours(summary.overtimeHours)}\n
        Produtividade: ${summary.productiveDaysPercent.toFixed(0)}%`,
    });
  };

  return (
    <div className="stat-card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Resumo da Semana</h3>
        <span className="text-xs text-muted-foreground">
          {formatDate(summary.startDate)} - {formatDate(summary.endDate)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Clock className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-lg font-bold">{formatHours(summary.totalHours)}</p>
            <p className="text-xs text-muted-foreground">Horas Trabalhadas</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-warning/10">
            <AlertCircle className="w-4 h-4 text-warning" />
          </div>
          <div>
            <p className="text-lg font-bold">{formatHours(summary.accumulatedDelays)}</p>
            <p className="text-xs text-muted-foreground">Atrasos Acumulados</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-success/10">
            <Timer className="w-4 h-4 text-success" />
          </div>
          <div>
            <p className="text-lg font-bold">{formatHours(summary.overtimeHours)}</p>
            <p className="text-xs text-muted-foreground">Horas Extras</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent">
            <TrendingUp className="w-4 h-4 text-accent-foreground" />
          </div>
          <div>
            <p className="text-lg font-bold">{summary.productiveDaysPercent.toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground">Dias Produtivos</p>
          </div>
        </div>
      </div>

      <Button 
        variant="default" 
        className="w-full gap-2"
        onClick={handleGenerateReport}
      >
        <FileText className="w-4 h-4" />
        Relatório Semanal
      </Button>
    </div>
  );
};
