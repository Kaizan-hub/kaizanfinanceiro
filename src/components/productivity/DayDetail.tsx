import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { DaySummary } from '@/hooks/useTimeRecords';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DayDetailProps {
  daySummary: DaySummary | null;
  selectedDate: string;
  onRegisterTime: (date: string, field: 'entry_time' | 'break_start' | 'break_end' | 'exit_time', time: string) => Promise<void>;
  onRegisterNow: (field: 'entry_time' | 'break_start' | 'break_end' | 'exit_time') => Promise<void>;
}

export const DayDetail = ({ daySummary, selectedDate, onRegisterTime, onRegisterNow }: DayDetailProps) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [timeValue, setTimeValue] = useState('');

  const record = daySummary?.record;
  const dateObj = parseISO(selectedDate);
  const dayLabel = format(dateObj, "EEE, d MMM", { locale: ptBR });

  const getStatusBadge = () => {
    if (!daySummary) return null;
    switch (daySummary.status) {
      case 'on-time':
        return <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: '#16a34a' }}>NO HORÁRIO</span>;
      case 'late':
        return <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: '#f97316' }}>ATRASO</span>;
      case 'absent':
        return <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: '#ef4444' }}>FALTA</span>;
      case 'overtime':
        return <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: '#16a34a' }}>HORA EXTRA</span>;
      default:
        return null;
    }
  };

  const handleSaveTime = async (field: 'entry_time' | 'break_start' | 'break_end' | 'exit_time') => {
    if (timeValue) {
      await onRegisterTime(selectedDate, field, timeValue);
      setEditingField(null);
      setTimeValue('');
    }
  };

  const getNextAction = (): { field: 'entry_time' | 'break_start' | 'break_end' | 'exit_time'; label: string } | null => {
    if (!record?.entry_time) return { field: 'entry_time', label: '+ Registrar entrada' };
    if (!record?.break_start) return { field: 'break_start', label: '+ Registrar intervalo' };
    if (!record?.break_end) return { field: 'break_end', label: '+ Registrar retorno' };
    if (!record?.exit_time) return { field: 'exit_time', label: '+ Registrar saída' };
    return null;
  };

  const nextAction = getNextAction();

  const TimeColumn = ({ label, value }: { label: string; value: string | null }) => (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
      <p className="text-base font-bold text-foreground">{value || '--:--'}</p>
    </div>
  );

  return (
    <div 
      className="flex items-center justify-between rounded-[20px] border border-border bg-card px-7 py-6"
    >
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <p className="text-base font-semibold capitalize text-foreground">{dayLabel}</p>
          {getStatusBadge()}
        </div>

        <div className="flex items-center gap-6 ml-4">
          <TimeColumn label="ENTRADA" value={record?.entry_time ?? null} />
          <TimeColumn label="INTERVALO" value={record?.break_start ?? null} />
          <TimeColumn label="SAÍDA" value={record?.exit_time ?? null} />
        </div>
      </div>

      <div>
        {editingField ? (
          <div className="flex items-center gap-2">
            <Input
              type="time"
              value={timeValue}
              onChange={(e) => setTimeValue(e.target.value)}
              className="w-28"
              autoFocus
            />
            <button
              onClick={() => handleSaveTime(editingField as any)}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ backgroundColor: '#111' }}
            >
              Salvar
            </button>
            <button
              onClick={() => { setEditingField(null); setTimeValue(''); }}
              className="px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          </div>
        ) : nextAction ? (
          <button
            onClick={() => {
              const isToday = selectedDate === new Date().toISOString().split('T')[0];
              if (isToday) {
                onRegisterNow(nextAction.field);
              } else {
                setEditingField(nextAction.field);
                setTimeValue('');
              }
            }}
            className="px-6 py-3 rounded-[12px] text-sm font-semibold text-white transition-all hover:scale-[1.03]"
            style={{ backgroundColor: '#111' }}
          >
            {nextAction.label}
          </button>
        ) : (
          <span className="text-sm text-muted-foreground">Dia completo ✓</span>
        )}
      </div>
    </div>
  );
};
