
-- Create a table for parcels
CREATE TABLE public.parcels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  area NUMERIC NOT NULL,
  soil_type TEXT NOT NULL,
  location TEXT,
  coordinates TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'Fallow',
  crops JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to ensure users can only see their own parcels
ALTER TABLE public.parcels ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to SELECT their own parcels
CREATE POLICY "Users can view their own parcels" 
  ON public.parcels 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to INSERT their own parcels
CREATE POLICY "Users can create their own parcels" 
  ON public.parcels 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to UPDATE their own parcels
CREATE POLICY "Users can update their own parcels" 
  ON public.parcels 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy that allows users to DELETE their own parcels
CREATE POLICY "Users can delete their own parcels" 
  ON public.parcels 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_parcels_updated_at
  BEFORE UPDATE ON public.parcels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
