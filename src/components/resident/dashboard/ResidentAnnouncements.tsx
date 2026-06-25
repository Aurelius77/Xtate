import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Megaphone, Droplets, ShieldAlert, Bell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SecureAuthContext';

interface AnnouncementItem {
    id: string;
    title: string;
    content: string;
    created_at: string;
    is_urgent: boolean;
}

const FALLBACK = [
    {
        title: 'AGM Notice',
        excerpt: 'The 2025 Annual General Meeting will held on May 31, 2025 at 10:00 AM.',
        time: 'May 12, 2025',
        icon: Megaphone,
        color: 'text-blue-600',
        bg: 'bg-blue-50'
    },
    {
        title: 'Water Interruption',
        excerpt: 'Water supply will be interrupted on May 16, 2025 between 10AM - 2PM.',
        time: 'May 11, 2025',
        icon: Droplets,
        color: 'text-purple-600',
        bg: 'bg-purple-50'
    },
    {
        title: 'Security Alert',
        excerpt: 'All residents are advised to close gates after 10PM and report suspicious activities.',
        time: 'May 10, 2025',
        icon: ShieldAlert,
        color: 'text-rose-600',
        bg: 'bg-rose-50'
    },
];

const ICON_POOL = [Megaphone, Bell, Droplets, ShieldAlert];
const COLOR_POOL = [
    { color: 'text-blue-600', bg: 'bg-blue-50' },
    { color: 'text-purple-600', bg: 'bg-purple-50' },
    { color: 'text-amber-600', bg: 'bg-amber-50' },
    { color: 'text-rose-600', bg: 'bg-rose-50' },
];

const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const ResidentAnnouncements = () => {
    const { user } = useAuth();
    const [items, setItems] = useState<{ title: string; excerpt: string; time: string; icon: React.ElementType; color: string; bg: string }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.estate_id) { setItems(FALLBACK); setLoading(false); return; }

        const fetch = async () => {
            try {
                const { data, error } = await supabase
                    .from('announcements')
                    .select('id, title, content, created_at, is_urgent')
                    .eq('estate_id', user.estate_id)
                    .order('created_at', { ascending: false })
                    .limit(3);

                if (error || !data?.length) { setItems(FALLBACK); return; }

                setItems(data.map((a: AnnouncementItem, i) => ({
                    title: a.title,
                    excerpt: a.content,
                    time: formatDate(a.created_at),
                    icon: a.is_urgent ? ShieldAlert : ICON_POOL[i % ICON_POOL.length],
                    color: a.is_urgent ? 'text-rose-600' : COLOR_POOL[i % COLOR_POOL.length].color,
                    bg: a.is_urgent ? 'bg-rose-50' : COLOR_POOL[i % COLOR_POOL.length].bg,
                })));
            } catch {
                setItems(FALLBACK);
            } finally {
                setLoading(false);
            }
        };

        fetch();
    }, [user?.estate_id]);

    return (
        <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col h-full">
            <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold text-gray-900 tracking-tight">Announcements</CardTitle>
                <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline transition-all">View all</button>
            </CardHeader>
            <CardContent className="p-6 pt-2 space-y-6 flex-1">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />
                    ))
                ) : items.map((ann, i) => (
                    <div key={i} className="flex gap-4 group cursor-pointer">
                        <div className={`h-11 w-11 ${ann.bg} rounded-2xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
                            <ann.icon className={`h-5 w-5 ${ann.color}`} />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-xs font-black text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{ann.title}</h4>
                            <p className="text-[11px] font-medium text-gray-500 line-clamp-2 leading-relaxed">{ann.excerpt}</p>
                            <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest pt-1">{ann.time}</p>
                        </div>
                    </div>
                ))}
            </CardContent>
            <div className="p-4 border-t border-gray-50 text-center">
                <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:bg-blue-50/30 px-3 py-1 rounded-lg transition-all">
                    View All Announcements →
                </button>
            </div>
        </Card>
    );
};

export default ResidentAnnouncements;
