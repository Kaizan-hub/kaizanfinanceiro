import { useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { usePerformanceAnalysis } from '@/hooks/usePerformanceAnalysis';
import { YearSelector } from '@/components/YearSelector';
import { PerformanceReportPDF } from './PerformanceReportPDF';
import {
  DollarSign,
  TrendingDown,
  Users,
  Target,
  BarChart3,
  CalendarIcon,
  Loader2,
  HelpCircle,
  UserCheck,
  ReceiptText,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

interface PerformanceTabProps {
  selectedYear: number;
  availableYears: number[];
  onSelectYear: (year: number) => void;
}

const CustomTooltipChart = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#f97316', color: '#fff', borderRadius: 10,
        padding: '8px 14px', boxShadow: '0 4px 20px rgba(249,115,22,0.35)',
        fontSize: 13, fontWeight: 600,
      }}>
        <p style={{ margin: 0 }}>{format(new Date(label), 'dd/MM/yyyy')}</p>
        <p style={{ margin: 0 }}>{payload[0].value} clientes</p>
      </div>
    );
  }
  return null;
};

export const PerformanceTab = ({ selectedYear, availableYears, onSelectYear }: PerformanceTabProps) => {
  const {
    dateFilter, setDateFilter,
    customStartDate, setCustomStartDate,
    customEndDate, setCustomEndDate,
    loading, metrics, dailyClientData, getDateRange,
  } = usePerformanceAnalysis(selectedYear);

  const { start, end } = getDateRange();
  const periodLabel = dateFilter === 'today' ? 'Hoje'
    : dateFilter === 'last7days' ? 'Últimos 7 Dias'
    : `${format(start, 'dd/MM')} - ${format(end, 'dd/MM')}`;

  const [showMetaTax, setShowMetaTax] = useState(false);

  const metaTax = metrics.totalAds * 0.125;
  const grossAds = metrics.totalAds + metaTax;
  const displayAds = showMetaTax ? grossAds : metrics.totalAds;
  const displayNetProfit = showMetaTax ? metrics.totalRevenue - grossAds : metrics.netProfit;
  const costPerLead = metrics.totalClientsServed > 0 ? displayAds / metrics.totalClientsServed : 0;

  const maxClients = useMemo(() => {
    if (dailyClientData.length === 0) return 0;
    return Math.max(...dailyClientData.map(d => d.clients));
  }, [dailyClientData]);

  const bestDay = useMemo(() => {
    if (dailyClientData.length === 0) return null;
    return dailyClientData.reduce((a, b) => a.clients > b.clients ? a : b);
  }, [dailyClientData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const displayRoas = displayAds > 0 ? metrics.totalRevenue / displayAds : 0;

  const metricCards = [
    { title: 'RECEITA TOTAL', value: formatCurrency(metrics.totalRevenue), icon: <DollarSign className="w-3.5 h-3.5" />, color: '#22c55e', tooltip: 'Soma de todas as receitas no período' },
    { title: 'GASTOS COM ADS', value: formatCurrency(displayAds), icon: <TrendingDown className="w-3.5 h-3.5" />, color: '#f97316', tooltip: showMetaTax ? `Líquido: ${formatCurrency(metrics.totalAds)} + Imposto: ${formatCurrency(metaTax)}` : 'Total investido em anúncios e mídia paga', subtitle: showMetaTax ? `Imposto: ${formatCurrency(metaTax)}` : undefined },
    { title: 'ROAS', value: `${displayRoas.toFixed(2)}x`, icon: <Target className="w-3.5 h-3.5" />, color: '#a78bfa', tooltip: 'Receita ÷ Gastos com Ads' },
    { title: 'CUSTO POR LEAD', value: formatCurrency(costPerLead), icon: <UserCheck className="w-3.5 h-3.5" />, color: '#f97316', tooltip: 'Gastos com Ads ÷ Clientes Atendidos' },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Análise de Desempenho
          </h2>
          <YearSelector selectedYear={selectedYear} availableYears={availableYears} onSelectYear={onSelectYear} />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <PerformanceReportPDF metrics={metrics} dailyClientData={dailyClientData} periodLabel={periodLabel}
            startDate={start} endDate={end} qualitativeNote={{ positivePoints: '', improvements: '', rating: 0, date: '' }} />
          {(['today', 'last7days'] as const).map(f => (
            <Button key={f} variant={dateFilter === f ? 'default' : 'outline'} size="sm"
              onClick={() => setDateFilter(f)}
              className={cn('h-8 text-xs rounded-lg',
                dateFilter === f && 'bg-primary text-primary-foreground border-primary',
                dateFilter !== f && 'border-[#2a2a2a] bg-transparent text-muted-foreground hover:text-foreground'
              )}>
              {f === 'today' ? 'Hoje' : 'Últimos 7 Dias'}
            </Button>
          ))}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant={dateFilter === 'custom' ? 'default' : 'outline'} size="sm"
                className={cn('h-8 text-xs rounded-lg gap-1.5',
                  dateFilter !== 'custom' && 'border-[#2a2a2a] bg-transparent text-muted-foreground hover:text-foreground')}>
                <CalendarIcon className="w-3.5 h-3.5" />
                {dateFilter === 'custom' && customStartDate && customEndDate
                  ? `${format(customStartDate, 'dd/MM')} - ${format(customEndDate, 'dd/MM')}` : 'Personalizado'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4" align="end">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Período</Label>
                {customStartDate && (
                  <div className="text-xs text-muted-foreground bg-secondary/50 px-3 py-2 rounded-md border border-border/50">
                    {customStartDate && customEndDate
                      ? `${format(customStartDate, 'dd/MM/yyyy')} - ${format(customEndDate, 'dd/MM/yyyy')}`
                      : `${format(customStartDate, 'dd/MM/yyyy')} - Selecione a data final`}
                  </div>
                )}
                <Calendar mode="range" selected={{ from: customStartDate, to: customEndDate }}
                  onSelect={(range) => { setCustomStartDate(range?.from); setCustomEndDate(range?.to); if (range?.from) setDateFilter('custom'); }}
                  locale={ptBR} numberOfMonths={1} className="rounded-md border pointer-events-auto" />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </motion.div>

      {/* Hero — Lucro Líquido */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="relative overflow-hidden" style={{
          background: 'linear-gradient(135deg, #1a0a00, #0f0f0f)',
          border: '1px solid #f97316',
          borderRadius: 20,
          padding: '32px 40px',
          boxShadow: '0 0 60px rgba(249,115,22,0.08), inset 0 1px 0 rgba(249,115,22,0.1)',
        }}>
          {/* Glow */}
          <div className="absolute top-0 right-0 pointer-events-none" style={{
            width: 200, height: 200,
            background: 'radial-gradient(circle, rgba(249,115,22,0.12), transparent 70%)',
          }} />
          <div className="relative flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span style={{ fontSize: 11, textTransform: 'uppercase', color: '#666', letterSpacing: 2, fontWeight: 500 }}>
                  Lucro Líquido
                </span>
                <HelpCircle className="w-3 h-3" style={{ color: '#444' }} />
              </div>
              <p style={{
                fontSize: 52, fontWeight: 900, letterSpacing: -2, lineHeight: 1,
                color: displayNetProfit >= 0 ? '#22c55e' : '#ef4444',
              }}>
                {formatCurrency(displayNetProfit)}
              </p>
              <div className="flex items-center gap-3 mt-3">
                <p style={{ fontSize: 12, color: '#444' }}>{periodLabel}</p>
                <div className="flex items-center gap-2 px-3 py-1 rounded-lg" style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)' }}>
                  <ReceiptText className="w-3.5 h-3.5" style={{ color: '#f97316' }} />
                  <span style={{ fontSize: 11, color: '#f97316', fontWeight: 500 }}>Imposto Meta 12,5%</span>
                  <Switch
                    checked={showMetaTax}
                    onCheckedChange={setShowMetaTax}
                    className="scale-75"
                  />
                </div>
                {showMetaTax && (
                  <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>
                    -{formatCurrency(metaTax)}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <p style={{ fontSize: 11, textTransform: 'uppercase', color: '#444', letterSpacing: 2, marginBottom: 4 }}>Período</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#666' }}>
                {format(start, 'dd')} – {format(end, 'dd MMM yyyy', { locale: ptBR })}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {metricCards.map((card, index) => (
          <motion.div key={card.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.06 }}>
            <div className="group transition-all duration-300 hover:-translate-y-0.5" style={{
              background: '#141414', border: '1px solid #1f1f1f', borderRadius: 16,
              borderTop: `3px solid ${card.color}`, padding: '18px 20px',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = card.color; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#1f1f1f'; (e.currentTarget as HTMLDivElement).style.borderTop = `3px solid ${card.color}`; }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <span style={{ color: card.color }}>{card.icon}</span>
                  <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500, color: '#555' }}>
                    {card.title}
                  </span>
                </div>
                <div className="relative group/tip w-[15px] h-[15px] rounded-full flex items-center justify-center cursor-help"
                  style={{ border: '1px solid #333' }}>
                  <HelpCircle className="w-2.5 h-2.5" style={{ color: '#555' }} />
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover/tip:opacity-100 pointer-events-none transition-opacity z-50">
                    <div className="whitespace-nowrap px-3 py-1.5 text-xs font-medium text-white rounded-lg"
                      style={{ background: '#f97316', boxShadow: '0 4px 20px rgba(249,115,22,0.35)' }}>
                      {card.tooltip}
                    </div>
                    <div className="w-0 h-0 mx-auto" style={{ borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid #f97316' }} />
                  </div>
                </div>
              </div>
              <p style={{ fontSize: 22, fontWeight: 800, color: card.color, letterSpacing: '-0.5px', lineHeight: 1.1 }}>
                {card.value}
              </p>
              {(card as any).subtitle && (
                <p style={{ fontSize: 10, color: '#ef4444', marginTop: 4, fontWeight: 600 }}>{(card as any).subtitle}</p>
              )}
              <p style={{ fontSize: 10, color: '#333', marginTop: 4 }}>{periodLabel}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chart Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <div style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: 16, padding: 24 }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#555' }}>Volume Diário</span>
            <div className="text-right">
              <p style={{ fontSize: 32, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{metrics.totalClientsServed}</p>
              <p style={{ fontSize: 10, color: '#444' }}>total no período</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-primary" style={{ fill: 'rgba(249,115,22,0.2)' }} />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Clientes Atendidos</h3>
          </div>

          <div style={{ height: 220 }}>
            {dailyClientData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyClientData} barSize={38}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f97316" />
                      <stop offset="100%" stopColor="#fbbf24" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid horizontal={true} vertical={false} stroke="#222" />
                  <XAxis dataKey="date" tickFormatter={v => format(new Date(v), 'dd/MM')}
                    axisLine={false} tickLine={false} tick={{ fill: '#444', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#444', fontSize: 11 }} />
                  <RechartsTooltip content={<CustomTooltipChart />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                  <Bar dataKey="clients" radius={[8, 8, 0, 0]}>
                    {dailyClientData.map((entry, i) => (
                      <Cell key={i} fill={entry.clients === maxClients && maxClients > 0 ? 'url(#barGradient)' : '#1f1f1f'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center" style={{ color: '#555', fontSize: 14 }}>
                Nenhum dado disponível para o período selecionado
              </div>
            )}
          </div>

          {/* Bottom stats */}
          <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: 20, marginTop: 16 }}>
            <div className="grid grid-cols-2 gap-3">
              <div style={{ background: '#1a1a1a', borderRadius: 10, padding: '8px 16px' }}>
                <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#444', marginBottom: 4 }}>Melhor Dia</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>
                  {bestDay ? `${format(new Date(bestDay.date), 'dd/MM')} — ${bestDay.clients} clientes` : '—'}
                </p>
              </div>
              <div style={{ background: '#1a1a1a', borderRadius: 10, padding: '8px 16px' }}>
                <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#444', marginBottom: 4 }}>Custo por Lead</p>
                <p style={{ fontSize: 20, fontWeight: 800, color: '#ef4444' }}>{formatCurrency(costPerLead)}</p>
                <p style={{ fontSize: 11, color: '#333', marginTop: 2 }}>↗ Ads: {formatCurrency(displayAds)}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
