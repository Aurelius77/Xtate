import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SecureAuthContext';

interface ComplaintItem {
    id: string;
    title: string;
    description: string;
    status: 'open' | 'in_progress' | 'resolved';
    created_at: string;
}

const STATUS_STYLES: Record<string, string> = {
    open: 'bg-amber-50 text-amber-600 border-amber-100',
    in_progress: 'bg-blue-50 text-blue-600 border-blue-100',
    resolved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
};

const STATUS_LABELS: Record<string, string> = {
    open: 'Open',
    in_progress: 'In Progress',
    resolved: 'Resolved',
};

const FALLBACK: ComplaintItem[] = [
    { id: '#C-001', title: 'Noise complaint', description: 'Loud music from neighbor', status: 'open', created_at: '' },
    { id: '#C-002', title: 'Pipe leak', description: 'Kitchen sink dripping', status: 'in_progress', created_at: '' },
    { id: '#C-003', title: 'Gate not closing', description: 'Front gate jammed', status: 'resolved', created_at: '' },
];

const ResidentMaintenanceTickets = () => {
    const { user } = useAuth();
    const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.id) return;

        const fetchComplaints = async () => {
            try {
                const { data: residentRow } = await supabase
                    .from('residents')
                    .select('id')
                    .eq('user_id', user.id)
                    .maybeSingle();

                if (!residentRow) { setComplaints(FALLBACK); return; }

                const { data, error } = await supabase
                    .from('complaints')
                    .select('id, title, description, status, created_at')
                    .eq('resident_id', residentRow.id)
                    .order('created_at', { ascending: false })
                    .limit(4);

                if (error || !data?.length) { setComplaints(FALLBACK); return; }

                setComplaints(data.map(c => ({
                    id: `#${c.id.slice(0, 6).toUpperCase()}`,
                    title: c.title,
                    description: c.description,
                    status: c.status as ComplaintItem['status'],
                    created_at: c.created_at,
                })));
            } catch {
                setComplaints(FALLBACK);
            } finally {
                setLoading(false);
            }
        };

        fetchComplaints();
    }, [user?.id]);

    return (
        <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col h-full">
            <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold text-gray-900 tracking-tight">My Complaints</CardTitle>
                <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline transition-all">View all</button>
            </CardHeader>
            <CardContent className="p-6 pt-2 space-y-5 flex-1">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />
                    ))
                ) : complaints.map((c, i) => (
                    <div key={i} className="flex items-center justify-between group cursor-pointer">
                        <div className="space-y-0.5">
                            <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{c.id}</span>
                            <p className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{c.title}</p>
                            <p className="text-[10px] font-medium text-gray-400 line-clamp-1">{c.description}</p>
                        </div>
                        <Badge className={`${STATUS_STYLES[c.status]} border shadow-none text-[9px] font-black px-2 py-0.5 rounded-lg`}>
                            {STATUS_LABELS[c.status]}
                        </Badge>
                    </div>
                ))}
            </CardContent>
            <div className="p-4 border-t border-gray-50 text-center">
                <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:bg-blue-50/30 px-3 py-1 rounded-lg transition-all">
                    File New Complaint →
                </button>
            </div>
        </Card>
    );
};

export default ResidentMaintenanceTickets;
