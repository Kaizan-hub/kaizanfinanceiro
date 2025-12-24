export interface Entry {
  id: string;
  date: string;
  value: number;
  origin: string;
  observation?: string;
}

export interface AdExpense {
  id: string;
  date: string;
  platform: 'Meta Ads' | 'Google Ads' | 'Outros';
  value: number;
  observation?: string;
}

export interface StructureCost {
  id: string;
  category: 'ferramentas' | 'assinaturas' | 'plataformas' | 'outros';
  date: string;
  value: number;
  isRecurring: boolean;
  observation?: string;
}

export interface MonthData {
  entries: Entry[];
  adExpenses: AdExpense[];
  structureCosts: StructureCost[];
}

export interface MonthSummary {
  totalRevenue: number;
  totalAds: number;
  totalStructure: number;
  totalOperationalCost: number;
  grossProfit: number;
  netProfit: number;
  adsPercentage: number;
  structurePercentage: number;
  grossProfitPercentage: number;
  netProfitPercentage: number;
}

export type MonthKey = 'jan' | 'fev' | 'mar' | 'abr' | 'mai' | 'jun' | 'jul' | 'ago' | 'set' | 'out' | 'nov' | 'dez';

export const MONTHS: { key: MonthKey; label: string; fullName: string }[] = [
  { key: 'jan', label: 'Jan', fullName: 'Janeiro' },
  { key: 'fev', label: 'Fev', fullName: 'Fevereiro' },
  { key: 'mar', label: 'Mar', fullName: 'Março' },
  { key: 'abr', label: 'Abr', fullName: 'Abril' },
  { key: 'mai', label: 'Mai', fullName: 'Maio' },
  { key: 'jun', label: 'Jun', fullName: 'Junho' },
  { key: 'jul', label: 'Jul', fullName: 'Julho' },
  { key: 'ago', label: 'Ago', fullName: 'Agosto' },
  { key: 'set', label: 'Set', fullName: 'Setembro' },
  { key: 'out', label: 'Out', fullName: 'Outubro' },
  { key: 'nov', label: 'Nov', fullName: 'Novembro' },
  { key: 'dez', label: 'Dez', fullName: 'Dezembro' },
];

export const PLATFORMS = ['Meta Ads', 'Google Ads', 'Outros'] as const;
export const STRUCTURE_TYPES = [
  { value: 'ferramentas', label: 'Ferramentas' },
  { value: 'assinaturas', label: 'Assinaturas' },
  { value: 'plataformas', label: 'Plataformas' },
  { value: 'outros', label: 'Outros' },
] as const;
