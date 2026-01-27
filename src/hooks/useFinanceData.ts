import { useState, useCallback, useMemo, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  MonthData, 
  MonthKey, 
  Entry, 
  AdExpense, 
  StructureCost, 
  MonthSummary,
  MONTHS 
} from '@/types/finance';
import { useToast } from '@/hooks/use-toast';

type YearData = Record<MonthKey, MonthData>;

const createEmptyMonthData = (): MonthData => ({
  entries: [],
  adExpenses: [],
  structureCosts: [],
});

const createInitialYearData = (): YearData => {
  const data = {} as YearData;
  MONTHS.forEach(m => {
    data[m.key] = createEmptyMonthData();
  });
  return data;
};

const getMonthFromDate = (dateString: string): MonthKey => {
  const date = new Date(dateString);
  const monthIndex = date.getMonth();
  return MONTHS[monthIndex].key;
};

export const useFinanceData = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [yearData, setYearData] = useState<YearData>(createInitialYearData());
  const [availableYears, setAvailableYears] = useState<number[]>([currentYear]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch data from database
  const fetchData = useCallback(async () => {
    if (!user) {
      setYearData(createInitialYearData());
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [entriesRes, adExpensesRes, structureCostsRes] = await Promise.all([
        supabase.from('entries').select('*').eq('user_id', user.id).eq('year', selectedYear),
        supabase.from('ad_expenses').select('*').eq('user_id', user.id).eq('year', selectedYear),
        supabase.from('structure_costs').select('*').eq('user_id', user.id).eq('year', selectedYear),
      ]);

      if (entriesRes.error) throw entriesRes.error;
      if (adExpensesRes.error) throw adExpensesRes.error;
      if (structureCostsRes.error) throw structureCostsRes.error;

      const newYearData = createInitialYearData();

      // Organize entries by month
      entriesRes.data?.forEach((entry) => {
        const month = getMonthFromDate(entry.date);
        newYearData[month].entries.push({
          id: entry.id,
          date: entry.date,
          value: Number(entry.value),
          origin: entry.origin,
          observation: entry.observation || undefined,
        });
      });

      // Organize ad expenses by month
      adExpensesRes.data?.forEach((expense) => {
        const month = getMonthFromDate(expense.date);
        newYearData[month].adExpenses.push({
          id: expense.id,
          date: expense.date,
          platform: expense.platform as AdExpense['platform'],
          value: Number(expense.value),
          clientsServed: expense.clients_served || 0,
          observation: expense.observation || undefined,
        });
      });

      // Organize structure costs by month
      structureCostsRes.data?.forEach((cost) => {
        const month = getMonthFromDate(cost.date);
        newYearData[month].structureCosts.push({
          id: cost.id,
          date: cost.date,
          category: cost.category as StructureCost['category'],
          value: Number(cost.value),
          isRecurring: cost.is_recurring,
          observation: cost.observation || undefined,
        });
      });

      setYearData(newYearData);

      // Fetch available years
      const yearsRes = await supabase
        .from('entries')
        .select('year')
        .eq('user_id', user.id);
      
      const adYearsRes = await supabase
        .from('ad_expenses')
        .select('year')
        .eq('user_id', user.id);
      
      const structureYearsRes = await supabase
        .from('structure_costs')
        .select('year')
        .eq('user_id', user.id);

      const allYears = new Set<number>([currentYear]);
      yearsRes.data?.forEach(r => allYears.add(r.year));
      adYearsRes.data?.forEach(r => allYears.add(r.year));
      structureYearsRes.data?.forEach(r => allYears.add(r.year));
      
      setAvailableYears(Array.from(allYears).sort((a, b) => b - a));

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, selectedYear, currentYear, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Entry operations
  const addEntry = useCallback(async (month: MonthKey, entry: Omit<Entry, 'id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('entries')
        .insert({
          user_id: user.id,
          date: entry.date,
          value: entry.value,
          origin: entry.origin,
          observation: entry.observation || null,
          year: selectedYear,
        })
        .select()
        .single();

      if (error) throw error;

      setYearData(prev => ({
        ...prev,
        [month]: {
          ...prev[month],
          entries: [...prev[month].entries, {
            id: data.id,
            date: data.date,
            value: Number(data.value),
            origin: data.origin,
            observation: data.observation || undefined,
          }],
        },
      }));

      toast({
        title: 'Sucesso',
        description: 'Entrada adicionada com sucesso!',
      });
    } catch (error) {
      console.error('Error adding entry:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar a entrada.',
        variant: 'destructive',
      });
    }
  }, [user, selectedYear, toast]);

  const removeEntry = useCallback(async (month: MonthKey, id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('entries')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setYearData(prev => ({
        ...prev,
        [month]: {
          ...prev[month],
          entries: prev[month].entries.filter(e => e.id !== id),
        },
      }));

      toast({
        title: 'Sucesso',
        description: 'Entrada removida com sucesso!',
      });
    } catch (error) {
      console.error('Error removing entry:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover a entrada.',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  // Ad expense operations
  const addAdExpense = useCallback(async (month: MonthKey, expense: Omit<AdExpense, 'id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('ad_expenses')
        .insert({
          user_id: user.id,
          date: expense.date,
          platform: expense.platform,
          value: expense.value,
          clients_served: expense.clientsServed || 0,
          observation: expense.observation || null,
          year: selectedYear,
        })
        .select()
        .single();

      if (error) throw error;

      setYearData(prev => ({
        ...prev,
        [month]: {
          ...prev[month],
          adExpenses: [...prev[month].adExpenses, {
            id: data.id,
            date: data.date,
            platform: data.platform,
            value: Number(data.value),
            clientsServed: data.clients_served || 0,
            observation: data.observation || undefined,
          }],
        },
      }));

      toast({
        title: 'Sucesso',
        description: 'Gasto com Ads adicionado com sucesso!',
      });
    } catch (error) {
      console.error('Error adding ad expense:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o gasto com Ads.',
        variant: 'destructive',
      });
    }
  }, [user, selectedYear, toast]);

  const removeAdExpense = useCallback(async (month: MonthKey, id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('ad_expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setYearData(prev => ({
        ...prev,
        [month]: {
          ...prev[month],
          adExpenses: prev[month].adExpenses.filter(e => e.id !== id),
        },
      }));

      toast({
        title: 'Sucesso',
        description: 'Gasto com Ads removido com sucesso!',
      });
    } catch (error) {
      console.error('Error removing ad expense:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o gasto com Ads.',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  // Structure cost operations
  const addStructureCost = useCallback(async (month: MonthKey, cost: Omit<StructureCost, 'id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('structure_costs')
        .insert({
          user_id: user.id,
          date: cost.date,
          category: cost.category,
          value: cost.value,
          is_recurring: cost.isRecurring,
          observation: cost.observation || null,
          year: selectedYear,
        })
        .select()
        .single();

      if (error) throw error;

      setYearData(prev => ({
        ...prev,
        [month]: {
          ...prev[month],
          structureCosts: [...prev[month].structureCosts, {
            id: data.id,
            date: data.date,
            category: data.category,
            value: Number(data.value),
            isRecurring: data.is_recurring,
            observation: data.observation || undefined,
          }],
        },
      }));

      toast({
        title: 'Sucesso',
        description: 'Custo de estrutura adicionado com sucesso!',
      });
    } catch (error) {
      console.error('Error adding structure cost:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o custo de estrutura.',
        variant: 'destructive',
      });
    }
  }, [user, selectedYear, toast]);

  const removeStructureCost = useCallback(async (month: MonthKey, id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('structure_costs')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setYearData(prev => ({
        ...prev,
        [month]: {
          ...prev[month],
          structureCosts: prev[month].structureCosts.filter(c => c.id !== id),
        },
      }));

      toast({
        title: 'Sucesso',
        description: 'Custo de estrutura removido com sucesso!',
      });
    } catch (error) {
      console.error('Error removing structure cost:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o custo de estrutura.',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  // Calculate monthly summary
  const getMonthSummary = useCallback((month: MonthKey): MonthSummary => {
    const data = yearData[month];
    const totalRevenue = data.entries.reduce((sum, e) => sum + e.value, 0);
    const totalAds = data.adExpenses.reduce((sum, e) => sum + e.value, 0);
    const totalStructure = data.structureCosts.reduce((sum, c) => sum + c.value, 0);
    const totalOperationalCost = totalAds + totalStructure;
    const grossProfit = totalRevenue - totalAds;
    const netProfit = totalRevenue - totalOperationalCost;

    return {
      totalRevenue,
      totalAds,
      totalStructure,
      totalOperationalCost,
      grossProfit,
      netProfit,
      adsPercentage: totalRevenue > 0 ? (totalAds / totalRevenue) * 100 : 0,
      structurePercentage: totalRevenue > 0 ? (totalStructure / totalRevenue) * 100 : 0,
      grossProfitPercentage: totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0,
      netProfitPercentage: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0,
    };
  }, [yearData]);

  // Calculate annual summary
  const annualSummary = useMemo(() => {
    let totalRevenue = 0;
    let totalAds = 0;
    let totalStructure = 0;
    let monthsWithData = 0;

    MONTHS.forEach(m => {
      const summary = getMonthSummary(m.key);
      totalRevenue += summary.totalRevenue;
      totalAds += summary.totalAds;
      totalStructure += summary.totalStructure;
      if (summary.totalRevenue > 0) monthsWithData++;
    });

    const totalOperationalCost = totalAds + totalStructure;
    const grossProfit = totalRevenue - totalAds;
    const netProfit = totalRevenue - totalOperationalCost;
    const averageMonthlyProfit = monthsWithData > 0 ? netProfit / monthsWithData : 0;

    return {
      totalRevenue,
      totalAds,
      totalStructure,
      totalOperationalCost,
      grossProfit,
      netProfit,
      averageMonthlyProfit,
      adsPercentage: totalRevenue > 0 ? (totalAds / totalRevenue) * 100 : 0,
      structurePercentage: totalRevenue > 0 ? (totalStructure / totalRevenue) * 100 : 0,
      grossProfitPercentage: totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0,
      netProfitPercentage: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0,
    };
  }, [getMonthSummary]);

  // Get chart data
  const getChartData = useMemo(() => {
    return MONTHS.map(m => {
      const summary = getMonthSummary(m.key);
      return {
        month: m.label,
        fullName: m.fullName,
        receita: summary.totalRevenue,
        ads: summary.totalAds,
        estrutura: summary.totalStructure,
        lucro: summary.netProfit,
      };
    });
  }, [getMonthSummary]);

  return {
    yearData,
    selectedYear,
    setSelectedYear,
    availableYears,
    loading,
    addEntry,
    removeEntry,
    addAdExpense,
    removeAdExpense,
    addStructureCost,
    removeStructureCost,
    getMonthSummary,
    annualSummary,
    getChartData,
  };
};
