import { Clock, AlertCircle, XCircle, Timer } from 'lucide-react';
import { MonthlySummary } from '@/hooks/useTimeRecords';

interface ProductivitySummaryCardsProps {
  summary: MonthlySummary;
}

export const ProductivitySummaryCards = ({ summary }: ProductivitySummaryCardsProps) => {
  const formatHours = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h${m > 0 ? m.toString().padStart(2, '0') : ''}`;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="stat-card flex items-center gap-3">
        <div className="p-2 rounded-lg bg-success/10">
          <Clock className="w-5 h-5 text-success" />
        </div>
        <div>
          <p className="text-2xl font-bold text-success">{summary.daysOnTime}</p>
          <p className="text-xs text-muted-foreground">Dias no horário</p>
        </div>
      </div>

      <div className="stat-card flex items-center gap-3">
        <div className="p-2 rounded-lg bg-warning/10">
          <AlertCircle className="w-5 h-5 text-warning" />
        </div>
        <div>
          <p className="text-2xl font-bold text-warning">{summary.daysLate}</p>
          <p className="text-xs text-muted-foreground">Dias com atraso</p>
        </div>
      </div>

      <div className="stat-card flex items-center gap-3">
        <div className="p-2 rounded-lg bg-destructive/10">
          <XCircle className="w-5 h-5 text-destructive" />
        </div>
        <div>
          <p className="text-2xl font-bold text-destructive">{summary.absences}</p>
          <p className="text-xs text-muted-foreground">Faltas</p>
        </div>
      </div>

      <div className="stat-card flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Timer className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-2xl font-bold text-primary">{formatHours(summary.overtimeHours)}</p>
          <p className="text-xs text-muted-foreground">Horas extras</p>
        </div>
      </div>
    </div>
  );
};
