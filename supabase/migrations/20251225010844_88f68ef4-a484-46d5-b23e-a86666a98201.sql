-- Tabela de entradas de capital (receitas)
CREATE TABLE public.entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date TEXT NOT NULL,
  value NUMERIC NOT NULL,
  origin TEXT NOT NULL DEFAULT 'Venda X1 - WhatsApp',
  observation TEXT,
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de gastos com anúncios
CREATE TABLE public.ad_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date TEXT NOT NULL,
  platform TEXT NOT NULL,
  value NUMERIC NOT NULL,
  observation TEXT,
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de custos de estrutura
CREATE TABLE public.structure_costs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date TEXT NOT NULL,
  category TEXT NOT NULL,
  value NUMERIC NOT NULL,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  observation TEXT,
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.structure_costs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para entries
CREATE POLICY "Users can view their own entries"
ON public.entries FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own entries"
ON public.entries FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own entries"
ON public.entries FOR DELETE
USING (auth.uid() = user_id);

-- Políticas RLS para ad_expenses
CREATE POLICY "Users can view their own ad_expenses"
ON public.ad_expenses FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own ad_expenses"
ON public.ad_expenses FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ad_expenses"
ON public.ad_expenses FOR DELETE
USING (auth.uid() = user_id);

-- Políticas RLS para structure_costs
CREATE POLICY "Users can view their own structure_costs"
ON public.structure_costs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own structure_costs"
ON public.structure_costs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own structure_costs"
ON public.structure_costs FOR DELETE
USING (auth.uid() = user_id);