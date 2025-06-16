
-- Add Row Level Security (RLS) to the crop_recommendations table
ALTER TABLE public.crop_recommendations ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to view their own recommendations
CREATE POLICY "Users can view their own crop recommendations" 
  ON public.crop_recommendations 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to insert their own recommendations
CREATE POLICY "Users can create their own crop recommendations" 
  ON public.crop_recommendations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to update their own recommendations
CREATE POLICY "Users can update their own crop recommendations" 
  ON public.crop_recommendations 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy that allows users to delete their own recommendations
CREATE POLICY "Users can delete their own crop recommendations" 
  ON public.crop_recommendations 
  FOR DELETE 
  USING (auth.uid() = user_id);
