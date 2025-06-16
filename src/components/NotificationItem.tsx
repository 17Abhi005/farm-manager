
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Eye } from 'lucide-react';
import { Notification } from '@/hooks/useNotifications';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete
}) => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'crop_created':
      case 'crop_updated':
      case 'crop_deleted':
        return '🌱';
      case 'transaction_created':
      case 'transaction_updated':
        return '💰';
      case 'inventory_created':
      case 'inventory_updated':
        return '📦';
      case 'low_stock_alert':
        return '⚠️';
      case 'parcel_created':
      case 'parcel_updated':
        return '📍';
      case 'welcome':
        return '👋';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'low_stock_alert':
        return 'destructive';
      case 'crop_created':
      case 'parcel_created':
      case 'inventory_created':
      case 'transaction_created':
        return 'default';
      case 'welcome':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Card className={`${!notification.is_read ? 'border-l-4 border-l-blue-500 bg-blue-50/50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
            <div className="flex-1">
              <h3 className={`font-semibold ${!notification.is_read ? 'text-blue-900' : 'text-gray-900'}`}>
                {notification.title}
              </h3>
              <p className="text-sm text-gray-500">{formatDate(notification.created_at)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!notification.is_read && (
              <Badge variant={getNotificationColor(notification.type)}>New</Badge>
            )}
            <div className="flex space-x-1">
              {!notification.is_read && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onMarkAsRead(notification.id)}
                  className="h-8 w-8 p-0"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(notification.id)}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-gray-700">{notification.message}</p>
      </CardContent>
    </Card>
  );
};

export default NotificationItem;
