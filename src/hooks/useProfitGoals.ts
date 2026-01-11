import { useState, useCallback, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { MonthKey, MONTHS } from '@/types/finance';
import { useToast } from '@/hooks/use-toast';

interface ProfitGoal {
  id: string;
  month: MonthKey;
  target_value: number;
}

interface AnnualGoal {
  id: string;
  target_value: number;
}

// Default monthly goals for 2026 (January to July)
const DEFAULT_MONTHLY_GOALS: Record<string, number> = {
  jan: 7200,
  fev: 9800,
  mar: 11000,
  abr: 12000,
  mai: 13000,
  jun: 15000,
  jul: 19000,
};

const DEFAULT_ANNUAL_GOAL = 100000;

export const useProfitGoals = (year: number, getMonthSummary: (month: MonthKey) => { netProfit: number }) => {
  const [monthlyGoals, setMonthlyGoals] = useState<Record<MonthKey, number>>({} as Record<MonthKey, number>);
  const [annualGoal, setAnnualGoal] = useState<number>(DEFAULT_ANNUAL_GOAL);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch goals from database
  const fetchGoals = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [profitGoalsRes, annualGoalRes] = await Promise.all([
        supabase.from('profit_goals').select('*').eq('user_id', user.id).eq('year', year),
        supabase.from('annual_goals').select('*').eq('user_id', user.id).eq('year', year).single(),
      ]);

      // Set monthly goals
      const goals: Record<MonthKey, number> = {} as Record<MonthKey, number>;
      MONTHS.forEach(m => {
        const existingGoal = profitGoalsRes.data?.find(g => g.month === m.key);
        goals[m.key] = existingGoal ? Number(existingGoal.target_value) : (DEFAULT_MONTHLY_GOALS[m.key] || 0);
      });
      setMonthlyGoals(goals);

      // Set annual goal
      if (annualGoalRes.data) {
        setAnnualGoal(Number(annualGoalRes.data.target_value));
      } else {
        setAnnualGoal(DEFAULT_ANNUAL_GOAL);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  }, [user, year]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  // Update monthly goal
  const updateMonthlyGoal = useCallback(async (month: MonthKey, value: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profit_goals')
        .upsert({
          user_id: user.id,
          year,
          month,
          target_value: value,
        }, { onConflict: 'user_id,year,month' });

      if (error) throw error;

      setMonthlyGoals(prev => ({ ...prev, [month]: value }));
      toast({
        title: 'Sucesso',
        description: 'Meta atualizada com sucesso!',
      });
    } catch (error) {
      console.error('Error updating monthly goal:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a meta.',
        variant: 'destructive',
      });
    }
  }, [user, year, toast]);

  // Update annual goal
  const updateAnnualGoal = useCallback(async (value: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('annual_goals')
        .upsert({
          user_id: user.id,
          year,
          target_value: value,
        }, { onConflict: 'user_id,year' });

      if (error) throw error;

      setAnnualGoal(value);
      toast({
        title: 'Sucesso',
        description: 'Meta anual atualizada com sucesso!',
      });
    } catch (error) {
      console.error('Error updating annual goal:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a meta anual.',
        variant: 'destructive',
      });
    }
  }, [user, year, toast]);

  // Calculate adjusted goals with carry-over logic
  const getAdjustedGoals = useMemo(() => {
    const adjustedGoals: Record<MonthKey, { 
      baseGoal: number; 
      adjustedGoal: number; 
      carryOver: number;
      actualProfit: number;
      remaining: number;
      exceeded: number;
      percentage: number;
      isAchieved: boolean;
    }> = {} as any;

    let cumulativeCarryOver = 0;

    // Process months from January to December
    MONTHS.forEach((m, index) => {
      const baseGoal = monthlyGoals[m.key] || 0;
      const adjustedGoal = Math.max(0, baseGoal + cumulativeCarryOver);
      const actualProfit = getMonthSummary(m.key).netProfit;
      
      // Calculate if goal is achieved
      const difference = actualProfit - adjustedGoal;
      const isAchieved = difference >= 0;
      const remaining = isAchieved ? 0 : Math.abs(difference);
      const exceeded = isAchieved ? difference : 0;
      const percentage = adjustedGoal > 0 ? Math.min((actualProfit / adjustedGoal) * 100, 100) : (actualProfit > 0 ? 100 : 0);

      adjustedGoals[m.key] = {
        baseGoal,
        adjustedGoal,
        carryOver: cumulativeCarryOver,
        actualProfit,
        remaining,
        exceeded,
        percentage,
        isAchieved,
      };

      // Update carry-over for next month (only for months with goals)
      if (baseGoal > 0) {
        cumulativeCarryOver = -difference; // Positive if not achieved, negative if exceeded
      }
    });

    return adjustedGoals;
  }, [monthlyGoals, getMonthSummary]);

  // Calculate annual progress
  const annualProgress = useMemo(() => {
    let totalNetProfit = 0;
    MONTHS.forEach(m => {
      totalNetProfit += getMonthSummary(m.key).netProfit;
    });

    const remaining = Math.max(0, annualGoal - totalNetProfit);
    const exceeded = totalNetProfit > annualGoal ? totalNetProfit - annualGoal : 0;
    const percentage = annualGoal > 0 ? Math.min((totalNetProfit / annualGoal) * 100, 100) : 0;
    const isAchieved = totalNetProfit >= annualGoal;

    return {
      totalNetProfit,
      annualGoal,
      remaining,
      exceeded,
      percentage,
      isAchieved,
    };
  }, [annualGoal, getMonthSummary]);

  return {
    monthlyGoals,
    annualGoal,
    loading,
    updateMonthlyGoal,
    updateAnnualGoal,
    getAdjustedGoals,
    annualProgress,
  };
};
