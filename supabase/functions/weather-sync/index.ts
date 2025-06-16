
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
    const { location } = await req.json();
    
    const weatherApiKey = Deno.env.get('WEATHER_API_KEY');
    if (!weatherApiKey) {
      throw new Error('Weather API key not configured');
    }

    // Fetch current weather and 7-day forecast
    const [currentResponse, forecastResponse] = await Promise.all([
      fetch(`http://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${location}`),
      fetch(`http://api.weatherapi.com/v1/forecast.json?key=${weatherApiKey}&q=${location}&days=7`)
    ]);

    const currentData = await currentResponse.json();
    const forecastData = await forecastResponse.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Store current weather
    await supabase.from('weather_data').insert({
      location: location,
      temperature: currentData.current.temp_c,
      humidity: currentData.current.humidity,
      rainfall: currentData.current.precip_mm,
      wind_speed: currentData.current.wind_kph,
      conditions: currentData.current.condition.text,
      forecast_date: new Date().toISOString().split('T')[0]
    });

    // Store forecast data
    for (const day of forecastData.forecast.forecastday) {
      await supabase.from('weather_data').insert({
        location: location,
        temperature: day.day.avgtemp_c,
        humidity: day.day.avghumidity,
        rainfall: day.day.totalprecip_mm,
        wind_speed: day.day.maxwind_kph,
        conditions: day.day.condition.text,
        forecast_date: day.date
      });
    }

    return new Response(JSON.stringify({ 
      current: currentData.current,
      forecast: forecastData.forecast.forecastday 
    }), {
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
