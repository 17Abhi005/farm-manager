
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface NotificationSettings {
  email: boolean;
  push: boolean;
  sound: boolean;
  cropUpdates: boolean;
  weatherAlerts: boolean;
  marketInsights: boolean;
  lowStock: boolean;
}

interface UserPreferences {
  language: string;
  timezone: string;
  currency: string;
  theme: string;
  dateFormat: string;
}

interface PrivacySettings {
  profileVisibility: string;
  dataSharing: boolean;
  analytics: boolean;
}

interface UserSettings {
  notifications: NotificationSettings;
  preferences: UserPreferences;
  privacy: PrivacySettings;
}

interface ProfileData {
  id: string;
  notifications?: any;
  preferences?: any;
  privacy?: any;
  [key: string]: any;
}

export const useSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const defaultSettings: UserSettings = {
    notifications: {
      email: true,
      push: true,
      sound: true,
      cropUpdates: true,
      weatherAlerts: true,
      marketInsights: true,
      lowStock: true,
    },
    preferences: {
      language: 'en',
      timezone: 'UTC',
      currency: 'INR',
      theme: 'light',
      dateFormat: 'DD/MM/YYYY',
    },
    privacy: {
      profileVisibility: 'private',
      dataSharing: false,
      analytics: true,
    },
  };

  const [settings, setSettings] = useState<UserSettings>(defaultSettings);

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        const profileData = data as ProfileData;
        // Parse settings from profile data or use defaults
        const userSettings: UserSettings = {
          notifications: profileData.notifications || defaultSettings.notifications,
          preferences: profileData.preferences || defaultSettings.preferences,
          privacy: profileData.privacy || defaultSettings.privacy,
        };
        setSettings(userSettings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user) return;

    setSaving(true);
    try {
      const updatedSettings = { ...settings, ...newSettings };
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          notifications: updatedSettings.notifications as any,
          preferences: updatedSettings.preferences as any,
          privacy: updatedSettings.privacy as any,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      setSettings(updatedSettings);
      
      // Apply theme immediately if changed
      if (newSettings.preferences?.theme) {
        applyTheme(newSettings.preferences.theme);
      }

      toast({
        title: 'Settings Updated',
        description: 'Your settings have been saved successfully',
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const applyTheme = (theme: string) => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  const resetPassword = async () => {
    if (!user?.email) return;
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth?mode=reset`,
      });

      if (error) throw error;

      toast({
        title: 'Password Reset',
        description: 'Password reset link sent to your email.',
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        title: 'Error',
        description: 'Failed to send password reset email',
        variant: 'destructive',
      });
    }
  };

  return {
    settings,
    loading,
    saving,
    updateSettings,
    resetPassword,
    refetch: fetchSettings,
  };
};
