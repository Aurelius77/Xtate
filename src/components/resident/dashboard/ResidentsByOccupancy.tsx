import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DATA = [
    { name: 'Owner Occupied', value: 312, color: '#22c55e', percentage: '61%' },
    { name: 'Tenant Occupied', value: 167, color: '#3b82f6', percentage: '33%' },
    { name: 'Vacant', value: 33, color: '#94a3b8', percentage: '6%' },
];

const ResidentsByOccupancy = () => {
    return (
        <Card className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[280px]">
            <CardHeader className="p-5 pb-0">
                <CardTitle className="text-sm font-bold text-gray-900 tracking-tight">Residents by Occupancy</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-2 flex-1 flex flex-col justify-between">
                <div className="h-28 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={DATA}
                                innerRadius={35}
                                outerRadius={50}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {DATA.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-2">
                        <span className="text-xl font-black text-gray-900 leading-none">512</span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mt-0.5">Total</span>
                    </div>
                </div>

                <div className="space-y-2 mt-2">
                    {DATA.map((item) => (
                        <div key={item.name} className="flex items-center justify-between group">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-[11px] font-bold text-gray-500 group-hover:text-gray-900 transition-colors">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-black text-gray-900">{item.value}</span>
                                <span className="text-[10px] font-medium text-gray-300">({item.percentage})</span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default ResidentsByOccupancy;
