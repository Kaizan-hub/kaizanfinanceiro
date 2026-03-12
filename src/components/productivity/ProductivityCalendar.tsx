import { DaySummary } from '@/hooks/useTimeRecords';
import { cn } from '@/lib/utils';
import { Check, AlertTriangle, X } from 'lucide-react';

interface ProductivityCalendarProps {
  days: DaySummary[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  year: number;
  month: number;
}

const WEEKDAYS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

export const ProductivityCalendar = ({ 
  days, 
  selectedDate, 
  onSelectDate,
  year,
  month 
}: ProductivityCalendarProps) => {
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const today = new Date().toISOString().split('T')[0];

  const getCardStyle = (day: DaySummary, isSelected: boolean, isFuture: boolean) => {
    if (isSelected) {
      return {
        backgroundColor: '#111',
        color: '#fff',
        boxShadow: '0 4px 14px rgba(0,0,0,0.35)',
      };
    }
    if (isFuture) {
      return {
        backgroundColor: 'transparent',
        color: 'rgba(0,0,0,0.25)',
        opacity: 0.25,
      };
    }
    if (!day.record?.entry_time && day.status === 'absent') {
      return {
        backgroundColor: '#ef4444',
        color: '#fff',
        boxShadow: '0 4px 14px rgba(239,68,68,0.33)',
      };
    }
    switch (day.status) {
      case 'on-time':
      case 'overtime':
        return {
          backgroundColor: '#16a34a',
          color: '#fff',
          boxShadow: '0 4px 14px rgba(22,163,74,0.33)',
        };
      case 'late':
        return {
          backgroundColor: '#f97316',
          color: '#fff',
          boxShadow: '0 4px 14px rgba(249,115,22,0.33)',
        };
      case 'absent':
        return {
          backgroundColor: '#ef4444',
          color: '#fff',
          boxShadow: '0 4px 14px rgba(239,68,68,0.33)',
        };
      default:
        return {
          backgroundColor: '#fff',
          color: '#ccc',
        };
    }
  };

  const getIcon = (status: DaySummary['status'], isSelected: boolean) => {
    if (isSelected) {
      return <X className="w-3.5 h-3.5" />;
    }
    switch (status) {
      case 'on-time':
      case 'overtime':
        return <Check className="w-3.5 h-3.5" />;
      case 'late':
        return <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2.5} />;
      case 'absent':
        return <X className="w-3.5 h-3.5" />;
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-center text-[11px] uppercase tracking-wider font-medium text-muted-foreground py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Empty cells */}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Day cells */}
        {days.map((day) => {
          const dayNumber = parseInt(day.date.split('-')[2]);
          const isSelected = day.date === selectedDate;
          const isFuture = new Date(day.date + 'T23:59:59') > new Date();
          const isToday = day.date === today;
          const hasRecord = !!day.record?.entry_time;
          const style = getCardStyle(day, isSelected, isFuture);
          const showIcon = !isFuture && (hasRecord || day.status === 'absent');
          const icon = getIcon(day.status, isSelected);

          return (
            <button
              key={day.date}
              onClick={() => onSelectDate(day.date)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 transition-all duration-200 hover:scale-[1.05]',
                'rounded-[14px] py-3 px-2 min-h-[80px]',
                isToday && !isSelected && 'ring-2 ring-foreground/20'
              )}
              style={style}
            >
              <span className="text-[15px] font-bold">{dayNumber}</span>
              {showIcon && (
                <span 
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ 
                    backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.25)' 
                  }}
                >
                  {icon}
                </span>
              )}
              {hasRecord && day.record?.entry_time && (
                <span className="text-[9px]" style={{ opacity: 0.7 }}>
                  {day.record.entry_time}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
