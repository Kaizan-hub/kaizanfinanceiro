-- Create table for monthly profit goals
CREATE TABLE public.profit_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  year INTEGER NOT NULL,
  month TEXT NOT NULL,
  target_value NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, year, month)
);

-- Create table for annual goals
CREATE TABLE public.annual_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  year INTEGER NOT NULL,
  target_value NUMERIC NOT NULL DEFAULT 100000,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, year)
);

-- Enable RLS on profit_goals
ALTER TABLE public.profit_goals ENABLE ROW LEVEL SECURITY;

-- Enable RLS on annual_goals
ALTER TABLE public.annual_goals ENABLE ROW LEVEL SECURITY;

-- RLS policies for profit_goals
CREATE POLICY "Users can view their own profit_goals"
ON public.profit_goals
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profit_goals"
ON public.profit_goals
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profit_goals"
ON public.profit_goals
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profit_goals"
ON public.profit_goals
FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for annual_goals
CREATE POLICY "Users can view their own annual_goals"
ON public.annual_goals
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own annual_goals"
ON public.annual_goals
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own annual_goals"
ON public.annual_goals
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own annual_goals"
ON public.annual_goals
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at on profit_goals
CREATE TRIGGER update_profit_goals_updated_at
BEFORE UPDATE ON public.profit_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_time_records_updated_at();

-- Trigger for updated_at on annual_goals
CREATE TRIGGER update_annual_goals_updated_at
BEFORE UPDATE ON public.annual_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_time_records_updated_at();