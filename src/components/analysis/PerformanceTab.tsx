import { useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
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
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';

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

const CustomTooltipChart = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: '#f97316',
          color: '#fff',
          borderRadius: 10,
          padding: '8px 14px',
          boxShadow: '0 4px 20px rgba(249,115,22,0.35)',
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        <p style={{ margin: 0 }}>{format(new Date(label), 'dd/MM/yyyy')}</p>
        <p style={{ margin: 0 }}>{payload[0].value} clientes</p>
      </div>
    );
  }
  return null;
};

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

  // Find the max value day for highlight
  const maxClients = useMemo(() => {
    if (dailyClientData.length === 0) return 0;
    return Math.max(...dailyClientData.map(d => d.clients));
  }, [dailyClientData]);

  // Best day info
  const bestDay = useMemo(() => {
    if (dailyClientData.length === 0) return null;
    const best = dailyClientData.reduce((a, b) => a.clients > b.clients ? a : b);
    return best;
  }, [dailyClientData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const metricCards = [
    {
      title: 'RECEITA TOTAL',
      value: formatCurrency(metrics.totalRevenue),
      icon: <DollarSign className="w-3.5 h-3.5" />,
      color: '#22c55e',
      tooltip: 'Soma de todas as receitas no período',
    },
    {
      title: 'GASTOS COM ADS',
      value: formatCurrency(metrics.totalAds),
      icon: <TrendingDown className="w-3.5 h-3.5" />,
      color: '#f97316',
      tooltip: 'Total investido em anúncios e mídia paga',
    },
    {
      title: 'ROAS',
      value: `${metrics.roas.toFixed(2)}x`,
      icon: <Target className="w-3.5 h-3.5" />,
      color: '#a78bfa',
      tooltip: 'Receita ÷ Gastos com Ads',
    },
    {
      title: 'LUCRO LÍQUIDO',
      value: formatCurrency(metrics.netProfit),
      icon: <TrendingUp className="w-3.5 h-3.5" />,
      color: '#ef4444',
      dynamicColor: true,
      tooltip: 'Receita Total menos todos os custos',
    },
    {
      title: 'CUSTO POR LEAD',
      value: formatCurrency(costPerLead),
      icon: <UserCheck className="w-3.5 h-3.5" />,
      color: '#f97316',
      tooltip: 'Gastos com Ads ÷ Clientes Atendidos',
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
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
          <PerformanceReportPDF
            metrics={metrics}
            dailyClientData={dailyClientData}
            periodLabel={periodLabel}
            startDate={start}
            endDate={end}
            qualitativeNote={{ positivePoints: '', improvements: '', rating: 0, date: '' }}
          />
          <Button
            variant={dateFilter === 'today' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDateFilter('today')}
            className={cn(
              'h-8 text-xs rounded-lg',
              dateFilter !== 'today' && 'border-[#2a2a2a] bg-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            Hoje
          </Button>
          <Button
            variant={dateFilter === 'last7days' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDateFilter('last7days')}
            className={cn(
              'h-8 text-xs rounded-lg',
              dateFilter === 'last7days' && 'bg-primary text-primary-foreground border-primary',
              dateFilter !== 'last7days' && 'border-[#2a2a2a] bg-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            Últimos 7 Dias
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={dateFilter === 'custom' ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  'h-8 text-xs rounded-lg gap-1.5',
                  dateFilter !== 'custom' && 'border-[#2a2a2a] bg-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
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
        </div>
      </motion.div>

      {/* Hero Lucro Líquido Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <div
          className="relative overflow-hidden rounded-2xl p-6 sm:p-8"
          style={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #111 100%)',
            border: `1px solid ${metrics.netProfit >= 0 ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
            boxShadow: metrics.netProfit >= 0
              ? '0 0 40px rgba(34,197,94,0.08)'
              : '0 0 40px rgba(239,68,68,0.08)',
          }}
        >
          {/* Subtle gradient overlay */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: metrics.netProfit >= 0
                ? 'radial-gradient(ellipse at top left, rgba(34,197,94,0.15), transparent 60%)'
                : 'radial-gradient(ellipse at top left, rgba(239,68,68,0.15), transparent 60%)',
            }}
          />
          <div className="relative flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">
                  Lucro Líquido
                </span>
                <HelpCircle className="w-3 h-3 text-muted-foreground/40" />
              </div>
              <p
                className="text-4xl sm:text-5xl font-extrabold tracking-tight"
                style={{ color: metrics.netProfit >= 0 ? '#22c55e' : '#ef4444' }}
              >
                {formatCurrency(metrics.netProfit)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">{periodLabel}</p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Período</p>
              <p className="text-sm font-semibold text-foreground">
                {format(start, 'dd')} – {format(end, 'dd MMM yyyy', { locale: ptBR })}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Metric Cards — 4 columns (without Lucro Líquido since it's hero) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {metricCards.filter(c => c.title !== 'LUCRO LÍQUIDO').map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.06 }}
          >
            <div
              className="rounded-[14px] p-[18px_20px] transition-shadow duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
              style={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderTop: `3px solid ${card.color}`,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <span style={{ color: card.color }}>{card.icon}</span>
                  <span className="text-[11px] uppercase tracking-wide font-medium text-muted-foreground">
                    {card.title}
                  </span>
                </div>
                <div
                  className="group relative w-[15px] h-[15px] rounded-full flex items-center justify-center cursor-help"
                  style={{ border: '1px solid #333' }}
                >
                  <HelpCircle className="w-2.5 h-2.5 text-muted-foreground/50" />
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                    <div
                      className="whitespace-nowrap px-3 py-1.5 text-xs font-medium text-white rounded-lg"
                      style={{
                        background: '#f97316',
                        boxShadow: '0 4px 20px rgba(249,115,22,0.35)',
                      }}
                    >
                      {card.tooltip}
                    </div>
                    {/* Arrow */}
                    <div
                      className="w-0 h-0 mx-auto"
                      style={{
                        borderLeft: '5px solid transparent',
                        borderRight: '5px solid transparent',
                        borderTop: '5px solid #f97316',
                      }}
                    />
                  </div>
                </div>
              </div>
              <p
                className="text-[22px] font-extrabold leading-tight"
                style={{ color: card.color, letterSpacing: '-0.5px' }}
              >
                {card.value}
              </p>
              <p className="text-[10px] mt-1" style={{ color: '#333' }}>
                {periodLabel}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chart Card — full width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div
          className="rounded-2xl p-6"
          style={{
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
          }}
        >
          {/* Chart header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-0.5">Volume Diário</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-extrabold text-foreground">{metrics.totalClientsServed}</p>
              <p className="text-[10px] text-muted-foreground">total no período</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-primary" style={{ fill: 'rgba(249,115,22,0.2)' }} />
            <h3 className="text-[15px] font-bold text-foreground">Clientes Atendidos</h3>
          </div>

          <div className="h-[220px]">
            {dailyClientData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyClientData} barSize={38}>
                  <CartesianGrid
                    horizontal={true}
                    vertical={false}
                    stroke="#222"
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => format(new Date(value), 'dd/MM')}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#444', fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#444', fontSize: 11 }}
                  />
                  <RechartsTooltip
                    content={<CustomTooltipChart />}
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  />
                  <Bar dataKey="clients" radius={[8, 8, 0, 0]}>
                    {dailyClientData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.clients === maxClients && maxClients > 0 ? '#f97316' : '#2a2a2a'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                Nenhum dado disponível para o período selecionado
              </div>
            )}
          </div>

          {/* Bottom stats */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div
              className="p-4 rounded-xl"
              style={{
                background: '#111',
                border: '1px solid #222',
              }}
            >
              <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#444' }}>
                Melhor Dia
              </p>
              <p className="text-sm font-bold text-foreground">
                {bestDay ? `${format(new Date(bestDay.date), 'dd/MM')} — ${bestDay.clients} clientes` : '—'}
              </p>
            </div>
            <div
              className="p-4 rounded-xl"
              style={{
                background: '#111',
                border: '1px solid #222',
              }}
            >
              <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#444' }}>
                Custo por Lead
              </p>
              <p
                className="text-lg font-extrabold"
                style={{ color: costPerLead > 0 ? '#ef4444' : '#22c55e' }}
              >
                {formatCurrency(costPerLead)}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: '#555' }}>
                ↗ Ads: {formatCurrency(metrics.totalAds)}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
