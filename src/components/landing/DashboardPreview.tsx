
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const DashboardPreview = () => {
  return (
    <section className="py-24 bg-slate-50/70 border-y border-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-3">Live Preview</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
            See XTATE In Action
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Get a glimpse of the powerful admin dashboard that puts complete control at your fingertips
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <Card className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-slate-200/50 overflow-hidden">
            <CardContent className="p-2">
              <div className="relative rounded-2xl overflow-hidden">
                <img
                  src="/lovable-uploads/395ceb7b-df03-4f22-a2ef-c35bdb623fdd.png"
                  alt="XTATE Admin Dashboard Preview"
                  className="w-full h-auto"
                />
              </div>
            </CardContent>
          </Card>

          {/* Dashboard Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-lg">247</span>
              </div>
              <h3 className="text-slate-900 font-bold mb-1">Total Residents</h3>
              <p className="text-slate-500 text-sm">Comprehensive resident management and tracking</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-emerald-600 font-bold text-xs">₦2.4M</span>
              </div>
              <h3 className="text-slate-900 font-bold mb-1">Monthly Revenue</h3>
              <p className="text-slate-500 text-sm">Automated dues collection and financial tracking</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-violet-600 font-bold text-lg">12</span>
              </div>
              <h3 className="text-slate-900 font-bold mb-1">Active Issues</h3>
              <p className="text-slate-500 text-sm">Real-time complaint and issue management</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPreview;
