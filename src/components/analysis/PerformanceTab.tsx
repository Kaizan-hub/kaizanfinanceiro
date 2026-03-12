import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { usePerformanceAnalysis } from '@/hooks/usePerformanceAnalysis';
import { YearSelector } from '@/components/YearSelector';
import { PerformanceReportPDF } from './PerformanceReportPDF';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  BarChart3,
  CalendarIcon,
  Loader2,
  HelpCircle,
  UserCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

interface PerformanceTabProps {
  selectedYear: number;
  availableYears: number[];
  onSelectYear: (year: number) => void;
}

export const PerformanceTab = ({ selectedYear, availableYears, onSelectYear }: PerformanceTabProps) => {
  const {
    dateFilter,
    setDateFilter,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    loading,
    metrics,
    dailyClientData,
    getDateRange,
  } = usePerformanceAnalysis(selectedYear);

  const { start, end } = getDateRange();
  const periodLabel = dateFilter === 'today'
    ? 'Hoje'
    : dateFilter === 'last7days'
      ? 'Últimos 7 Dias'
      : `${format(start, 'dd/MM')} - ${format(end, 'dd/MM')}`;

  const costPerLead = metrics.totalClientsServed > 0
    ? metrics.totalAds / metrics.totalClientsServed
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const metricCards = [
    {
      title: 'Receita Total',
      value: formatCurrency(metrics.totalRevenue),
      icon: <DollarSign className="w-4 h-4" />,
      borderColor: 'bg-success',
      valueColor: 'text-success',
      tooltip: 'Soma de todas as vendas no período selecionado',
    },
    {
      title: 'Gastos com Ads',
      value: formatCurrency(metrics.totalAds),
      icon: <TrendingDown className="w-4 h-4" />,
      borderColor: 'bg-warning',
      valueColor: 'text-warning',
      tooltip: 'Total investido em anúncios no período',
    },
    {
      title: 'ROAS',
      value: metrics.roas.toFixed(2),
      icon: <Target className="w-4 h-4" />,
      borderColor: 'bg-chart-structure',
      valueColor: 'text-chart-structure',
      tooltip: 'Retorno sobre Investimento em Ads (Receita ÷ Ads)',
    },
    {
      title: 'Lucro Líquido',
      value: formatCurrency(metrics.netProfit),
      icon: <TrendingUp className="w-4 h-4" />,
      borderColor: metrics.netProfit >= 0 ? 'bg-success' : 'bg-destructive',
      valueColor: metrics.netProfit >= 0 ? 'text-success' : 'text-destructive',
      tooltip: 'Receita menos todos os custos (Receita − Ads)',
    },
    {
      title: 'Custo por Lead',
      value: formatCurrency(costPerLead),
      icon: <UserCheck className="w-4 h-4 text-primary fill-primary/20" />,
      borderColor: 'bg-primary',
      valueColor: 'text-primary',
      tooltip: 'Gastos com Ads ÷ Clientes Atendidos',
    },
  ];

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="section-title flex items-center gap-2 mb-0">
              <BarChart3 className="w-5 h-5 text-primary" />
              Análise de Desempenho
            </h2>
            <YearSelector
              selectedYear={selectedYear}
              availableYears={availableYears}
              onSelectYear={onSelectYear}
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={dateFilter === 'today' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDateFilter('today')}
            >
              Hoje
            </Button>
            <Button
              variant={dateFilter === 'last7days' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDateFilter('last7days')}
            >
              Últimos 7 Dias
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={dateFilter === 'custom' ? 'default' : 'outline'}
                  size="sm"
                  className="gap-2"
                >
                  <CalendarIcon className="w-4 h-4" />
                  {dateFilter === 'custom' && customStartDate && customEndDate
                    ? `${format(customStartDate, 'dd/MM')} - ${format(customEndDate, 'dd/MM')}`
                    : 'Personalizado'
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4" align="end">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Período</Label>
                  {customStartDate && (
                    <div className="text-xs text-muted-foreground bg-secondary/50 px-3 py-2 rounded-md border border-border/50">
                      {customStartDate && customEndDate
                        ? `${format(customStartDate, 'dd/MM/yyyy')} - ${format(customEndDate, 'dd/MM/yyyy')}`
                        : `${format(customStartDate, 'dd/MM/yyyy')} - Selecione a data final`
                      }
                    </div>
                  )}
                  <Calendar
                    mode="range"
                    selected={{ from: customStartDate, to: customEndDate }}
                    onSelect={(range) => {
                      setCustomStartDate(range?.from);
                      setCustomEndDate(range?.to);
                      if (range?.from) setDateFilter('custom');
                    }}
                    locale={ptBR}
                    numberOfMonths={1}
                    className="rounded-md border pointer-events-auto"
                  />
                </div>
              </PopoverContent>
            </Popover>

            <PerformanceReportPDF
              metrics={metrics}
              dailyClientData={dailyClientData}
              periodLabel={periodLabel}
              startDate={start}
              endDate={end}
              qualitativeNote={{ positivePoints: '', improvements: '', rating: 0, date: '' }}
            />
          </div>
        </motion.div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {metricCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <Card className="bg-card border border-border/60 shadow-none overflow-hidden">
                <div className={cn('h-1 w-full', card.borderColor)} />
                <CardHeader className="pb-1 pt-4 px-5">
                  <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    {card.icon}
                    {card.title}
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="w-3 h-3 text-muted-foreground/40" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">{card.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-4">
                  <p className={cn('text-[22px] font-bold leading-tight', card.valueColor)}>
                    {card.value}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">{periodLabel}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Chart — full width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-card border border-border/60 shadow-none">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-primary fill-primary/20" />
                Clientes Atendidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                {dailyClientData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyClientData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) => format(new Date(value), 'dd/MM')}
                        className="text-xs"
                      />
                      <YAxis className="text-xs" />
                      <RechartsTooltip
                        labelFormatter={(value) => format(new Date(value), 'dd/MM/yyyy')}
                        formatter={(value: number) => [value, 'Clientes']}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar
                        dataKey="clients"
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    Nenhum dado disponível para o período selecionado
                  </div>
                )}
              </div>

              {/* Mini summary cards */}
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="p-3 bg-secondary/50 rounded-lg border border-border/50">
                  <p className="text-xs text-muted-foreground">Clientes Atendidos</p>
                  <p className="text-xl font-bold text-foreground">{metrics.totalClientsServed}</p>
                </div>
                <div className="p-3 bg-secondary/50 rounded-lg border border-border/50">
                  <p className="text-xs text-muted-foreground">Lucro por Lead</p>
                  <p className={cn(
                    'text-xl font-bold',
                    metrics.profitPerLead >= 0 ? 'text-success' : 'text-destructive'
                  )}>
                    {formatCurrency(metrics.profitPerLead)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </TooltipProvider>
  );
};
