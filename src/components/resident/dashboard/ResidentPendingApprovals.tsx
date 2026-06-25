import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Clock, CheckCircle2 } from 'lucide-react';

const APPROVALS = [
    { type: 'Guest Access', target: 'John Doe', meta: 'May 20, 10:00 AM', status: 'Pending', statusColor: 'bg-amber-50 text-amber-600 border-amber-100', icon: User },
    { type: 'Maintenance', target: 'Pipe Leak', meta: 'Kitchen Sink', status: 'Approved', statusColor: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: CheckCircle2 },
    { type: 'Gate Pass', target: 'Toyota Camry', meta: 'ABC-123-DE', status: 'Pending', statusColor: 'bg-blue-50 text-blue-600 border-blue-100', icon: Clock },
];

const ResidentPendingApprovals = () => {
    return (
        <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col h-full">
            <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold text-gray-900 tracking-tight">Access & Requests</CardTitle>
                <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline transition-all shrink-0 ml-2">Track all</button>
            </CardHeader>
            <CardContent className="p-6 pt-2 space-y-5 flex-1">
                {APPROVALS.map((approval, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 group cursor-pointer overflow-hidden">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className={`shrink-0 h-10 w-10 ${approval.statusColor.split(' ')[0]} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm`}>
                                <approval.icon className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 space-y-0.5">
                                <p className="text-xs font-bold text-gray-900 truncate">{approval.type}</p>
                                <p className="text-[10px] font-medium text-gray-400 truncate">{approval.target}</p>
                                <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest truncate">{approval.meta}</p>
                            </div>
                        </div>
                        <Badge className={`${approval.statusColor} border shadow-none text-[9px] font-black px-2 py-0.5 rounded-lg shrink-0`}>
                            {approval.status}
                        </Badge>
                    </div>
                ))}
            </CardContent>
            <div className="p-4 border-t border-gray-50 text-center">
                <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:bg-blue-50/30 px-3 py-1 rounded-lg transition-all">
                    New Request →
                </button>
            </div>
        </Card>
    );
};

export default ResidentPendingApprovals;
