
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fix the analytics function to run with SECURITY DEFINER
    const { error } = await supabase.rpc('exec', {
      query: `
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
          WHERE user_id = NEW.user_id;
          
          -- Get status counts
          SELECT COALESCE(json_object_agg(COALESCE(status, 'unknown'), status_count), '{}')
          INTO status_counts
          FROM (
            SELECT status, COUNT(*) as status_count
            FROM public.crops 
            WHERE user_id = NEW.user_id
            GROUP BY status
          ) status_data;
          
          -- Get monthly planting counts
          SELECT COALESCE(json_object_agg(month_key, month_count), '{}')
          INTO monthly_counts
          FROM (
            SELECT TO_CHAR(planting_date, 'YYYY-MM') as month_key, COUNT(*) as month_count
            FROM public.crops 
            WHERE user_id = NEW.user_id AND planting_date IS NOT NULL
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
            NEW.user_id,
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
            
          RETURN NEW;
        END;
        $function$
      `
    });

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
