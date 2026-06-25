import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Zap, Shield, Droplets, Trash2, Receipt } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SecureAuthContext';

interface PaymentItem {
    name: string;
    amount: string;
    time: string;
    icon: React.ElementType;
    color: string;
    bg: string;
}

const FALLBACK: PaymentItem[] = [
    { name: 'Estate Dues', amount: '₦45,000', time: 'Today, 09:30 AM', icon: Home, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { name: 'Electricity Token', amount: '₦10,000', time: 'Yesterday, 04:15 PM', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
    { name: 'Security Levy', amount: '₦5,000', time: 'May 12, 08:15 AM', icon: Shield, color: 'text-purple-600', bg: 'bg-purple-50' },
    { name: 'Water Bill', amount: '₦2,500', time: 'May 10, 11:22 AM', icon: Droplets, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Waste Management', amount: '₦3,000', time: 'May 08, 02:10 PM', icon: Trash2, color: 'text-orange-600', bg: 'bg-orange-50' },
];

const ICON_MAP: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
    electricity: { icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
    security: { icon: Shield, color: 'text-purple-600', bg: 'bg-purple-50' },
    water: { icon: Droplets, color: 'text-blue-600', bg: 'bg-blue-50' },
    waste: { icon: Trash2, color: 'text-orange-600', bg: 'bg-orange-50' },
    estate: { icon: Home, color: 'text-emerald-600', bg: 'bg-emerald-50' },
};

const resolveIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('electric') || t.includes('power') || t.includes('light')) return ICON_MAP.electricity;
    if (t.includes('security') || t.includes('guard')) return ICON_MAP.security;
    if (t.includes('water')) return ICON_MAP.water;
    if (t.includes('waste') || t.includes('trash')) return ICON_MAP.waste;
    return { icon: Receipt, color: 'text-emerald-600', bg: 'bg-emerald-50' };
};

const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diffDays === 0) return `Today, ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    if (diffDays === 1) return `Yesterday, ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const ResidentRecentTransactions = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<PaymentItem[]>(FALLBACK);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.id) return;

        const fetchTransactions = async () => {
            try {
                const { data: residentRow } = await supabase
                    .from('residents')
                    .select('id')
                    .eq('user_id', user.id)
                    .maybeSingle();

                if (!residentRow) { setLoading(false); return; }

                const { data, error } = await supabase
                    .from('resident_dues')
                    .select('amount, paid_at, dues(title)')
                    .eq('resident_id', residentRow.id)
                    .eq('status', 'paid')
                    .order('paid_at', { ascending: false })
                    .limit(5);

                if (error || !data?.length) { setLoading(false); return; }

                setTransactions(data.map((d: any) => {
                    const title = d.dues?.title || 'Payment';
                    const { icon, color, bg } = resolveIcon(title);
                    return {
                        name: title,
                        amount: `₦${(d.amount || 0).toLocaleString()}`,
                        time: d.paid_at ? formatDateTime(d.paid_at) : 'N/A',
                        icon,
                        color,
                        bg,
                    };
                }));
            } catch {
                // keep fallback
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [user?.id]);

    return (
        <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col h-full">
            <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold text-gray-900 tracking-tight">Recent Payments</CardTitle>
                <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline transition-all">View all</button>
            </CardHeader>
            <CardContent className="p-6 pt-2 space-y-4 flex-1">
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />
                    ))
                ) : transactions.map((tx, i) => (
                    <div key={i} className="flex items-center justify-between group cursor-pointer hover:bg-gray-50/50 p-1.5 rounded-xl transition-all">
                        <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 ${tx.bg} rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm`}>
                                <tx.icon className={`h-5 w-5 ${tx.color}`} />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-xs font-bold text-gray-900">{tx.name}</p>
                                <p className="text-[10px] font-medium text-gray-400">Payment Processed</p>
                            </div>
                        </div>
                        <div className="text-right space-y-0.5">
                            <p className="text-xs font-black text-rose-500">-{tx.amount}</p>
                            <p className="text-[9px] font-bold text-gray-300">{tx.time}</p>
                        </div>
                    </div>
                ))}
            </CardContent>
            <div className="p-4 border-t border-gray-50 text-center">
                <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:bg-blue-50/30 px-3 py-1 rounded-lg transition-all">
                    My Transaction History →
                </button>
            </div>
        </Card>
    );
};

export default ResidentRecentTransactions;
