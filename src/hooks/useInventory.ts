
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minThreshold: number;
  price: number;
  supplier: string | null;
  expiryDate: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
}

export const useInventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchInventory = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our interface
      const transformedData: InventoryItem[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        minThreshold: item.min_threshold,
        price: item.price || 0,
        supplier: item.supplier,
        expiryDate: item.expiry_date,
        location: item.location,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));

      setInventory(transformedData);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast({
        title: "Error",
        description: "Failed to load inventory.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (itemData: {
    name: string;
    category: string;
    quantity: string;
    unit: string;
    minThreshold: string;
    price: string;
    supplier: string;
    expiryDate: string;
    location: string;
  }) => {
    if (!user) return { success: false };

    try {
      const { data, error } = await supabase
        .from('inventory')
        .insert([
          {
            user_id: user.id,
            name: itemData.name,
            category: itemData.category,
            quantity: parseInt(itemData.quantity),
            unit: itemData.unit,
            min_threshold: parseInt(itemData.minThreshold) || 0,
            price: parseFloat(itemData.price) || 0,
            supplier: itemData.supplier || null,
            expiry_date: itemData.expiryDate || null,
            location: itemData.location || null
          }
        ])
        .select()
        .single();

      if (error) throw error;

      const transformedData: InventoryItem = {
        id: data.id,
        name: data.name,
        category: data.category,
        quantity: data.quantity,
        unit: data.unit,
        minThreshold: data.min_threshold,
        price: data.price || 0,
        supplier: data.supplier,
        expiryDate: data.expiry_date,
        location: data.location,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      setInventory(prev => [transformedData, ...prev]);
      
      toast({
        title: "Success",
        description: `${itemData.name} has been added to inventory.`,
      });

      return { success: true };
    } catch (error) {
      console.error('Error adding inventory item:', error);
      toast({
        title: "Error",
        description: "Failed to add inventory item.",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  const updateQuantity = async (id: string, newQuantity: number) => {
    try {
      const { error } = await supabase
        .from('inventory')
        .update({ quantity: newQuantity })
        .eq('id', id);

      if (error) throw error;

      setInventory(prev => 
        prev.map(item => 
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );

      toast({
        title: "Quantity Updated",
        description: "Item quantity has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: "Error",
        description: "Failed to update quantity.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [user]);

  return {
    inventory,
    loading,
    addItem,
    updateQuantity,
    refetch: fetchInventory
  };
};
