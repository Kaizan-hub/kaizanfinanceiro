import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface TimeRecord {
  id: string;
  user_id: string;
  date: string;
  year: number;
  entry_time: string | null;
  break_start: string | null;
  break_end: string | null;
  exit_time: string | null;
  created_at: string;
  updated_at: string;
}

export interface DaySummary {
  date: string;
  status: 'on-time' | 'late' | 'absent' | 'overtime' | 'incomplete';
  hoursWorked: number;
  record: TimeRecord | null;
}

export interface WeeklySummary {
  totalHours: number;
  accumulatedDelays: number;
  overtimeHours: number;
  productiveDaysPercent: number;
  startDate: string;
  endDate: string;
}

export interface MonthlySummary {
  daysOnTime: number;
  daysLate: number;
  absences: number;
  overtimeHours: number;
  totalHours: number;
  averageDailyHours: number;
  productivityPercent: number;
}

const ENTRY_LIMIT = '08:00';
const ENTRY_TOLERANCE = '08:10';
const EXIT_TIME = '18:00';
const BREAK_DURATION = 1; // 1 hour

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

export const useTimeRecords = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [records, setRecords] = useState<TimeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const fetchRecords = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('time_records')
        .select('*')
        .eq('user_id', user.id)
        .eq('year', selectedYear);

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error('Error fetching time records:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar registros de ponto',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, selectedYear, toast]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const getRecordForDate = (date: string): TimeRecord | null => {
    return records.find(r => r.date === date) || null;
  };

  const getDayStatus = (record: TimeRecord | null, date: string): DaySummary['status'] => {
    const today = new Date();
    const recordDate = new Date(date);
    
    // Future date
    if (recordDate > today) {
      return 'incomplete';
    }

    if (!record || !record.entry_time) {
      // Only mark as absent if the date has passed
      if (recordDate < today) {
        return 'absent';
      }
      return 'incomplete';
    }

    const entryMinutes = timeToMinutes(record.entry_time);
    const toleranceMinutes = timeToMinutes(ENTRY_TOLERANCE);
    
    // Check overtime first
    if (record.exit_time) {
      const exitMinutes = timeToMinutes(record.exit_time);
      const standardExitMinutes = timeToMinutes(EXIT_TIME);
      if (exitMinutes > standardExitMinutes) {
        return 'overtime';
      }
    }

    if (entryMinutes > toleranceMinutes) {
      return 'late';
    }

    return 'on-time';
  };

  const calculateHoursWorked = (record: TimeRecord | null): number => {
    if (!record || !record.entry_time || !record.exit_time) return 0;

    const entryMinutes = timeToMinutes(record.entry_time);
    const exitMinutes = timeToMinutes(record.exit_time);
    
    // Subtract 1 hour for break
    const totalMinutes = exitMinutes - entryMinutes - 60;
    return Math.max(0, totalMinutes / 60);
  };

  const getDaysInMonth = (year: number, month: number): DaySummary[] => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: DaySummary[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const record = getRecordForDate(date);
      const status = getDayStatus(record, date);
      const hoursWorked = calculateHoursWorked(record);

      days.push({
        date,
        status,
        hoursWorked,
        record,
      });
    }

    return days;
  };

  const getMonthlySummary = (): MonthlySummary => {
    const days = getDaysInMonth(selectedYear, selectedMonth);
    const today = new Date();
    
    let daysOnTime = 0;
    let daysLate = 0;
    let absences = 0;
    let overtimeHours = 0;
    let totalHours = 0;
    let workingDays = 0;

    days.forEach(day => {
      const dayDate = new Date(day.date);
      const dayOfWeek = dayDate.getDay();
      
      // Skip weekends and future dates
      if (dayOfWeek === 0 || dayOfWeek === 6) return;
      if (dayDate > today) return;

      workingDays++;

      switch (day.status) {
        case 'on-time':
          daysOnTime++;
          break;
        case 'late':
          daysLate++;
          break;
        case 'absent':
          absences++;
          break;
        case 'overtime':
          daysOnTime++;
          break;
      }

      totalHours += day.hoursWorked;

      // Calculate overtime
      if (day.record?.exit_time) {
        const exitMinutes = timeToMinutes(day.record.exit_time);
        const standardExitMinutes = timeToMinutes(EXIT_TIME);
        if (exitMinutes > standardExitMinutes) {
          overtimeHours += (exitMinutes - standardExitMinutes) / 60;
        }
      }
    });

    const averageDailyHours = workingDays > 0 ? totalHours / workingDays : 0;
    const productiveDays = daysOnTime + (days.filter(d => d.status === 'overtime').length);
    const productivityPercent = workingDays > 0 ? (daysOnTime / (workingDays - absences)) * 100 : 0;

    return {
      daysOnTime,
      daysLate,
      absences,
      overtimeHours,
      totalHours,
      averageDailyHours,
      productivityPercent: isNaN(productivityPercent) ? 0 : productivityPercent,
    };
  };

  const getWeeklySummary = (): WeeklySummary => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    let totalHours = 0;
    let accumulatedDelays = 0;
    let overtimeHours = 0;
    let productiveDays = 0;
    let workingDays = 0;

    for (let i = 0; i <= 6; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayOfWeek = currentDate.getDay();
      
      // Skip weekends
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;
      // Skip future dates
      if (currentDate > today) continue;

      workingDays++;
      const record = getRecordForDate(dateStr);
      
      if (record?.entry_time && record?.exit_time) {
        totalHours += calculateHoursWorked(record);

        // Check if late
        const entryMinutes = timeToMinutes(record.entry_time);
        const toleranceMinutes = timeToMinutes(ENTRY_TOLERANCE);
        if (entryMinutes > toleranceMinutes) {
          accumulatedDelays += (entryMinutes - toleranceMinutes) / 60;
        } else {
          productiveDays++;
        }

        // Check overtime
        const exitMinutes = timeToMinutes(record.exit_time);
        const standardExitMinutes = timeToMinutes(EXIT_TIME);
        if (exitMinutes > standardExitMinutes) {
          overtimeHours += (exitMinutes - standardExitMinutes) / 60;
        }
      }
    }

    const productiveDaysPercent = workingDays > 0 ? (productiveDays / workingDays) * 100 : 0;

    return {
      totalHours,
      accumulatedDelays,
      overtimeHours,
      productiveDaysPercent,
      startDate: startOfWeek.toISOString().split('T')[0],
      endDate: endOfWeek.toISOString().split('T')[0],
    };
  };

  const registerTime = async (
    date: string,
    field: 'entry_time' | 'break_start' | 'break_end' | 'exit_time',
    time: string
  ) => {
    if (!user) return;

    const year = parseInt(date.split('-')[0]);
    const existingRecord = getRecordForDate(date);

    try {
      if (existingRecord) {
        const { error } = await supabase
          .from('time_records')
          .update({ [field]: time })
          .eq('id', existingRecord.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('time_records')
          .insert({
            user_id: user.id,
            date,
            year,
            [field]: time,
          });

        if (error) throw error;
      }

      await fetchRecords();
      toast({
        title: 'Sucesso',
        description: 'Registro salvo com sucesso!',
      });
    } catch (error) {
      console.error('Error registering time:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao registrar ponto',
        variant: 'destructive',
      });
    }
  };

  const registerNow = async (field: 'entry_time' | 'break_start' | 'break_end' | 'exit_time') => {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    await registerTime(date, field, time);
  };

  return {
    records,
    loading,
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    getRecordForDate,
    getDaysInMonth,
    getMonthlySummary,
    getWeeklySummary,
    registerTime,
    registerNow,
    calculateHoursWorked,
    getDayStatus,
  };
};
