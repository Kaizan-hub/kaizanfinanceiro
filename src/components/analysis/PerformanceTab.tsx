import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { usePerformanceAnalysis, DateFilterType } from '@/hooks/usePerformanceAnalysis';
import { YearSelector } from '@/components/YearSelector';
import { StampAnimation } from './StampAnimation';
import { RecordChallengeCard } from './RecordChallengeCard';
import { PerformanceReportPDF } from './PerformanceReportPDF';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target, 
  BarChart3, 
  CalendarIcon,
  Star,
  ThumbsUp,
  Lightbulb,
  Loader2,
  Save,
  HelpCircle,
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
    getPerformanceNote,
    savePerformanceNote,
    getDateRange,
  } = usePerformanceAnalysis(selectedYear);

  // State for qualitative section
  const [selectedNoteDate, setSelectedNoteDate] = useState<Date>(new Date());
  const [positivePoints, setPositivePoints] = useState('');
  const [improvements, setImprovements] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [showStamp, setShowStamp] = useState(false);

  // Load note when date changes
  useEffect(() => {
    const dateString = format(selectedNoteDate, 'yyyy-MM-dd');
    const note = getPerformanceNote(dateString);
    setPositivePoints(note?.positivePoints || '');
    setImprovements(note?.improvementOpportunities || '');
    setRating(note?.performanceRating || 0);
  }, [selectedNoteDate, getPerformanceNote]);

  const handleSaveNote = async () => {
    setSaving(true);
    const dateString = format(selectedNoteDate, 'yyyy-MM-dd');
    await savePerformanceNote(dateString, positivePoints, improvements, rating);
    setSaving(false);
    setShowStamp(true);
    setTimeout(() => setShowStamp(false), 2000);
  };

  const { start, end } = getDateRange();
  const periodLabel = dateFilter === 'today' 
    ? 'Hoje' 
    : dateFilter === 'last7days' 
      ? 'Últimos 7 Dias'
      : `${format(start, 'dd/MM')} - ${format(end, 'dd/MM')}`;

  // Mock record data - in production, calculate from historical data
  const recordProfit = Math.max(metrics.netProfit * 1.2, 5000);
  const recordDate = 'Jan 2026';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header with Filters */}
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
            {/* PDF Export Button */}
            <PerformanceReportPDF
              metrics={metrics}
              dailyClientData={dailyClientData}
              periodLabel={periodLabel}
              startDate={start}
              endDate={end}
              qualitativeNote={{
                positivePoints: positivePoints,
                improvements: improvements,
                rating: rating,
                date: format(selectedNoteDate, 'dd/MM/yyyy'),
              }}
            />
          </div>
          
          {/* Date Filter Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={dateFilter === 'today' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDateFilter('today')}
              className="transition-all duration-200 hover:scale-105"
            >
              Hoje
            </Button>
            <Button
              variant={dateFilter === 'last7days' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDateFilter('last7days')}
              className="transition-all duration-200 hover:scale-105"
            >
              Últimos 7 Dias
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={dateFilter === 'custom' ? 'default' : 'outline'}
                  size="sm"
                  className="gap-2 transition-all duration-200 hover:scale-105"
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
                  <div className="flex items-center gap-2 text-sm">
                    <Label className="text-sm font-medium">Período de Visualização</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="w-3 h-3 text-muted-foreground/50" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Clique na data inicial e depois na data final</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  
                  {/* Display selected range */}
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
                    selected={{
                      from: customStartDate,
                      to: customEndDate,
                    }}
                    onSelect={(range) => {
                      setCustomStartDate(range?.from);
                      setCustomEndDate(range?.to);
                      if (range?.from) {
                        setDateFilter('custom');
                      }
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

        {/* Summary Cards with 3D Effects */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            {
              title: 'Receita Total',
              value: formatCurrency(metrics.totalRevenue),
              icon: <DollarSign className="w-4 h-4" />,
              color: 'success',
              tooltip: 'Soma de todas as vendas no período selecionado',
            },
            {
              title: 'Gastos com Ads',
              value: formatCurrency(metrics.totalAds),
              icon: <TrendingDown className="w-4 h-4" />,
              color: 'warning',
              tooltip: 'Total investido em anúncios no período',
            },
            {
              title: 'ROAS',
              value: metrics.roas.toFixed(2),
              icon: <Target className="w-4 h-4" />,
              color: 'chart-structure',
              tooltip: 'Retorno sobre Investimento em Ads (Receita ÷ Ads)',
              highlight: true,
            },
            {
              title: 'Lucro Líquido',
              value: formatCurrency(metrics.netProfit),
              icon: <TrendingUp className="w-4 h-4" />,
              color: metrics.netProfit >= 0 ? 'success' : 'destructive',
              tooltip: 'Receita menos todos os custos',
            },
            {
              title: 'Lucro por Lead',
              value: formatCurrency(metrics.profitPerLead),
              icon: <Users className="w-5 h-5 fill-primary text-primary" />,
              color: 'primary',
              tooltip: 'Lucro Líquido ÷ Clientes Atendidos',
              highlight: true,
              subtitle: `${metrics.totalClientsServed} clientes`,
            },
          ].map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={cn(
                "stat-card border-l-4",
                card.color === 'success' && "border-l-success",
                card.color === 'warning' && "border-l-warning",
                card.color === 'chart-structure' && "border-l-chart-structure",
                card.color === 'destructive' && "border-l-destructive",
                card.color === 'primary' && "border-l-primary",
                card.highlight && "bg-primary/5"
              )}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    {card.icon}
                    {card.title}
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="w-3 h-3 text-muted-foreground/50" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">{card.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={cn(
                    "text-2xl font-bold",
                    card.color === 'success' && "text-success",
                    card.color === 'warning' && "text-warning",
                    card.color === 'chart-structure' && "text-chart-structure",
                    card.color === 'destructive' && "text-destructive",
                    card.color === 'primary' && "text-primary",
                  )}>
                    {card.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {card.subtitle || periodLabel}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts and Qualitative Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Volume Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="stat-card">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Users className="w-5 h-5 fill-primary/20 text-primary" />
                  Clientes Atendidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
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
                            border: '2px solid hsl(var(--border))',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
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
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="p-3 bg-secondary/50 rounded-lg border border-border/50">
                    <p className="text-sm text-muted-foreground">Clientes Atendidos</p>
                    <p className="text-xl font-bold">{metrics.totalClientsServed}</p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <p className="text-sm text-muted-foreground">Lucro por Lead</p>
                    <p className="text-xl font-bold text-primary">
                      {formatCurrency(metrics.profitPerLead)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Qualitative Section - Paper Document Style */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="stat-card paper-document relative overflow-hidden">
              {/* Stamp Animation */}
              <StampAnimation show={showStamp} date={selectedNoteDate} />
              
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold">
                    Relatório Qualitativo
                  </CardTitle>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2 transition-all hover:scale-105">
                        <CalendarIcon className="w-4 h-4" />
                        {format(selectedNoteDate, 'dd/MM/yyyy')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        mode="single"
                        selected={selectedNoteDate}
                        onSelect={(date) => date && setSelectedNoteDate(date)}
                        locale={ptBR}
                        className="rounded-md border"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Positive Points */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <ThumbsUp className="w-4 h-4 text-success" />
                    Pontos Positivos do Dia
                  </Label>
                  <Textarea
                    value={positivePoints}
                    onChange={(e) => setPositivePoints(e.target.value)}
                    placeholder="O que funcionou bem hoje?"
                    className="min-h-[80px] resize-none typewriter-text bg-card/50"
                  />
                </div>

                {/* Improvement Opportunities */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <Lightbulb className="w-4 h-4 text-warning" />
                    Oportunidades de Melhoria
                  </Label>
                  <Textarea
                    value={improvements}
                    onChange={(e) => setImprovements(e.target.value)}
                    placeholder="O que pode ser melhorado?"
                    className="min-h-[80px] resize-none typewriter-text bg-card/50"
                  />
                </div>

                {/* Performance Rating - Thermometer */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Termômetro de Performance</Label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.button
                        key={star}
                        onClick={() => setRating(star)}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-1"
                      >
                        <Star
                          className={cn(
                            "w-7 h-7 transition-colors",
                            star <= rating 
                              ? "fill-primary text-primary" 
                              : "text-muted-foreground/30"
                          )}
                        />
                      </motion.button>
                    ))}
                  </div>
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    onClick={handleSaveNote} 
                    disabled={saving}
                    className="w-full gap-2 btn-3d"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Registrar Relatório
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Record Challenge Card */}
        <RecordChallengeCard
          currentProfit={metrics.netProfit}
          recordProfit={recordProfit}
          recordDate={recordDate}
        />
      </div>
    </TooltipProvider>
  );
};
