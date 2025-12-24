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
type AllData = Record<number, YearData>;

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

const STORAGE_KEY = 'financeDataAll';

export const useFinanceData = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  
  const [allData, setAllData] = useState<AllData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    // Migrate from old format if exists
    const oldData = localStorage.getItem('financeData2024');
    if (oldData) {
      const migrated = { 2024: JSON.parse(oldData) };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      localStorage.removeItem('financeData2024');
      return migrated;
    }
    return { [currentYear]: createInitialYearData() };
  });

  const yearData = useMemo(() => {
    return allData[selectedYear] || createInitialYearData();
  }, [allData, selectedYear]);

  const saveData = useCallback((data: AllData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setAllData(data);
  }, []);

  const ensureYearExists = useCallback((year: number, data: AllData): AllData => {
    if (!data[year]) {
      return { ...data, [year]: createInitialYearData() };
    }
    return data;
  }, []);

  // Entry operations
  const addEntry = useCallback((month: MonthKey, entry: Omit<Entry, 'id'>) => {
    setAllData(prev => {
      let newData = ensureYearExists(selectedYear, prev);
      newData = {
        ...newData,
        [selectedYear]: {
          ...newData[selectedYear],
          [month]: {
            ...newData[selectedYear][month],
            entries: [...newData[selectedYear][month].entries, { ...entry, id: generateId() }],
          },
        },
      };
      saveData(newData);
      return newData;
    });
  }, [saveData, selectedYear, ensureYearExists]);

  const removeEntry = useCallback((month: MonthKey, id: string) => {
    setAllData(prev => {
      const newData = {
        ...prev,
        [selectedYear]: {
          ...prev[selectedYear],
          [month]: {
            ...prev[selectedYear][month],
            entries: prev[selectedYear][month].entries.filter(e => e.id !== id),
          },
        },
      };
      saveData(newData);
      return newData;
    });
  }, [saveData, selectedYear]);

  // Ad expense operations
  const addAdExpense = useCallback((month: MonthKey, expense: Omit<AdExpense, 'id'>) => {
    setAllData(prev => {
      let newData = ensureYearExists(selectedYear, prev);
      newData = {
        ...newData,
        [selectedYear]: {
          ...newData[selectedYear],
          [month]: {
            ...newData[selectedYear][month],
            adExpenses: [...newData[selectedYear][month].adExpenses, { ...expense, id: generateId() }],
          },
        },
      };
      saveData(newData);
      return newData;
    });
  }, [saveData, selectedYear, ensureYearExists]);

  const removeAdExpense = useCallback((month: MonthKey, id: string) => {
    setAllData(prev => {
      const newData = {
        ...prev,
        [selectedYear]: {
          ...prev[selectedYear],
          [month]: {
            ...prev[selectedYear][month],
            adExpenses: prev[selectedYear][month].adExpenses.filter(e => e.id !== id),
          },
        },
      };
      saveData(newData);
      return newData;
    });
  }, [saveData, selectedYear]);

  // Structure cost operations
  const addStructureCost = useCallback((month: MonthKey, cost: Omit<StructureCost, 'id'>) => {
    setAllData(prev => {
      let newData = ensureYearExists(selectedYear, prev);
      newData = {
        ...newData,
        [selectedYear]: {
          ...newData[selectedYear],
          [month]: {
            ...newData[selectedYear][month],
            structureCosts: [...newData[selectedYear][month].structureCosts, { ...cost, id: generateId() }],
          },
        },
      };
      saveData(newData);
      return newData;
    });
  }, [saveData, selectedYear, ensureYearExists]);

  const removeStructureCost = useCallback((month: MonthKey, id: string) => {
    setAllData(prev => {
      const newData = {
        ...prev,
        [selectedYear]: {
          ...prev[selectedYear],
          [month]: {
            ...prev[selectedYear][month],
            structureCosts: prev[selectedYear][month].structureCosts.filter(c => c.id !== id),
          },
        },
      };
      saveData(newData);
      return newData;
    });
  }, [saveData, selectedYear]);

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

  // Get available years
  const availableYears = useMemo(() => {
    const years = Object.keys(allData).map(Number).sort((a, b) => b - a);
    if (!years.includes(currentYear)) {
      years.unshift(currentYear);
      years.sort((a, b) => b - a);
    }
    return years;
  }, [allData, currentYear]);

  return {
    yearData,
    selectedYear,
    setSelectedYear,
    availableYears,
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
