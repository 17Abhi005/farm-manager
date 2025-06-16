
-- Fix the analytics function to run with SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.update_crop_analytics()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  crop_count INTEGER;
  total_area_val NUMERIC;
  status_counts JSONB;
  monthly_counts JSONB;
BEGIN
  -- Get basic counts
  SELECT COUNT(*), COALESCE(SUM(area_planted), 0)
  INTO crop_count, total_area_val
  FROM public.crops 
  WHERE user_id = COALESCE(NEW.user_id, OLD.user_id);
  
  -- Get status counts
  SELECT COALESCE(json_object_agg(COALESCE(status, 'unknown'), status_count), '{}')
  INTO status_counts
  FROM (
    SELECT status, COUNT(*) as status_count
    FROM public.crops 
    WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
    GROUP BY status
  ) status_data;
  
  -- Get monthly planting counts
  SELECT COALESCE(json_object_agg(month_key, month_count), '{}')
  INTO monthly_counts
  FROM (
    SELECT TO_CHAR(planting_date, 'YYYY-MM') as month_key, COUNT(*) as month_count
    FROM public.crops 
    WHERE user_id = COALESCE(NEW.user_id, OLD.user_id) AND planting_date IS NOT NULL
    GROUP BY TO_CHAR(planting_date, 'YYYY-MM')
  ) monthly_data;

  -- Insert or update analytics
  INSERT INTO public.crop_analytics (
    user_id,
    total_crops,
    total_area,
    crops_by_status,
    monthly_plantings
  )
  VALUES (
    COALESCE(NEW.user_id, OLD.user_id),
    crop_count,
    total_area_val,
    status_counts,
    monthly_counts
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    total_crops = EXCLUDED.total_crops,
    total_area = EXCLUDED.total_area,
    crops_by_status = EXCLUDED.crops_by_status,
    monthly_plantings = EXCLUDED.monthly_plantings,
    updated_at = now();
    
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Recreate the trigger to ensure it's properly linked
DROP TRIGGER IF EXISTS update_crop_analytics_trigger ON public.crops;
CREATE TRIGGER update_crop_analytics_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.crops
  FOR EACH ROW
  EXECUTE FUNCTION public.update_crop_analytics();
