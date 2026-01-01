import { DaySummary } from '@/hooks/useTimeRecords';
import { cn } from '@/lib/utils';

interface ProductivityCalendarProps {
  days: DaySummary[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  year: number;
  month: number;
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const ProductivityCalendar = ({ 
  days, 
  selectedDate, 
  onSelectDate,
  year,
  month 
}: ProductivityCalendarProps) => {
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const today = new Date().toISOString().split('T')[0];

  const getStatusColor = (status: DaySummary['status']) => {
    switch (status) {
      case 'on-time':
        return 'bg-success';
      case 'late':
        return 'bg-warning';
      case 'absent':
        return 'bg-destructive';
      case 'overtime':
        return 'bg-primary';
      default:
        return 'bg-muted';
    }
  };

  const getStatusLabel = (status: DaySummary['status']) => {
    switch (status) {
      case 'on-time':
        return 'No horário';
      case 'late':
        return 'Atraso';
      case 'absent':
        return 'Falta';
      case 'overtime':
        return 'Hora extra';
      default:
        return 'Sem registro';
    }
  };

  return (
    <div className="stat-card">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-success"></span>
          <span>No horário ≤ 08:10</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-warning"></span>
          <span>Atrasado {'>'} 08:10</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-destructive"></span>
          <span>Falta</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-primary"></span>
          <span>Hora extra</span>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before the first day of month */}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square"></div>
        ))}

        {/* Day cells */}
        {days.map((day) => {
          const dayNumber = parseInt(day.date.split('-')[2]);
          const isSelected = day.date === selectedDate;
          const isToday = day.date === today;
          const isWeekend = new Date(day.date).getDay() === 0 || new Date(day.date).getDay() === 6;
          const isFuture = new Date(day.date) > new Date();

          return (
            <button
              key={day.date}
              onClick={() => onSelectDate(day.date)}
              className={cn(
                'aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 text-sm transition-all',
                'hover:ring-2 hover:ring-primary/50',
                isSelected && 'ring-2 ring-primary',
                isToday && 'font-bold',
                (isWeekend || isFuture) && 'opacity-50'
              )}
            >
              <span className="text-foreground">{dayNumber}</span>
              {!isWeekend && !isFuture && (
                <div className="flex gap-0.5">
                  {day.record?.entry_time && (
                    <span className={cn('w-1.5 h-1.5 rounded-full', getStatusColor(day.status))}></span>
                  )}
                  {day.record?.break_start && (
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50"></span>
                  )}
                  {day.record?.break_end && (
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50"></span>
                  )}
                  {day.record?.exit_time && (
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground/50"></span>
                  )}
                </div>
              )}
              {!isWeekend && !isFuture && !day.record?.entry_time && day.status === 'absent' && (
                <span className="w-3 h-3 rounded-full bg-destructive flex items-center justify-center">
                  <span className="text-[8px] text-destructive-foreground font-bold">!</span>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
