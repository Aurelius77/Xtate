import React, { useCallback, useEffect, useState } from 'react';
import { Bell, CheckCheck, Inbox, Search, Filter, ChevronRight, Clock, Info, ShieldAlert, CreditCard, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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

  const getNotificationIcon = (type: string | null) => {
    switch (type) {
      case 'security': return <ShieldAlert className="h-5 w-5 text-rose-500" />;
      case 'payment': return <CreditCard className="h-5 w-5 text-emerald-500" />;
      case 'message': return <MessageSquare className="h-5 w-5 text-blue-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const unreadCount = notifications.filter((notification) => !notification.is_read).length;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Notification Center</h1>
          <p className="text-gray-500 font-medium mt-1">Stay updated with estate alerts, payments, and community news</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-gray-200 font-bold px-6 h-12" onClick={markAllRead} disabled={unreadCount === 0}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Clear All Unread
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold px-6 h-12 shadow-lg shadow-blue-600/20">
            <Filter className="h-4 w-4 mr-2" />
            Preferences
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/20">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-gray-900">Your Alerts</h3>
            {unreadCount > 0 && <Badge className="bg-blue-600 text-white border-none text-[10px] h-5 rounded-full px-2">{unreadCount} NEW</Badge>}
          </div>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
            <input type="text" placeholder="Search alerts..." className="pl-10 pr-4 py-2 bg-white border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-100 transition-all outline-none w-64 shadow-inner" />
          </div>
        </div>

        <div className="divide-y divide-gray-50">
          {loading ? (
            <div className="p-12 text-center text-gray-400 font-medium italic">Synchronizing your inbox...</div>
          ) : notifications.length === 0 ? (
            <div className="p-20 text-center">
              <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Inbox className="h-10 w-10 text-gray-200" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Inbox is empty</h3>
              <p className="text-gray-500 mt-2 max-w-xs mx-auto">No notifications recorded yet. We'll alert you whenever something important happens.</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div key={notification.id} className={`p-6 transition-all group flex items-start gap-5 hover:bg-gray-50/50 cursor-pointer ${!notification.is_read ? 'bg-blue-50/30' : ''}`}>
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 shadow-sm ${!notification.is_read ? 'bg-white' : 'bg-gray-50 opacity-60'}`}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate pr-4 ${!notification.is_read ? '' : 'text-gray-600'}`}>{notification.title}</h4>
                    <span className="text-[10px] font-black text-gray-400 whitespace-nowrap uppercase tracking-widest">{new Date(notification.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <p className={`text-sm font-medium leading-relaxed mb-3 ${!notification.is_read ? 'text-gray-700' : 'text-gray-500'}`}>{notification.message}</p>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md">{notification.type || 'General'}</span>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      <Clock className="h-3 w-3" />
                      {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
                {!notification.is_read && <div className="h-2 w-2 bg-blue-600 rounded-full mt-2" />}
              </div>
            ))
          )}
        </div>
        <div className="p-4 bg-gray-50/50 text-center border-t border-gray-50">
          <button className="text-[11px] font-black text-gray-400 uppercase tracking-[0.25em] hover:text-blue-600 transition-colors">
            View Older History
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
