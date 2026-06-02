import React, { useCallback, useEffect, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SecureAuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

const NotificationsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Tables<'notifications'>[]>([]);
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

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

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

    toast({ title: 'Notifications Updated', description: 'All notifications are marked as read.' });
    await fetchNotifications();
  };

  const unreadCount = notifications.filter((notification) => !notification.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-cyan-50">Notifications</h1>
          <p className="text-cyan-200">Your estate updates and alerts</p>
        </div>
        <Button variant="outline" className="glass border-cyan-400/30 text-cyan-100" onClick={markAllRead} disabled={unreadCount === 0}>
          <CheckCheck className="h-4 w-4 mr-2" />
          Mark All Read
        </Button>
      </div>

      {loading ? (
        <p className="text-cyan-200">Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <Card className="glass-card border-cyan-400/20">
          <CardContent className="p-12 text-center">
            <Bell className="h-12 w-12 mx-auto text-cyan-300 mb-3" />
            <p className="text-cyan-200">No notifications yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card key={notification.id} className={`glass-card border-cyan-400/20 ${notification.is_read ? 'opacity-70' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-medium text-cyan-50">{notification.title}</h2>
                      {!notification.is_read && <Badge className="bg-cyan-500/20 text-cyan-300">New</Badge>}
                    </div>
                    <p className="text-sm text-cyan-200 mt-1">{notification.message}</p>
                    <p className="text-xs text-cyan-300 mt-2">{new Date(notification.created_at).toLocaleString()}</p>
                  </div>
                  <Badge variant="outline">{notification.type}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
