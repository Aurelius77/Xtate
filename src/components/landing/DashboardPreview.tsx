
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const DashboardPreview = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            See XTATE
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              {" "}In Action
            </span>
          </h2>
          <p className="text-xl text-cyan-200 max-w-3xl mx-auto">
            Get a glimpse of the powerful admin dashboard that puts complete control at your fingertips
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <Card className="glass-card border-cyan-400/20 overflow-hidden">
            <CardContent className="p-2">
              <div className="relative rounded-lg overflow-hidden">
                <img 
                  src="/lovable-uploads/395ceb7b-df03-4f22-a2ef-c35bdb623fdd.png" 
                  alt="XTATE Admin Dashboard Preview" 
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent pointer-events-none" />
              </div>
            </CardContent>
          </Card>
          
          {/* Dashboard Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">247</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Total Residents</h3>
              <p className="text-cyan-300 text-sm">Comprehensive resident management and tracking</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-sm">₦2.4M</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Monthly Revenue</h3>
              <p className="text-cyan-300 text-sm">Automated dues collection and financial tracking</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">12</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Active Issues</h3>
              <p className="text-cyan-300 text-sm">Real-time complaint and issue management</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPreview;
