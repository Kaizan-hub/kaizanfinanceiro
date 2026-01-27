import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { usePerformanceAnalysis, DateFilterType } from '@/hooks/usePerformanceAnalysis';
import { YearSelector } from '@/components/YearSelector';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
  };

  const { start, end } = getDateRange();
  const periodLabel = dateFilter === 'today' 
    ? 'Hoje' 
    : dateFilter === 'last7days' 
      ? 'Últimos 7 Dias'
      : `${format(start, 'dd/MM')} - ${format(end, 'dd/MM')}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
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
        
        {/* Date Filter Buttons */}
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
                Personalizado
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4" align="end">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Data Inicial</Label>
                  <Calendar
                    mode="single"
                    selected={customStartDate}
                    onSelect={(date) => {
                      setCustomStartDate(date);
                      setDateFilter('custom');
                    }}
                    locale={ptBR}
                    className="rounded-md border mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Data Final</Label>
                  <Calendar
                    mode="single"
                    selected={customEndDate}
                    onSelect={(date) => {
                      setCustomEndDate(date);
                      setDateFilter('custom');
                    }}
                    locale={ptBR}
                    className="rounded-md border mt-1"
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Receita Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-500">
              {formatCurrency(metrics.totalRevenue)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{periodLabel}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Gastos com Ads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-500">
              {formatCurrency(metrics.totalAds)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{periodLabel}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 bg-purple-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="w-4 h-4" />
              ROAS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-500">
              {metrics.roas.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Receita / Ads</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Lucro Líquido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={cn(
              "text-2xl font-bold",
              metrics.netProfit >= 0 ? "text-emerald-500" : "text-destructive"
            )}>
              {formatCurrency(metrics.netProfit)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{periodLabel}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 bg-emerald-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Lucro por Lead
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-500">
              {formatCurrency(metrics.profitPerLead)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.totalClientsServed} clientes atendidos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Qualitative Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volume Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
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
                    <Tooltip 
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
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="p-3 bg-secondary/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Clientes Atendidos</p>
                <p className="text-xl font-bold">{metrics.totalClientsServed}</p>
              </div>
              <div className="p-3 bg-secondary/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Lucro por Lead</p>
                <p className="text-xl font-bold text-emerald-500">
                  {formatCurrency(metrics.profitPerLead)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Qualitative Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                Relatório Qualitativo
              </CardTitle>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
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
                <ThumbsUp className="w-4 h-4 text-emerald-500" />
                Pontos Positivos do Dia
              </Label>
              <Textarea
                value={positivePoints}
                onChange={(e) => setPositivePoints(e.target.value)}
                placeholder="O que funcionou bem hoje?"
                className="min-h-[80px] resize-none"
              />
            </div>

            {/* Improvement Opportunities */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Oportunidades de Melhoria
              </Label>
              <Textarea
                value={improvements}
                onChange={(e) => setImprovements(e.target.value)}
                placeholder="O que pode ser melhorado?"
                className="min-h-[80px] resize-none"
              />
            </div>

            {/* Performance Rating */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Humor da Performance</Label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={cn(
                        "w-6 h-6 transition-colors",
                        star <= rating 
                          ? "fill-amber-400 text-amber-400" 
                          : "text-muted-foreground/30"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            <Button 
              onClick={handleSaveNote} 
              disabled={saving}
              className="w-full gap-2"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Salvar Relatório
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
