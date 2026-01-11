import { useState } from 'react';
import { MonthKey, MONTHS } from '@/types/finance';
import { useFinanceData } from '@/hooks/useFinanceData';
import { useProfitGoals } from '@/hooks/useProfitGoals';
import { useAuth } from '@/contexts/AuthContext';
import { MonthSelector } from '@/components/MonthSelector';
import { YearSelector } from '@/components/YearSelector';
import { SummaryCard } from '@/components/SummaryCard';
import { TransactionForm } from '@/components/TransactionForm';
import { TransactionList } from '@/components/TransactionList';
import { MonthlyBarChart, MonthlyPieChart, AnnualRevenueChart, AnnualProfitChart, AnnualComparisonChart } from '@/components/Charts';
import { ProductivityTab } from '@/components/productivity/ProductivityTab';
import { MonthlyGoalBar } from '@/components/goals/MonthlyGoalBar';
import { AnnualGoalBar } from '@/components/goals/AnnualGoalBar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingUp, TrendingDown, PieChart, BarChart3, Calendar, Target, Wallet, LayoutDashboard, LogOut, Loader2, Clock } from 'lucide-react';
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};
const Index = () => {
  const [selectedMonth, setSelectedMonth] = useState<MonthKey>(() => {
    const currentMonth = new Date().getMonth();
    return MONTHS[currentMonth].key;
  });
  const { signOut } = useAuth();
  const {
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
    getChartData
  } = useFinanceData();

  const {
    getAdjustedGoals,
    annualProgress,
    updateMonthlyGoal,
    updateAnnualGoal,
  } = useProfitGoals(selectedYear, getMonthSummary);

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  const monthSummary = getMonthSummary(selectedMonth);
  const monthData = yearData[selectedMonth];
  const currentMonthName = MONTHS.find(m => m.key === selectedMonth)?.fullName || '';
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">X1 Finance</h1>
                <p className="text-sm text-muted-foreground">Gestão Financeira</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TransactionForm month={selectedMonth} onAddEntry={entry => addEntry(selectedMonth, entry)} onAddAdExpense={expense => addAdExpense(selectedMonth, expense)} onAddStructureCost={cost => addStructureCost(selectedMonth, cost)} />
              <Button variant="outline" size="icon" onClick={handleSignOut} title="Sair">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        {/* Main Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="bg-secondary/50 p-1">
            <TabsTrigger value="dashboard" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard Anual
            </TabsTrigger>
            <TabsTrigger value="monthly" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Calendar className="w-4 h-4" />
              Visão Mensal
            </TabsTrigger>
            <TabsTrigger value="productivity" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Clock className="w-4 h-4" />
              Ponto & Produtividade
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Anual */}
          <TabsContent value="dashboard" className="space-y-6 animate-fade-in">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="section-title flex items-center gap-2 mb-0">
                  <Target className="w-5 h-5 text-primary" />
                  Resumo Anual {selectedYear}
                </h2>
                <YearSelector selectedYear={selectedYear} availableYears={availableYears} onSelectYear={setSelectedYear} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <SummaryCard title="Receita Total" value={annualSummary.totalRevenue} icon={<DollarSign className="w-5 h-5" />} variant="default" delay={0} />
                <SummaryCard title="Gastos com Ads" value={annualSummary.totalAds} percentage={annualSummary.adsPercentage} icon={<TrendingDown className="w-5 h-5" />} variant="warning" delay={100} />
                <SummaryCard title="Custos de Estrutura" value={annualSummary.totalStructure} percentage={annualSummary.structurePercentage} icon={<PieChart className="w-5 h-5" />} variant="default" delay={200} />
                <SummaryCard title="Lucro Bruto" value={annualSummary.grossProfit} percentage={annualSummary.grossProfitPercentage} icon={<BarChart3 className="w-5 h-5" />} variant="success" delay={300} />
                <SummaryCard title="Lucro Líquido" value={annualSummary.netProfit} percentage={annualSummary.netProfitPercentage} icon={<TrendingUp className="w-5 h-5" />} variant="success" delay={400} />
                <SummaryCard title="Média Mensal de Lucro" value={annualSummary.averageMonthlyProfit} icon={<Calendar className="w-5 h-5" />} variant="success" delay={500} />
              </div>
            </div>

            {/* Annual Goal Progress Bar */}
            <AnnualGoalBar
              totalNetProfit={annualProgress.totalNetProfit}
              annualGoal={annualProgress.annualGoal}
              remaining={annualProgress.remaining}
              exceeded={annualProgress.exceeded}
              percentage={annualProgress.percentage}
              isAchieved={annualProgress.isAchieved}
              onUpdateGoal={updateAnnualGoal}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="stat-card">
                <h3 className="text-lg font-semibold mb-4">Evolução da Receita</h3>
                <AnnualRevenueChart data={getChartData} />
              </div>
              <div className="stat-card">
                <h3 className="text-lg font-semibold mb-4">Receita vs Lucro Líquido</h3>
                <AnnualProfitChart data={getChartData} />
              </div>
            </div>

            <div className="stat-card">
              <h3 className="text-lg font-semibold mb-4">Comparativo Mensal</h3>
              <AnnualComparisonChart data={getChartData} />
            </div>
          </TabsContent>

          {/* Visão Mensal */}
          <TabsContent value="monthly" className="space-y-6 animate-fade-in">
            {/* Month Selector */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <h2 className="section-title flex items-center gap-2 mb-0">
                  <Calendar className="w-5 h-5 text-primary" />
                  {currentMonthName} {selectedYear}
                </h2>
                <YearSelector selectedYear={selectedYear} availableYears={availableYears} onSelectYear={setSelectedYear} />
              </div>
              <MonthSelector selectedMonth={selectedMonth} onSelectMonth={setSelectedMonth} />
            </div>

            {/* Monthly Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <SummaryCard title="Receita do Mês" value={monthSummary.totalRevenue} icon={<DollarSign className="w-5 h-5" />} variant="default" delay={0} />
              <SummaryCard title="Gastos com Ads" value={monthSummary.totalAds} percentage={monthSummary.adsPercentage} icon={<TrendingDown className="w-5 h-5" />} variant="warning" delay={100} />
              <SummaryCard title="Custos de Estrutura" value={monthSummary.totalStructure} percentage={monthSummary.structurePercentage} icon={<PieChart className="w-5 h-5" />} variant="default" delay={200} />
              <SummaryCard title="Lucro Líquido" value={monthSummary.netProfit} percentage={monthSummary.netProfitPercentage} icon={<TrendingUp className="w-5 h-5" />} variant={monthSummary.netProfit >= 0 ? 'success' : 'danger'} delay={300} />
            </div>

            {/* Monthly Goal Progress Bar */}
            {getAdjustedGoals[selectedMonth] && (
              <MonthlyGoalBar
                month={selectedMonth}
                adjustedGoal={getAdjustedGoals[selectedMonth].adjustedGoal}
                actualProfit={getAdjustedGoals[selectedMonth].actualProfit}
                remaining={getAdjustedGoals[selectedMonth].remaining}
                exceeded={getAdjustedGoals[selectedMonth].exceeded}
                percentage={getAdjustedGoals[selectedMonth].percentage}
                isAchieved={getAdjustedGoals[selectedMonth].isAchieved}
                carryOver={getAdjustedGoals[selectedMonth].carryOver}
                onUpdateGoal={updateMonthlyGoal}
                baseGoal={getAdjustedGoals[selectedMonth].baseGoal}
              />
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="stat-card">
                <h3 className="text-lg font-semibold mb-4">Visão Geral</h3>
                <MonthlyBarChart summary={monthSummary} />
              </div>
              <div className="stat-card">
                <h3 className="text-lg font-semibold mb-4">Distribuição de Gastos</h3>
                <MonthlyPieChart summary={monthSummary} />
              </div>
            </div>

            {/* Profit Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="stat-card">
                <h3 className="text-lg font-semibold mb-3">Lucro Bruto</h3>
                <p className="text-3xl font-bold text-success">
                  {formatCurrency(monthSummary.grossProfit)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Receita - Gastos com Ads
                </p>
                <div className="mt-3">
                  <span className="percentage-positive">
                    <TrendingUp className="w-3 h-3" />
                    {monthSummary.grossProfitPercentage.toFixed(1)}%
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">margem bruta</span>
                </div>
              </div>
              <div className="stat-card">
                <h3 className="text-lg font-semibold mb-3">Custo Operacional</h3>
                <p className="text-3xl font-bold text-warning">
                  {formatCurrency(monthSummary.totalOperationalCost)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Ads + Estrutura
                </p>
                <div className="mt-3">
                  <span className="percentage-neutral">
                    {(monthSummary.adsPercentage + monthSummary.structurePercentage).toFixed(1)}%
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">da receita</span>
                </div>
              </div>
            </div>

            {/* Transaction List */}
            <div className="stat-card">
              <h3 className="text-lg font-semibold mb-4">Transações de {currentMonthName}</h3>
              <TransactionList entries={monthData.entries} adExpenses={monthData.adExpenses} structureCosts={monthData.structureCosts} onRemoveEntry={id => removeEntry(selectedMonth, id)} onRemoveAdExpense={id => removeAdExpense(selectedMonth, id)} onRemoveStructureCost={id => removeStructureCost(selectedMonth, id)} />
            </div>
          </TabsContent>

          {/* Ponto & Produtividade */}
          <TabsContent value="productivity" className="animate-fade-in">
            <ProductivityTab />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-12">
        <div className="container text-center text-sm text-muted-foreground">
          <p>X1 Finance • Gestão Financeira para Vendas X1 via WhatsApp</p>
        </div>
      </footer>
    </div>;
};
export default Index;