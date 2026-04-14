import { useState, useRef } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileDown, 
  Loader2, 
  DollarSign, 
  TrendingDown, 
  TrendingUp, 
  Users,
  Target,
  ThumbsUp,
  Lightbulb,
  Star,
  BarChart3,
  Wrench,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface PerformanceMetrics {
  totalRevenue: number;
  totalAds: number;
  totalStructure: number;
  netProfit: number;
  roas: number;
  totalClientsServed: number;
  profitPerLead: number;
}

interface DailyClientData {
  date: string;
  clients: number;
}

interface PerformanceReportPDFProps {
  metrics: PerformanceMetrics;
  dailyClientData: DailyClientData[];
  periodLabel: string;
  startDate: Date;
  endDate: Date;
  qualitativeNote?: {
    positivePoints?: string;
    improvements?: string;
    rating?: number;
    date: string;
  };
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const COLORS = {
  revenue: '#10b981',
  ads: '#f59e0b',
  structure: '#8b5cf6',
  profit: '#22c55e',
  clients: '#FF5C00',
};

export const PerformanceReportPDF = ({
  metrics,
  dailyClientData,
  periodLabel,
  startDate,
  endDate,
  qualitativeNote,
}: PerformanceReportPDFProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const pieData = [
    { name: 'Receita', value: metrics.totalRevenue, color: COLORS.revenue },
    { name: 'Gastos Ads', value: metrics.totalAds, color: COLORS.ads },
    { name: 'Custos Estrutura', value: metrics.totalStructure, color: COLORS.structure },
  ].filter(d => d.value > 0);

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    
    setGenerating(true);
    
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
      const fileName = `relatorio-performance-${format(startDate, 'dd-MM-yyyy')}-${format(endDate, 'dd-MM-yyyy')}.pdf`;
      pdf.save(fileName);
      
      setIsOpen(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button variant="outline" className="gap-2 btn-3d">
            <FileDown className="w-4 h-4" />
            Exportar Relatório PDF
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Pré-visualização do Relatório
          </DialogTitle>
        </DialogHeader>
        
        {/* PDF Content - This is what will be captured */}
        <div 
          ref={reportRef} 
          className="bg-white p-8 rounded-lg"
          style={{ 
            fontFamily: 'Arial, sans-serif',
            color: '#1a1a1a',
            minWidth: '700px',
          }}
        >
          {/* Header */}
          <div className="text-center border-b-4 border-[#FF5C00] pb-6 mb-6">
            <h1 className="text-3xl font-bold text-[#1a1a1a] mb-2" style={{ fontFamily: 'Georgia, serif' }}>
              X1 FINANCE
            </h1>
            <p className="text-lg text-gray-600">Relatório de Desempenho</p>
            <p className="text-sm text-gray-500 mt-2">
              Período: {format(startDate, "dd 'de' MMMM", { locale: ptBR })} - {format(endDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>

          {/* Key Metrics */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#1a1a1a]" style={{ fontFamily: 'Georgia, serif' }}>
              <span className="w-8 h-1 bg-[#FF5C00]"></span>
              Métricas Principais
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {/* Revenue */}
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-lg border-2 border-emerald-200">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm text-gray-600 font-medium">Receita Total</span>
                </div>
                <p className="text-xl font-bold text-emerald-700">{formatCurrency(metrics.totalRevenue)}</p>
              </div>
              
              {/* Ad Spend */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg border-2 border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-5 h-5 text-amber-600" />
                  <span className="text-sm text-gray-600 font-medium">Gastos com Ads</span>
                </div>
                <p className="text-xl font-bold text-amber-700">{formatCurrency(metrics.totalAds)}</p>
              </div>

              {/* Structure Costs */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border-2 border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Wrench className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-gray-600 font-medium">Custos Estrutura</span>
                </div>
                <p className="text-xl font-bold text-purple-700">{formatCurrency(metrics.totalStructure)}</p>
              </div>
              
              {/* Net Profit */}
              <div className={cn(
                "p-4 rounded-lg border-2",
                metrics.netProfit >= 0 
                  ? "bg-gradient-to-br from-green-50 to-green-100 border-green-200" 
                  : "bg-gradient-to-br from-red-50 to-red-100 border-red-200"
              )}>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className={cn("w-5 h-5", metrics.netProfit >= 0 ? "text-green-600" : "text-red-600")} />
                  <span className="text-sm text-gray-600 font-medium">Lucro Líquido</span>
                </div>
                <p className={cn(
                  "text-xl font-bold",
                  metrics.netProfit >= 0 ? "text-green-700" : "text-red-700"
                )}>
                  {formatCurrency(metrics.netProfit)}
                </p>
              </div>
              
              {/* Clients */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border-2 border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-[#FF5C00]" />
                  <span className="text-sm text-gray-600 font-medium">Clientes/Leads</span>
                </div>
                <p className="text-xl font-bold text-[#FF5C00]">{metrics.totalClientsServed}</p>
              </div>
            </div>
            
            {/* Additional Metrics */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-gray-600 font-medium">ROAS</span>
                </div>
                <p className="text-xl font-bold text-purple-700">{metrics.roas.toFixed(2)}x</p>
                <p className="text-xs text-gray-500 mt-1">Retorno sobre investimento em ads</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-[#FF5C00]" />
                  <span className="text-sm text-gray-600 font-medium">Lucro por Lead</span>
                </div>
                <p className="text-xl font-bold text-[#FF5C00]">{formatCurrency(metrics.profitPerLead)}</p>
                <p className="text-xs text-gray-500 mt-1">Lucro líquido por cliente atendido</p>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#1a1a1a]" style={{ fontFamily: 'Georgia, serif' }}>
              <span className="w-8 h-1 bg-[#FF5C00]"></span>
              Análise Gráfica
            </h2>
            <div className="grid grid-cols-2 gap-6">
              {/* Bar Chart - Clients per day */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Clientes Atendidos por Dia</h3>
                <div className="h-48">
                  {dailyClientData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dailyClientData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(value) => format(new Date(value), 'dd/MM')}
                          tick={{ fontSize: 10 }}
                        />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Bar dataKey="clients" fill="#FF5C00" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                      Sem dados disponíveis
                    </div>
                  )}
                </div>
              </div>
              
              {/* Pie Chart - Revenue vs Ads */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Receita vs Custos</h3>
                <div className="h-48">
                  {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={60}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                      Sem dados disponíveis
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Qualitative Report */}
          {qualitativeNote && (qualitativeNote.positivePoints || qualitativeNote.improvements) && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#1a1a1a]" style={{ fontFamily: 'Georgia, serif' }}>
                <span className="w-8 h-1 bg-[#FF5C00]"></span>
                Relatório de Performance
              </h2>
              <div className="bg-[#fffdf5] p-6 rounded-lg border-2 border-[#e5e0d5]" style={{ 
                backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #e5e0d5 28px)',
                backgroundSize: '100% 28px',
              }}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-500">
                    Data do Relatório: {qualitativeNote.date}
                  </p>
                  {qualitativeNote.rating && (
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            "w-4 h-4",
                            star <= qualitativeNote.rating! 
                              ? "fill-[#FF5C00] text-[#FF5C00]" 
                              : "text-gray-300"
                          )}
                        />
                      ))}
                    </div>
                  )}
                </div>
                
                {qualitativeNote.positivePoints && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ThumbsUp className="w-4 h-4 text-green-600" />
                      <h3 className="font-semibold text-green-700">Pontos Positivos</h3>
                    </div>
                    <p className="text-gray-700 pl-6 whitespace-pre-wrap" style={{ fontFamily: 'Georgia, serif' }}>
                      {qualitativeNote.positivePoints}
                    </p>
                  </div>
                )}
                
                {qualitativeNote.improvements && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-amber-600" />
                      <h3 className="font-semibold text-amber-700">O que deve ser melhorado</h3>
                    </div>
                    <p className="text-gray-700 pl-6 whitespace-pre-wrap" style={{ fontFamily: 'Georgia, serif' }}>
                      {qualitativeNote.improvements}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="border-t-2 border-[#FF5C00] pt-4 mt-8 text-center">
            <p className="text-sm text-gray-500">
              Relatório gerado automaticamente pelo X1 Finance
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
          </div>
        </div>

        {/* Export Button */}
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              onClick={handleExportPDF} 
              disabled={generating}
              className="gap-2 btn-3d"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Gerando PDF...
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  Baixar PDF
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
