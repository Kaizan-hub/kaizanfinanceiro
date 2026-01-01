import { useState } from 'react';
import { useTimeRecords } from '@/hooks/useTimeRecords';
import { ProductivitySummaryCards } from './ProductivitySummaryCards';
import { ProductivityCalendar } from './ProductivityCalendar';
import { DayDetail } from './DayDetail';
import { WeeklySummaryCard } from './WeeklySummaryCard';
import { MonthlySummaryCard } from './MonthlySummaryCard';
import { YearSelector } from '@/components/YearSelector';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Loader2 } from 'lucide-react';

const MONTHS = [
  { key: 0, name: 'Janeiro' },
  { key: 1, name: 'Fevereiro' },
  { key: 2, name: 'Março' },
  { key: 3, name: 'Abril' },
  { key: 4, name: 'Maio' },
  { key: 5, name: 'Junho' },
  { key: 6, name: 'Julho' },
  { key: 7, name: 'Agosto' },
  { key: 8, name: 'Setembro' },
  { key: 9, name: 'Outubro' },
  { key: 10, name: 'Novembro' },
  { key: 11, name: 'Dezembro' },
];

export const ProductivityTab = () => {
  const {
    loading,
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    getDaysInMonth,
    getMonthlySummary,
    getWeeklySummary,
    registerTime,
    registerNow,
  } = useTimeRecords();

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const days = getDaysInMonth(selectedYear, selectedMonth);
  const monthlySummary = getMonthlySummary();
  const weeklySummary = getWeeklySummary();
  const selectedDaySummary = days.find(d => d.date === selectedDate) || null;

  const currentYear = new Date().getFullYear();
  const availableYears = Array.from(
    { length: 6 },
    (_, i) => currentYear - 2 + i
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="section-title flex items-center gap-2 mb-0">
          <Clock className="w-5 h-5 text-primary" />
          Ponto & Produtividade
        </h2>
        <div className="flex items-center gap-2">
          <Select 
            value={selectedMonth.toString()} 
            onValueChange={(v) => setSelectedMonth(parseInt(v))}
          >
            <SelectTrigger className="w-[140px] bg-secondary/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((month) => (
                <SelectItem key={month.key} value={month.key.toString()}>
                  {month.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <YearSelector 
            selectedYear={selectedYear} 
            availableYears={availableYears} 
            onSelectYear={setSelectedYear} 
          />
        </div>
      </div>

      {/* Summary Cards */}
      <ProductivitySummaryCards summary={monthlySummary} />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar and Day Detail */}
        <div className="lg:col-span-2 space-y-4">
          <ProductivityCalendar
            days={days}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            year={selectedYear}
            month={selectedMonth}
          />
          <DayDetail
            daySummary={selectedDaySummary}
            selectedDate={selectedDate}
            onRegisterTime={registerTime}
            onRegisterNow={registerNow}
          />
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          <WeeklySummaryCard summary={weeklySummary} />
          <MonthlySummaryCard 
            summary={monthlySummary} 
            month={selectedMonth} 
            year={selectedYear} 
          />
        </div>
      </div>
    </div>
  );
};
