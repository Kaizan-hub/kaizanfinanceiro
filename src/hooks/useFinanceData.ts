import { useState, useCallback, useMemo } from 'react';
import { 
  MonthData, 
  MonthKey, 
  Entry, 
  AdExpense, 
  StructureCost, 
  MonthSummary,
  MONTHS 
} from '@/types/finance';

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

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useFinanceData = () => {
  const [yearData, setYearData] = useState<YearData>(() => {
    const saved = localStorage.getItem('financeData2024');
    return saved ? JSON.parse(saved) : createInitialYearData();
  });

  const saveData = useCallback((data: YearData) => {
    localStorage.setItem('financeData2024', JSON.stringify(data));
    setYearData(data);
  }, []);

  // Entry operations
  const addEntry = useCallback((month: MonthKey, entry: Omit<Entry, 'id'>) => {
    setYearData(prev => {
      const newData = {
        ...prev,
        [month]: {
          ...prev[month],
          entries: [...prev[month].entries, { ...entry, id: generateId() }],
        },
      };
      saveData(newData);
      return newData;
    });
  }, [saveData]);

  const removeEntry = useCallback((month: MonthKey, id: string) => {
    setYearData(prev => {
      const newData = {
        ...prev,
        [month]: {
          ...prev[month],
          entries: prev[month].entries.filter(e => e.id !== id),
        },
      };
      saveData(newData);
      return newData;
    });
  }, [saveData]);

  // Ad expense operations
  const addAdExpense = useCallback((month: MonthKey, expense: Omit<AdExpense, 'id'>) => {
    setYearData(prev => {
      const newData = {
        ...prev,
        [month]: {
          ...prev[month],
          adExpenses: [...prev[month].adExpenses, { ...expense, id: generateId() }],
        },
      };
      saveData(newData);
      return newData;
    });
  }, [saveData]);

  const removeAdExpense = useCallback((month: MonthKey, id: string) => {
    setYearData(prev => {
      const newData = {
        ...prev,
        [month]: {
          ...prev[month],
          adExpenses: prev[month].adExpenses.filter(e => e.id !== id),
        },
      };
      saveData(newData);
      return newData;
    });
  }, [saveData]);

  // Structure cost operations
  const addStructureCost = useCallback((month: MonthKey, cost: Omit<StructureCost, 'id'>) => {
    setYearData(prev => {
      const newData = {
        ...prev,
        [month]: {
          ...prev[month],
          structureCosts: [...prev[month].structureCosts, { ...cost, id: generateId() }],
        },
      };
      saveData(newData);
      return newData;
    });
  }, [saveData]);

  const removeStructureCost = useCallback((month: MonthKey, id: string) => {
    setYearData(prev => {
      const newData = {
        ...prev,
        [month]: {
          ...prev[month],
          structureCosts: prev[month].structureCosts.filter(c => c.id !== id),
        },
      };
      saveData(newData);
      return newData;
    });
  }, [saveData]);

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
