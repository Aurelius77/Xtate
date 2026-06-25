import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, HardDrive, Bell } from 'lucide-react';

const ResidentSystemOverview = () => {
    return (
        <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col h-full">
            <CardHeader className="p-6 pb-3">
                <CardTitle className="text-sm font-bold text-gray-900 tracking-tight">Account Health</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 flex flex-col gap-5 flex-1">
                {/* Status indicators */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                            <span className="text-xs font-bold text-gray-600">Personal Account</span>
                        </div>
                        <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px] px-2 rounded-lg">ACTIVE</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.5)]" />
                            <span className="text-xs font-bold text-gray-600">Notifications</span>
                        </div>
                        <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[9px] px-2 rounded-lg">ON</Badge>
                    </div>
                </div>

                {/* Profile completion */}
                <div className="space-y-2 pt-4 border-t border-gray-50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <User className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Profile</span>
                        </div>
                        <span className="text-[11px] font-black text-emerald-600">90%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: '90%' }} />
                    </div>
                </div>

                {/* Storage */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <HardDrive className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Storage</span>
                        </div>
                        <span className="text-[11px] font-black text-gray-700">12%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: '12%' }} />
                    </div>
                </div>

                {/* Notifications badge */}
                <div className="flex items-center justify-between py-2 px-3 bg-blue-50/60 rounded-xl">
                    <div className="flex items-center gap-2">
                        <Bell className="h-3.5 w-3.5 text-blue-500" />
                        <span className="text-xs font-bold text-blue-700">3 unread alerts</span>
                    </div>
                    <button className="text-[10px] font-black text-blue-600 hover:underline">View</button>
                </div>
            </CardContent>
            <div className="p-4 border-t border-gray-50 text-center">
                <button className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-blue-600 transition-colors">
                    Profile Checklist →
                </button>
            </div>
        </Card>
    );
};

export default ResidentSystemOverview;
