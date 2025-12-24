import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  Area,
  AreaChart,
} from 'recharts';
import { MonthSummary } from '@/types/finance';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
};

const formatFullCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const COLORS = {
  revenue: 'hsl(173, 58%, 45%)',
  ads: 'hsl(38, 92%, 50%)',
  structure: 'hsl(262, 52%, 55%)',
  profit: 'hsl(142, 70%, 45%)',
};

interface MonthlyChartsProps {
  summary: MonthSummary;
}

export const MonthlyBarChart = ({ summary }: MonthlyChartsProps) => {
  const data = [
    { name: 'Receita', value: summary.totalRevenue, color: COLORS.revenue },
    { name: 'Ads', value: summary.totalAds, color: COLORS.ads },
    { name: 'Estrutura', value: summary.totalStructure, color: COLORS.structure },
    { name: 'Lucro Líq.', value: summary.netProfit, color: COLORS.profit },
  ];

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="name" 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          />
          <YAxis 
            tickFormatter={formatCurrency}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: number) => formatFullCurrency(value)}
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const MonthlyPieChart = ({ summary }: MonthlyChartsProps) => {
  const data = [
    { name: 'Ads', value: summary.totalAds, color: COLORS.ads },
    { name: 'Estrutura', value: summary.totalStructure, color: COLORS.structure },
    { name: 'Lucro Líquido', value: Math.max(0, summary.netProfit), color: COLORS.profit },
  ].filter(d => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center">
        <p className="text-muted-foreground">Sem dados para exibir</p>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => formatFullCurrency(value)}
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

interface AnnualChartsProps {
  data: {
    month: string;
    fullName: string;
    receita: number;
    ads: number;
    estrutura: number;
    lucro: number;
  }[];
}

export const AnnualRevenueChart = ({ data }: AnnualChartsProps) => {
  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.revenue} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={COLORS.revenue} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="month" 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          />
          <YAxis 
            tickFormatter={formatCurrency}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: number) => formatFullCurrency(value)}
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            labelFormatter={(label) => data.find(d => d.month === label)?.fullName || label}
          />
          <Area
            type="monotone"
            dataKey="receita"
            stroke={COLORS.revenue}
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorReceita)"
            name="Receita"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const AnnualProfitChart = ({ data }: AnnualChartsProps) => {
  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="month" 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          />
          <YAxis 
            tickFormatter={formatCurrency}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: number) => formatFullCurrency(value)}
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            labelFormatter={(label) => data.find(d => d.month === label)?.fullName || label}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="receita"
            stroke={COLORS.revenue}
            strokeWidth={2}
            dot={{ fill: COLORS.revenue, strokeWidth: 2 }}
            name="Receita"
          />
          <Line
            type="monotone"
            dataKey="lucro"
            stroke={COLORS.profit}
            strokeWidth={2}
            dot={{ fill: COLORS.profit, strokeWidth: 2 }}
            name="Lucro Líquido"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const AnnualComparisonChart = ({ data }: AnnualChartsProps) => {
  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="month" 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          />
          <YAxis 
            tickFormatter={formatCurrency}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: number) => formatFullCurrency(value)}
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            labelFormatter={(label) => data.find(d => d.month === label)?.fullName || label}
          />
          <Legend />
          <Bar dataKey="ads" fill={COLORS.ads} name="Ads" radius={[4, 4, 0, 0]} />
          <Bar dataKey="estrutura" fill={COLORS.structure} name="Estrutura" radius={[4, 4, 0, 0]} />
          <Bar dataKey="lucro" fill={COLORS.profit} name="Lucro Líquido" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
