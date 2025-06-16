
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Crop {
  id: string;
  name: string;
  variety?: string;
  planting_date?: string;
  expected_harvest_date?: string;
  actual_harvest_date?: string;
  area_planted?: number;
  status: 'planned' | 'planted' | 'growing' | 'harvested';
  notes?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export const useCrops = () => {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCrops = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('crops')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type cast the data to ensure status field is properly typed
      const typedCrops = (data || []).map(crop => ({
        ...crop,
        status: crop.status as 'planned' | 'planted' | 'growing' | 'harvested'
      })) as Crop[];
      
      setCrops(typedCrops);
    } catch (error) {
      console.error('Error fetching crops:', error);
      toast({
        title: "Error",
        description: "Failed to fetch crops. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addCrop = async (cropData: Omit<Crop, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add crops.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('crops')
        .insert([{ 
          ...cropData, 
          user_id: user.id,
          planting_date: cropData.planting_date || null,
          expected_harvest_date: cropData.expected_harvest_date || null
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Type cast the returned data
      const typedCrop = {
        ...data,
        status: data.status as 'planned' | 'planted' | 'growing' | 'harvested'
      } as Crop;
      
      setCrops(prevCrops => [typedCrop, ...prevCrops]);
      toast({
        title: "Success",
        description: `${cropData.name} has been added to your crop list.`,
      });
      
      return typedCrop;
    } catch (error) {
      console.error('Error adding crop:', error);
      toast({
        title: "Error",
        description: "Failed to add crop. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateCrop = async (id: string, updates: Partial<Crop>) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to update crops.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Remove user_id from updates to prevent conflicts
      const { user_id, ...cleanUpdates } = updates as any;
      
      const { data, error } = await supabase
        .from('crops')
        .update(cleanUpdates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      if (!data) {
        throw new Error('Crop not found or you do not have permission to update it.');
      }
      
      // Type cast the returned data
      const typedCrop = {
        ...data,
        status: data.status as 'planned' | 'planted' | 'growing' | 'harvested'
      } as Crop;
      
      setCrops(prevCrops => prevCrops.map(crop => crop.id === id ? typedCrop : crop));
      toast({
        title: "Success",
        description: "Crop updated successfully",
      });
      
      return typedCrop;
    } catch (error) {
      console.error('Error updating crop:', error);
      toast({
        title: "Error",
        description: "Failed to update crop. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteCrop = async (id: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to delete crops.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('crops')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setCrops(prevCrops => prevCrops.filter(crop => crop.id !== id));
      toast({
        title: "Success",
        description: "Crop deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting crop:', error);
      toast({
        title: "Error",
        description: "Failed to delete crop. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      fetchCrops();
    } else {
      setCrops([]);
      setLoading(false);
    }
  }, [user]);

  return {
    crops,
    loading,
    addCrop,
    updateCrop,
    deleteCrop,
    refetch: fetchCrops
  };
};
