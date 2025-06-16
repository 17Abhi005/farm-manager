
-- Enable RLS on crop_analytics table if not already enabled
ALTER TABLE public.crop_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for crop_analytics table
DROP POLICY IF EXISTS "Users can view their own analytics" ON public.crop_analytics;
CREATE POLICY "Users can view their own analytics"
  ON public.crop_analytics FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own analytics" ON public.crop_analytics;
CREATE POLICY "Users can insert their own analytics"
  ON public.crop_analytics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own analytics" ON public.crop_analytics;
CREATE POLICY "Users can update their own analytics"
  ON public.crop_analytics FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own analytics" ON public.crop_analytics;
CREATE POLICY "Users can delete their own analytics"
  ON public.crop_analytics FOR DELETE
  USING (auth.uid() = user_id);

-- Also ensure RLS is enabled on crops table and create policies if missing
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own crops" ON public.crops;
CREATE POLICY "Users can view their own crops"
  ON public.crops FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own crops" ON public.crops;
CREATE POLICY "Users can insert their own crops"
  ON public.crops FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own crops" ON public.crops;
CREATE POLICY "Users can update their own crops"
  ON public.crops FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own crops" ON public.crops;
CREATE POLICY "Users can delete their own crops"
  ON public.crops FOR DELETE
  USING (auth.uid() = user_id);
