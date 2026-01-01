-- Create table for time tracking records
CREATE TABLE public.time_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date TEXT NOT NULL,
  year INTEGER NOT NULL,
  entry_time TEXT,
  break_start TEXT,
  break_end TEXT,
  exit_time TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable Row Level Security
ALTER TABLE public.time_records ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own time_records" 
ON public.time_records 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own time_records" 
ON public.time_records 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own time_records" 
ON public.time_records 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own time_records" 
ON public.time_records 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_time_records_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_time_records_updated_at
BEFORE UPDATE ON public.time_records
FOR EACH ROW
EXECUTE FUNCTION public.update_time_records_updated_at();