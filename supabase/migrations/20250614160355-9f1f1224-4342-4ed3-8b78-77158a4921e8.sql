
-- First, let's see what values are currently allowed and update the check constraint
-- to include the notification types we're using in our triggers

-- Drop the existing check constraint
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Add a new check constraint that includes all the notification types we need
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check 
CHECK (type IN (
  'welcome',
  'crop_created',
  'crop_updated', 
  'crop_deleted',
  'transaction_created',
  'transaction_updated',
  'inventory_created',
  'inventory_updated',
  'low_stock_alert',
  'parcel_created',
  'parcel_updated',
  'system_alert',
  'reminder'
));
