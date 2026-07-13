import React, { useCallback, useEffect, useState } from 'react';
import { Bell, CheckCheck, Inbox, Trash2, CreditCard, MessageSquare, AlertCircle, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SecureAuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Notification = Tables<'notifications'>;

interface NotificationsPageProps {
  onNavigate: (page: string) => void;
}

const typeToPage: Record<string, string> = {
  complaint: 'complaints',
  payment: 'dues',
  dues: 'dues',
  meeting: 'meetings',
  announcement: 'broadcast',
};

const getNotificationIcon = (type: string | null) => {
  switch (type) {
    case 'complaint': return <AlertCircle className="h-5 w-5 text-rose-500" />;
    case 'payment': case 'dues': return <CreditCard className="h-5 w-5 text-emerald-500" />;
    case 'meeting': return <Calendar className="h-5 w-5 text-violet-500" />;
    case 'announcement': return <MessageSquare className="h-5 w-5 text-blue-500" />;
    default: return <Bell className="h-5 w-5 text-blue-500" />;
  }
};

const NotificationsPage = ({ onNavigate }: NotificationsPageProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setNotifications(data ?? []);
    }
    setLoading(false);
  }, [toast, user]);

  useEffect(() => { void fetchNotifications(); }, [fetchNotifications]);

  const markAllRead = async () => {
    if (!user) return;
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    await fetchNotifications();
  };

  const handleClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await supabase.from('notifications').update({ is_read: true }).eq('id', notification.id);
      setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n)));
    }
    const targetPage = typeToPage[notification.type];
    if (targetPage) onNavigate(targetPage);
  };

  const handleDelete = async (event: React.MouseEvent, id: string) => {
    event.stopPropagation();
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
          <p className="text-gray-500">Alerts that need your attention across the estate</p>
        </div>
        <Button
          variant="outline"
          className="bg-gray-50 border-gray-100 text-gray-700"
          onClick={markAllRead}
          disabled={unreadCount === 0}
        >
          <CheckCheck className="h-4 w-4 mr-2" />
          Mark All Read
        </Button>
      </div>

      <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center gap-3 bg-gray-50/20">
          <h3 className="text-lg font-bold text-gray-900">Inbox</h3>
          {unreadCount > 0 && <Badge className="bg-blue-600 text-white border-none">{unreadCount} new</Badge>}
        </div>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-50">
            {loading ? (
              <div className="p-12 text-center text-gray-400">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="p-16 text-center">
                <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Inbox className="h-8 w-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Inbox is empty</h3>
                <p className="text-gray-500 mt-1">You'll be notified here about complaints, payments, and other estate activity.</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleClick(notification)}
                  className={`p-5 flex items-start gap-4 hover:bg-gray-50/50 cursor-pointer transition-colors ${!notification.is_read ? 'bg-blue-50/30' : ''}`}
                >
                  <div className={`h-11 w-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${!notification.is_read ? 'bg-white' : 'bg-gray-50 opacity-60'}`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`font-bold truncate ${!notification.is_read ? 'text-gray-900' : 'text-gray-600'}`}>{notification.title}</h4>
                      <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap uppercase">
                        {new Date(notification.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className={`text-sm mt-0.5 ${!notification.is_read ? 'text-gray-700' : 'text-gray-500'}`}>{notification.message}</p>
                    <span className="inline-block mt-2 text-[10px] font-bold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-md">
                      {notification.type || 'General'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!notification.is_read && <div className="h-2 w-2 bg-blue-600 rounded-full" />}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-gray-300 hover:text-rose-500 hover:bg-rose-50"
                      onClick={(event) => handleDelete(event, notification.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsPage;
