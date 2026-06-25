import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, User, Bell, HardDrive } from 'lucide-react';

const ResidentSystemOverview = () => {
    return (
        <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col h-full">
            <CardHeader className="p-6 pb-2">
                <CardTitle className="text-sm font-bold text-gray-900 tracking-tight">Account Health</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2 space-y-6 flex-1">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            <span className="text-xs font-bold text-gray-600">Personal Account</span>
                        </div>
                        <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px] px-2 rounded-lg">ACTIVE</Badge>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                            <span className="text-xs font-bold text-gray-600">Push Notifications</span>
                        </div>
                        <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[9px] px-2 rounded-lg">ENABLED</Badge>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-50 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <HardDrive className="h-3 w-3 text-gray-400" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Secure Storage</span>
                        </div>
                        <span className="text-[10px] font-black text-gray-900">12%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '12%' }} />
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-gray-400" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Profile Status</span>
                    </div>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">90% Complete</span>
                </div>
            </CardContent>
            <div className="p-4 border-t border-gray-50 text-center">
                <button className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-blue-600 transition-all">
                    System Health Checklist →
                </button>
            </div>
        </Card>
    );
};

export default ResidentSystemOverview;
