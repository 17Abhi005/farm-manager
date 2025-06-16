import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Verify the user token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Clearing all data for user: ${user.id}`);

    // Clear data from all tables in the correct order (respecting foreign keys)
    const tables = [
      'crop_attachments',
      'crop_recommendations', 
      'crop_analytics',
      'crops',
      'inventory',
      'transactions',
      'parcels',
      'notifications',
      'weather_data',
      'user_portfolios'
    ];

    const results = [];

    for (const table of tables) {
      try {
        const { data, error } = await supabaseAdmin
          .from(table)
          .delete()
          .eq('user_id', user.id);

        if (error) {
          console.error(`Error clearing ${table}:`, error);
          results.push({ table, error: error.message, success: false });
        } else {
          console.log(`Successfully cleared ${table}`);
          results.push({ table, success: true });
        }
      } catch (err) {
        console.error(`Exception clearing ${table}:`, err);
        results.push({ table, error: err.message, success: false });
      }
    }

    // Reset profile data but keep the profile record
    try {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({
          full_name: null,
          username: null,
          avatar_url: null,
          farm_name: null,
          phone: null,
          location: null,
          bio: null,
          preferences: '{}',
          notifications: '{}',
          privacy: '{}',
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('Error resetting profile:', profileError);
        results.push({ table: 'profiles', error: profileError.message, success: false });
      } else {
        console.log('Successfully reset profile');
        results.push({ table: 'profiles (reset)', success: true });
      }
    } catch (err) {
      console.error('Exception resetting profile:', err);
      results.push({ table: 'profiles', error: err.message, success: false });
    }

    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Data clearing completed. ${successCount} operations successful, ${errorCount} errors.`,
        results: results,
        clearedTables: tables.length + 1, // +1 for profile reset
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in clear-user-data function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to clear user data",
        details: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
