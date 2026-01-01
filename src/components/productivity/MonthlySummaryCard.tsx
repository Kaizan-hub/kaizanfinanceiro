import { MonthlySummary } from '@/hooks/useTimeRecords';
import { Button } from '@/components/ui/button';
import { Clock, TrendingUp, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MonthlySummaryCardProps {
  summary: MonthlySummary;
  month: number;
  year: number;
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const MonthlySummaryCard = ({ summary, month, year }: MonthlySummaryCardProps) => {
  const { toast } = useToast();

  const formatHours = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const handleGenerateReport = () => {
    toast({
      title: 'Relatório Mensal',
      description: `${MONTHS[month]} ${year}\n
        Média Diária: ${formatHours(summary.averageDailyHours)}\n
        Total de Horas: ${Math.round(summary.totalHours)}\n
        Produtividade: ${summary.productivityPercent.toFixed(0)}%`,
    });
  };

  return (
    <div className="stat-card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Resumo Mensal</h3>
        <span className="text-xs text-muted-foreground">
          {MONTHS[month]} {year}
        </span>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Clock className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-lg font-bold">{formatHours(summary.averageDailyHours)}</p>
            <p className="text-xs text-muted-foreground">Média Diária</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-success/10">
            <TrendingUp className="w-4 h-4 text-success" />
          </div>
          <div>
            <p className="text-lg font-bold">{Math.round(summary.totalHours)}</p>
            <p className="text-xs text-muted-foreground">Horas Trabalhadas</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent">
            <TrendingUp className="w-4 h-4 text-accent-foreground" />
          </div>
          <div>
            <p className="text-lg font-bold">{summary.productivityPercent.toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground">Produtividade</p>
          </div>
        </div>
      </div>

      <Button 
        variant="default" 
        className="w-full gap-2"
        onClick={handleGenerateReport}
      >
        <FileText className="w-4 h-4" />
        Relatório Mensal
      </Button>
    </div>
  );
};
