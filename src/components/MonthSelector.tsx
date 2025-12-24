import { MonthKey, MONTHS } from '@/types/finance';
import { cn } from '@/lib/utils';

interface MonthSelectorProps {
  selectedMonth: MonthKey;
  onSelectMonth: (month: MonthKey) => void;
}

export const MonthSelector = ({ selectedMonth, onSelectMonth }: MonthSelectorProps) => {
  return (
    <div className="flex flex-wrap gap-2 p-1 bg-secondary/50 rounded-xl">
      {MONTHS.map((month) => (
        <button
          key={month.key}
          onClick={() => onSelectMonth(month.key)}
          className={cn(
            'px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
            selectedMonth === month.key
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
          )}
        >
          {month.label}
        </button>
      ))}
    </div>
  );
};
