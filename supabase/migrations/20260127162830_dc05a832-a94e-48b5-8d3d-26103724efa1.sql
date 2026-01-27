-- Add clients_served column to ad_expenses table
ALTER TABLE public.ad_expenses 
ADD COLUMN clients_served integer DEFAULT 0;

-- Create table for daily performance notes
CREATE TABLE public.daily_performance_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  date text NOT NULL,
  year integer NOT NULL,
  positive_points text,
  improvement_opportunities text,
  performance_rating integer CHECK (performance_rating >= 1 AND performance_rating <= 5),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.daily_performance_notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own daily_performance_notes" 
ON public.daily_performance_notes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own daily_performance_notes" 
ON public.daily_performance_notes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily_performance_notes" 
ON public.daily_performance_notes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily_performance_notes" 
ON public.daily_performance_notes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_daily_performance_notes_updated_at
BEFORE UPDATE ON public.daily_performance_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_time_records_updated_at();