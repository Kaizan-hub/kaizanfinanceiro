import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DaySummary } from '@/hooks/useTimeRecords';
import { Clock, Coffee, LogIn, LogOut, Plus } from 'lucide-react';
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
  const formattedDate = format(parseISO(selectedDate), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });

  const getStatusInfo = () => {
    if (!daySummary) return { label: 'Sem registro', color: 'bg-muted text-muted-foreground' };
    
    switch (daySummary.status) {
      case 'on-time':
        return { label: 'No horário', color: 'bg-success/10 text-success' };
      case 'late':
        return { label: 'Atraso', color: 'bg-warning/10 text-warning' };
      case 'absent':
        return { label: 'Falta', color: 'bg-destructive/10 text-destructive' };
      case 'overtime':
        return { label: 'Hora extra', color: 'bg-primary/10 text-primary' };
      default:
        return { label: 'Incompleto', color: 'bg-muted text-muted-foreground' };
    }
  };

  const statusInfo = getStatusInfo();

  const handleSaveTime = async (field: 'entry_time' | 'break_start' | 'break_end' | 'exit_time') => {
    if (timeValue) {
      await onRegisterTime(selectedDate, field, timeValue);
      setEditingField(null);
      setTimeValue('');
    }
  };

  const handleRegisterNow = async (field: 'entry_time' | 'break_start' | 'break_end' | 'exit_time') => {
    await onRegisterNow(field);
  };

  const TimeField = ({ 
    label, 
    value, 
    field, 
    icon: Icon 
  }: { 
    label: string; 
    value: string | null; 
    field: 'entry_time' | 'break_start' | 'break_end' | 'exit_time';
    icon: typeof Clock;
  }) => (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="w-4 h-4" />
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {editingField === field ? (
          <>
            <Input
              type="time"
              value={timeValue}
              onChange={(e) => setTimeValue(e.target.value)}
              className="w-24"
            />
            <Button size="sm" onClick={() => handleSaveTime(field)}>
              Salvar
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditingField(null)}>
              Cancelar
            </Button>
          </>
        ) : (
          <>
            <span className="text-xl font-bold">{value || '--:--'}</span>
            {!value && (
              <Button 
                size="sm" 
                variant="outline" 
                className="text-xs gap-1"
                onClick={() => {
                  setEditingField(field);
                  setTimeValue('');
                }}
              >
                <Plus className="w-3 h-3" />
                Registrar
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="stat-card space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Dia Selecionado</h3>
          <p className="text-sm text-muted-foreground capitalize">{formattedDate}</p>
        </div>
        <span className={cn('px-3 py-1 rounded-full text-xs font-medium', statusInfo.color)}>
          {statusInfo.label}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <TimeField label="Entrada" value={record?.entry_time ?? null} field="entry_time" icon={LogIn} />
        <TimeField label="Intervalo" value={record?.break_start ?? null} field="break_start" icon={Coffee} />
        <TimeField label="Retorno" value={record?.break_end ?? null} field="break_end" icon={Coffee} />
        <TimeField label="Saída" value={record?.exit_time ?? null} field="exit_time" icon={LogOut} />
      </div>

      {isToday && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          <Button 
            size="sm" 
            variant="outline"
            className="text-xs gap-1"
            onClick={() => handleRegisterNow('entry_time')}
            disabled={!!record?.entry_time}
          >
            <Plus className="w-3 h-3" />
            Registrar Entrada
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            className="text-xs gap-1"
            onClick={() => handleRegisterNow('break_start')}
            disabled={!record?.entry_time || !!record?.break_start}
          >
            <Plus className="w-3 h-3" />
            Registrar Início do Intervalo
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            className="text-xs gap-1"
            onClick={() => handleRegisterNow('break_end')}
            disabled={!record?.break_start || !!record?.break_end}
          >
            <Plus className="w-3 h-3" />
            Registrar Fim do Intervalo
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            className="text-xs gap-1"
            onClick={() => handleRegisterNow('exit_time')}
            disabled={!record?.break_end || !!record?.exit_time}
          >
            <Plus className="w-3 h-3" />
            Registrar Saída
          </Button>
        </div>
      )}

      {daySummary && daySummary.hoursWorked > 0 && (
        <div className="pt-2 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Horas trabalhadas: <span className="font-bold text-foreground">{daySummary.hoursWorked.toFixed(1)}h</span>
          </p>
        </div>
      )}
    </div>
  );
};
