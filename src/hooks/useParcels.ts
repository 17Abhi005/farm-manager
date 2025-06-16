
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Parcel {
  id: string;
  name: string;
  area: number;
  soil_type: string;
  location: string | null;
  coordinates: string | null;
  notes: string | null;
  crops: string[];
  status: string;
  created_at: string;
  updated_at: string;
}

export const useParcels = () => {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchParcels = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('parcels')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our interface
      const transformedData: Parcel[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        area: item.area,
        soil_type: item.soil_type,
        location: item.location,
        coordinates: item.coordinates,
        notes: item.notes,
        crops: Array.isArray(item.crops) ? item.crops as string[] : [],
        status: item.status,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));

      setParcels(transformedData);
    } catch (error) {
      console.error('Error fetching parcels:', error);
      toast({
        title: "Error",
        description: "Failed to load parcels.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addParcel = async (parcelData: {
    name: string;
    area: string;
    soil_type: string;
    location?: string;
    coordinates?: string;
    notes?: string;
  }) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('parcels')
        .insert([
          {
            user_id: user.id,
            name: parcelData.name,
            area: parseFloat(parcelData.area),
            soil_type: parcelData.soil_type,
            location: parcelData.location || null,
            coordinates: parcelData.coordinates || null,
            notes: parcelData.notes || null,
            crops: [],
            status: 'Fallow'
          }
        ])
        .select()
        .single();

      if (error) throw error;

      const transformedData: Parcel = {
        id: data.id,
        name: data.name,
        area: data.area,
        soil_type: data.soil_type,
        location: data.location,
        coordinates: data.coordinates,
        notes: data.notes,
        crops: Array.isArray(data.crops) ? data.crops as string[] : [],
        status: data.status,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      setParcels(prev => [transformedData, ...prev]);
      
      toast({
        title: "Success",
        description: `${parcelData.name} has been added to your parcel list.`,
      });

      return { success: true };
    } catch (error) {
      console.error('Error adding parcel:', error);
      toast({
        title: "Error",
        description: "Failed to add parcel.",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  const updateParcelStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('parcels')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setParcels(prev => 
        prev.map(parcel => 
          parcel.id === id ? { ...parcel, status: newStatus } : parcel
        )
      );

      toast({
        title: "Status Updated",
        description: `Parcel status has been updated to ${newStatus}.`,
      });
    } catch (error) {
      console.error('Error updating parcel status:', error);
      toast({
        title: "Error",
        description: "Failed to update parcel status.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchParcels();
  }, [user]);

  return {
    parcels,
    loading,
    addParcel,
    updateParcelStatus,
    refetch: fetchParcels
  };
};
