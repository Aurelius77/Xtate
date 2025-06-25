
import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AdminPaymentChart = () => {
  return (
    <Card className="lg:col-span-2 glass-card border-cyan-400/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-medium text-cyan-50">Monthly Payment Trends</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +12.5%
            </span>
            <select className="text-xs glass border border-cyan-400/30 rounded px-2 py-1 text-cyan-200">
              <option>2024</option>
              <option>2023</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-48 flex items-end justify-between gap-2">
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div 
                className="w-6 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t"
                style={{ height: `${Math.random() * 120 + 20}px` }}
              />
              <span className="text-xs text-cyan-300">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminPaymentChart;
