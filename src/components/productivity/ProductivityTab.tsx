import { useState } from 'react';
import { useTimeRecords } from '@/hooks/useTimeRecords';
import { ProductivityCalendar } from './ProductivityCalendar';
import { DayDetail } from './DayDetail';
import { Loader2 } from 'lucide-react';

const MONTH_NAMES = [
  'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
  'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO',
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
  const selectedDaySummary = days.find(d => d.date === selectedDate) || null;

  // Navigation
  const goToPrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  return (
    <div className="animate-fade-in flex justify-center">
      <div className="w-full" style={{ maxWidth: 720 }}>
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium mb-1">
              {MONTH_NAMES[selectedMonth]} {selectedYear}
            </p>
            <h2 className="text-[26px] font-bold leading-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Ponto & Produtividade
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: '#16a34a' }}>{monthlySummary.daysOnTime}</p>
              <p className="text-[11px] text-muted-foreground">No horário</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: '#f97316' }}>{monthlySummary.daysLate}</p>
              <p className="text-[11px] text-muted-foreground">Atrasos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: '#ef4444' }}>{monthlySummary.absences}</p>
              <p className="text-[11px] text-muted-foreground">Faltas</p>
            </div>
          </div>
        </div>

        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={goToPrevMonth}
            className="text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            ← Anterior
          </button>
          <button 
            onClick={goToNextMonth}
            className="text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            Próximo →
          </button>
        </div>

        {/* Calendar */}
        <ProductivityCalendar
          days={days}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          year={selectedYear}
          month={selectedMonth}
        />

        {/* Day Detail */}
        <div className="mt-8">
          <DayDetail
            daySummary={selectedDaySummary}
            selectedDate={selectedDate}
            onRegisterTime={registerTime}
            onRegisterNow={registerNow}
          />
        </div>
      </div>
    </div>
  );
};
