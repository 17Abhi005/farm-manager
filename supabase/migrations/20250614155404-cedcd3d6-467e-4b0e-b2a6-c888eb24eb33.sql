
-- Create a function to send notifications for various user actions
CREATE OR REPLACE FUNCTION public.create_user_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  notification_title TEXT;
  notification_message TEXT;
  notification_type TEXT;
BEGIN
  -- Determine the notification content based on the table and operation
  CASE TG_TABLE_NAME
    WHEN 'crops' THEN
      CASE TG_OP
        WHEN 'INSERT' THEN
          notification_title := 'New Crop Added';
          notification_message := 'Successfully added crop: ' || NEW.name;
          notification_type := 'crop_created';
        WHEN 'UPDATE' THEN
          notification_title := 'Crop Updated';
          notification_message := 'Updated crop: ' || NEW.name || ' (Status: ' || NEW.status || ')';
          notification_type := 'crop_updated';
        WHEN 'DELETE' THEN
          notification_title := 'Crop Deleted';
          notification_message := 'Deleted crop: ' || OLD.name;
          notification_type := 'crop_deleted';
      END CASE;
    
    WHEN 'transactions' THEN
      CASE TG_OP
        WHEN 'INSERT' THEN
          notification_title := 'New Transaction Recorded';
          notification_message := 'Added ' || NEW.type || ' of ₹' || NEW.amount || ' for ' || NEW.category;
          notification_type := 'transaction_created';
        WHEN 'UPDATE' THEN
          notification_title := 'Transaction Updated';
          notification_message := 'Updated transaction: ₹' || NEW.amount || ' for ' || NEW.category;
          notification_type := 'transaction_updated';
      END CASE;
    
    WHEN 'inventory' THEN
      CASE TG_OP
        WHEN 'INSERT' THEN
          notification_title := 'Inventory Item Added';
          notification_message := 'Added ' || NEW.quantity || ' ' || NEW.unit || ' of ' || NEW.name;
          notification_type := 'inventory_created';
        WHEN 'UPDATE' THEN
          notification_title := 'Inventory Updated';
          notification_message := 'Updated inventory: ' || NEW.name || ' (Quantity: ' || NEW.quantity || ' ' || NEW.unit || ')';
          notification_type := 'inventory_updated';
          -- Check for low stock
          IF NEW.quantity <= NEW.min_threshold THEN
            INSERT INTO public.notifications (user_id, title, message, type)
            VALUES (
              NEW.user_id,
              'Low Stock Alert',
              'Warning: ' || NEW.name || ' is running low (Current: ' || NEW.quantity || ', Minimum: ' || NEW.min_threshold || ')',
              'low_stock_alert'
            );
          END IF;
      END CASE;
    
    WHEN 'parcels' THEN
      CASE TG_OP
        WHEN 'INSERT' THEN
          notification_title := 'New Parcel Added';
          notification_message := 'Added parcel: ' || NEW.name || ' (' || NEW.area || ' acres)';
          notification_type := 'parcel_created';
        WHEN 'UPDATE' THEN
          notification_title := 'Parcel Updated';
          notification_message := 'Updated parcel: ' || NEW.name || ' (Status: ' || NEW.status || ')';
          notification_type := 'parcel_updated';
      END CASE;
  END CASE;

  -- Insert the notification
  IF notification_title IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      COALESCE(NEW.user_id, OLD.user_id),
      notification_title,
      notification_message,
      notification_type
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Create triggers for crops table
DROP TRIGGER IF EXISTS crops_notification_trigger ON public.crops;
CREATE TRIGGER crops_notification_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.crops
  FOR EACH ROW
  EXECUTE FUNCTION public.create_user_notification();

-- Create triggers for transactions table
DROP TRIGGER IF EXISTS transactions_notification_trigger ON public.transactions;
CREATE TRIGGER transactions_notification_trigger
  AFTER INSERT OR UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.create_user_notification();

-- Create triggers for inventory table
DROP TRIGGER IF EXISTS inventory_notification_trigger ON public.inventory;
CREATE TRIGGER inventory_notification_trigger
  AFTER INSERT OR UPDATE ON public.inventory
  FOR EACH ROW
  EXECUTE FUNCTION public.create_user_notification();

-- Create triggers for parcels table
DROP TRIGGER IF EXISTS parcels_notification_trigger ON public.parcels;
CREATE TRIGGER parcels_notification_trigger
  AFTER INSERT OR UPDATE ON public.parcels
  FOR EACH ROW
  EXECUTE FUNCTION public.create_user_notification();

-- Enable RLS on notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own notifications" ON public.notifications;
CREATE POLICY "Users can insert their own notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Add some sample notifications for testing
INSERT INTO public.notifications (user_id, title, message, type)
SELECT 
  auth.uid(),
  'Welcome to AgriManager Pro!',
  'Your farm management system is ready. Start by adding your first crop or parcel.',
  'welcome'
WHERE auth.uid() IS NOT NULL
ON CONFLICT DO NOTHING;
