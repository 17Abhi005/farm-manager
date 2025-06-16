
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WeatherData {
  id: string;
  location: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  wind_speed: number;
  conditions: string;
  forecast_date: string;
  created_at: string;
}

export const useWeather = () => {
  const [weather, setWeather] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const { toast } = useToast();

  const fetchWeather = async (location: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('weather-sync', {
        body: { location }
      });

      if (error) throw error;

      // Fetch stored weather data
      const { data: weatherData, error: fetchError } = await supabase
        .from('weather_data')
        .select('*')
        .eq('location', location)
        .order('forecast_date', { ascending: true })
        .limit(7);

      if (fetchError) throw fetchError;

      setWeather(weatherData || []);
      setCurrentWeather(data.current);
      
      toast({
        title: "Success",
        description: "Weather data updated successfully",
      });
    } catch (error) {
      console.error('Error fetching weather:', error);
      toast({
        title: "Error",
        description: "Failed to fetch weather data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    weather,
    currentWeather,
    loading,
    fetchWeather
  };
};
