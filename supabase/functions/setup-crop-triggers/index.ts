
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

    // Create trigger for the analytics function
    const { error: triggerError } = await supabase.rpc('exec', {
      query: `
        -- Drop existing trigger if it exists
        DROP TRIGGER IF EXISTS update_crop_analytics_trigger ON public.crops;
        
        -- Create the trigger
        CREATE TRIGGER update_crop_analytics_trigger
          AFTER INSERT OR UPDATE OR DELETE ON public.crops
          FOR EACH ROW
          EXECUTE FUNCTION public.update_crop_analytics();
          
        -- Enable RLS on crop_analytics table
        ALTER TABLE public.crop_analytics ENABLE ROW LEVEL SECURITY;
        
        -- Create RLS policies for crop_analytics
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
          
        -- Enable RLS on crops table
        ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
        
        -- Create RLS policies for crops
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
      `
    });

    if (triggerError) {
      throw triggerError;
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Crop analytics triggers and RLS policies set up successfully' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error setting up triggers:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
