
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from './useNotifications';

export const useRealtimeUpdates = () => {
  const { user } = useAuth();
  const { notifications } = useNotifications();

  useEffect(() => {
    if (!user) return;

    // Subscribe to crop changes
    const cropsChannel = supabase
      .channel('crops-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'crops',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Crop updated:', payload);
          // Notifications are now handled by the notification triggers
        }
      )
      .subscribe();

    // Subscribe to transaction changes
    const transactionsChannel = supabase
      .channel('transactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Transaction updated:', payload);
          // Notifications are now handled by the notification triggers
        }
      )
      .subscribe();

    // Subscribe to inventory changes
    const inventoryChannel = supabase
      .channel('inventory-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inventory',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Inventory updated:', payload);
          // Notifications are now handled by the notification triggers
        }
      )
      .subscribe();

    // Subscribe to parcel changes
    const parcelsChannel = supabase
      .channel('parcels-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'parcels',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Parcel updated:', payload);
          // Notifications are now handled by the notification triggers
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(cropsChannel);
      supabase.removeChannel(transactionsChannel);
      supabase.removeChannel(inventoryChannel);
      supabase.removeChannel(parcelsChannel);
    };
  }, [user]);

  return {
    notifications
  };
};
