import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  scheduled_for?: string;
  sent_at?: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchNotifications = async () => {
    if (!user) {
      console.log('No user found, skipping notifications fetch');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Fetching notifications for user:', user.id);
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
      }
      
      console.log('Fetched notifications:', data);
      setNotifications(data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );

      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      });
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.filter(notification => notification.id !== notificationId)
      );

      toast({
        title: "Success",
        description: "Notification deleted",
      });
    } catch (err) {
      console.error('Error deleting notification:', err);
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      });
    }
  };

  const clearAllNotifications = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setNotifications([]);

      toast({
        title: "Success",
        description: "All notifications cleared",
      });
    } catch (err) {
      console.error('Error clearing all notifications:', err);
      toast({
        title: "Error",
        description: "Failed to clear all notifications",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  // Set up real-time subscription for new notifications
  useEffect(() => {
    if (!user) return;

    console.log('Setting up real-time subscription for notifications');
    
    const channel = supabase
      .channel(`notifications_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New notification received via real-time:', payload);
          const newNotification = payload.new as Notification;
          
          setNotifications(prev => [newNotification, ...prev]);
          
          // Show toast for new notifications
          toast({
            title: newNotification.title,
            description: newNotification.message,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Notification updated via real-time:', payload);
          const updatedNotification = payload.new as Notification;
          
          setNotifications(prev => 
            prev.map(notification => 
              notification.id === updatedNotification.id 
                ? updatedNotification 
                : notification
            )
          );
        }
      )
      .subscribe((status, err) => {
        console.log('Notification subscription status:', status);
        if (err) {
          console.error('Subscription error:', err);
        }
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to notifications real-time updates');
        }
      });

    return () => {
      console.log('Cleaning up notification subscription');
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return {
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    refetch: fetchNotifications
  };
};
