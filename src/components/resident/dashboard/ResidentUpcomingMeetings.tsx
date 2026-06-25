import React, { useEffect, useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface MeetingItem {
    id: string;
    title: string;
    meetingDate: string;
    windowStart: string;
}

const ResidentUpcomingMeetings = () => {
    const [meetings, setMeetings] = useState<MeetingItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMeetings = async () => {
            try {
                const { data, error } = await supabase
                    .from('meetings')
                    .select('id, title, meeting_date, attendance_window_start')
                    .gte('meeting_date', new Date().toISOString())
                    .order('meeting_date', { ascending: true })
                    .limit(3);

                if (error) throw error;

                setMeetings((data || []).map(m => ({
                    id: m.id,
                    title: m.title,
                    meetingDate: m.meeting_date,
                    windowStart: m.attendance_window_start,
                })));
            } catch {
                // no-op
            } finally {
                setLoading(false);
            }
        };
        fetchMeetings();
    }, []);

    const getRelativeLabel = (dateStr: string) => {
        const diffDays = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
        if (diffDays === 0) return { label: 'Today', cls: 'text-red-600 bg-red-50' };
        if (diffDays === 1) return { label: 'Tomorrow', cls: 'text-amber-600 bg-amber-50' };
        if (diffDays <= 7) return { label: `In ${diffDays}d`, cls: 'text-blue-600 bg-blue-50' };
        return { label: new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), cls: 'text-gray-500 bg-gray-50' };
    };

    return (
        <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
            <CardHeader className="p-5 pb-0 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold text-gray-900 tracking-tight">Upcoming Meetings</CardTitle>
                <div className="h-8 w-8 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-blue-600" />
                </div>
            </CardHeader>
            <CardContent className="p-5 pt-3 flex-1 flex flex-col gap-2 overflow-hidden">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />
                    ))
                ) : meetings.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <Calendar className="h-8 w-8 text-gray-200 mb-2" />
                        <p className="text-xs font-bold text-gray-400">No upcoming meetings</p>
                    </div>
                ) : (
                    meetings.map((m) => {
                        const { label, cls } = getRelativeLabel(m.meetingDate);
                        const day = new Date(m.meetingDate).getDate();
                        const month = new Date(m.meetingDate).toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
                        const time = new Date(m.windowStart).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                        return (
                            <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50/80 border border-gray-100/50 hover:bg-blue-50/30 transition-colors group cursor-pointer">
                                <div className="flex flex-col items-center min-w-[36px]">
                                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${cls}`}>{month}</span>
                                    <span className="text-base font-black text-gray-800 leading-tight">{day}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{m.title}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                                            <Clock className="h-2.5 w-2.5" />{time}
                                        </span>
                                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${cls}`}>{label}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </CardContent>
        </Card>
    );
};

export default ResidentUpcomingMeetings;
