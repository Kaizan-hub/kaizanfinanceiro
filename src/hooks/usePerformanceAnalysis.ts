import { useState, useCallback, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { DailyPerformanceNote } from '@/types/finance';
import { format, subDays, startOfDay, endOfDay, parseISO, isWithinInterval } from 'date-fns';

export type DateFilterType = 'today' | 'last7days' | 'custom';

interface PerformanceMetrics {
  totalRevenue: number;
  totalAds: number;
  totalStructure: number;
  netProfit: number;
  roas: number;
  totalClientsServed: number;
  profitPerLead: number;
}

interface DailyClientData {
  date: string;
  clients: number;
}

export const usePerformanceAnalysis = (selectedYear: number) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [dateFilter, setDateFilter] = useState<DateFilterType>('last7days');
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  
  // Data state
  const [entries, setEntries] = useState<{ date: string; value: number }[]>([]);
  const [adExpenses, setAdExpenses] = useState<{ date: string; value: number; clientsServed: number }[]>([]);
  const [structureCosts, setStructureCosts] = useState<{ date: string; value: number }[]>([]);
  const [performanceNotes, setPerformanceNotes] = useState<DailyPerformanceNote[]>([]);

  // Get date range based on filter
  const getDateRange = useCallback(() => {
    const today = new Date();
    
    switch (dateFilter) {
      case 'today':
        return {
          start: startOfDay(today),
          end: endOfDay(today),
        };
      case 'last7days':
        return {
          start: startOfDay(subDays(today, 6)),
          end: endOfDay(today),
        };
      case 'custom':
        return {
          start: customStartDate ? startOfDay(customStartDate) : startOfDay(subDays(today, 6)),
          end: customEndDate ? endOfDay(customEndDate) : endOfDay(today),
        };
      default:
        return {
          start: startOfDay(subDays(today, 6)),
          end: endOfDay(today),
        };
    }
  }, [dateFilter, customStartDate, customEndDate]);

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [entriesRes, adExpensesRes, structureRes, notesRes] = await Promise.all([
        supabase.from('entries').select('date, value').eq('user_id', user.id).eq('year', selectedYear),
        supabase.from('ad_expenses').select('date, value, clients_served').eq('user_id', user.id).eq('year', selectedYear),
        supabase.from('structure_costs').select('date, value').eq('user_id', user.id).eq('year', selectedYear),
        supabase.from('daily_performance_notes').select('*').eq('user_id', user.id).eq('year', selectedYear),
      ]);

      if (entriesRes.error) throw entriesRes.error;
      if (adExpensesRes.error) throw adExpensesRes.error;
      if (structureRes.error) throw structureRes.error;
      if (notesRes.error) throw notesRes.error;

      setEntries(entriesRes.data?.map(e => ({ date: e.date, value: Number(e.value) })) || []);
      setAdExpenses(adExpensesRes.data?.map(e => ({ 
        date: e.date, 
        value: Number(e.value),
        clientsServed: e.clients_served || 0,
      })) || []);
      setStructureCosts(structureRes.data?.map(e => ({ date: e.date, value: Number(e.value) })) || []);
      setPerformanceNotes(notesRes.data?.map(n => ({
        id: n.id,
        date: n.date,
        positivePoints: n.positive_points || undefined,
        improvementOpportunities: n.improvement_opportunities || undefined,
        performanceRating: n.performance_rating || undefined,
      })) || []);

    } catch (error) {
      console.error('Error fetching performance data:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados de performance.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, selectedYear, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate metrics based on filtered data
  const metrics: PerformanceMetrics = useMemo(() => {
    const { start, end } = getDateRange();
    
    const filteredEntries = entries.filter(e => {
      const entryDate = parseISO(e.date);
      return isWithinInterval(entryDate, { start, end });
    });
    
    const filteredAdExpenses = adExpenses.filter(e => {
      const expenseDate = parseISO(e.date);
      return isWithinInterval(expenseDate, { start, end });
    });

    const filteredStructureCosts = structureCosts.filter(e => {
      const costDate = parseISO(e.date);
      return isWithinInterval(costDate, { start, end });
    });

    const totalRevenue = filteredEntries.reduce((sum, e) => sum + e.value, 0);
    const totalAds = filteredAdExpenses.reduce((sum, e) => sum + e.value, 0);
    const totalStructure = filteredStructureCosts.reduce((sum, e) => sum + e.value, 0);
    const netProfit = totalRevenue - totalAds - totalStructure;
    const roas = totalAds > 0 ? totalRevenue / totalAds : 0;
    const totalClientsServed = filteredAdExpenses.reduce((sum, e) => sum + e.clientsServed, 0);
    const profitPerLead = totalClientsServed > 0 ? netProfit / totalClientsServed : 0;

    return {
      totalRevenue,
      totalAds,
      totalStructure,
      netProfit,
      roas,
      totalClientsServed,
      profitPerLead,
    };
  }, [entries, adExpenses, structureCosts, getDateRange]);

  // Get daily client data for chart
  const dailyClientData: DailyClientData[] = useMemo(() => {
    const { start, end } = getDateRange();
    
    const filteredAdExpenses = adExpenses.filter(e => {
      const expenseDate = parseISO(e.date);
      return isWithinInterval(expenseDate, { start, end });
    });

    // Group by date
    const grouped = filteredAdExpenses.reduce((acc, e) => {
      if (!acc[e.date]) {
        acc[e.date] = 0;
      }
      acc[e.date] += e.clientsServed;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([date, clients]) => ({ date, clients }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [adExpenses, getDateRange]);

  // Performance notes for selected date
  const getPerformanceNote = useCallback((date: string): DailyPerformanceNote | undefined => {
    return performanceNotes.find(n => n.date === date);
  }, [performanceNotes]);

  const savePerformanceNote = useCallback(async (
    date: string,
    positivePoints?: string,
    improvementOpportunities?: string,
    performanceRating?: number
  ) => {
    if (!user) return;

    try {
      const existingNote = performanceNotes.find(n => n.date === date);

      if (existingNote) {
        const { error } = await supabase
          .from('daily_performance_notes')
          .update({
            positive_points: positivePoints || null,
            improvement_opportunities: improvementOpportunities || null,
            performance_rating: performanceRating || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingNote.id)
          .eq('user_id', user.id);

        if (error) throw error;

        setPerformanceNotes(prev => prev.map(n => 
          n.id === existingNote.id 
            ? { ...n, positivePoints, improvementOpportunities, performanceRating }
            : n
        ));
      } else {
        const { data, error } = await supabase
          .from('daily_performance_notes')
          .insert({
            user_id: user.id,
            date,
            year: selectedYear,
            positive_points: positivePoints || null,
            improvement_opportunities: improvementOpportunities || null,
            performance_rating: performanceRating || null,
          })
          .select()
          .single();

        if (error) throw error;

        setPerformanceNotes(prev => [...prev, {
          id: data.id,
          date: data.date,
          positivePoints: data.positive_points || undefined,
          improvementOpportunities: data.improvement_opportunities || undefined,
          performanceRating: data.performance_rating || undefined,
        }]);
      }

      toast({
        title: 'Sucesso',
        description: 'Relatório salvo com sucesso!',
      });
    } catch (error) {
      console.error('Error saving performance note:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o relatório.',
        variant: 'destructive',
      });
    }
  }, [user, selectedYear, performanceNotes, toast]);

  return {
    dateFilter,
    setDateFilter,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    loading,
    metrics,
    dailyClientData,
    getPerformanceNote,
    savePerformanceNote,
    getDateRange,
  };
};
