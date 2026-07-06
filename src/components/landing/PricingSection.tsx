
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, ArrowRight, Phone } from 'lucide-react';

const PricingSection = () => {
  const features = [
    "Complete Resident Management System",
    "Automated Dues Collection & Tracking",
    "Visitor Access Code Generation",
    "Meeting & Attendance Management",
    "Complaint Resolution System",
    "Expense Management & Reporting",
    "Security Personnel Management",
    "Multi-role Dashboard Access",
    "Real-time Payment Notifications",
    "Data Import/Export Capabilities",
    "24/7 Customer Support",
    "Regular Updates & Maintenance"
  ];

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-3">Pricing</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
            Pricing That Works For Your Estate
          </h2>
          <p className="text-lg text-slate-500">
            Every estate is unique, and so are their needs. Let's discuss a solution that fits your specific requirements and budget.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-slate-200/50 text-center overflow-hidden">
            <CardHeader className="p-10 pb-6 bg-slate-50/50 border-b border-gray-100">
              <CardTitle className="font-display text-3xl font-bold text-slate-900 mb-3 tracking-tight">
                Enterprise Solution
              </CardTitle>
              <p className="text-slate-500 text-lg">
                Comprehensive estate management platform tailored to your needs
              </p>
            </CardHeader>
            <CardContent className="p-10 space-y-10">
              {/* Features Grid */}
              <div className="grid md:grid-cols-2 gap-4 text-left">
                {features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    </div>
                    <span className="text-slate-700 font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Section */}
              <div className="pt-8 border-t border-gray-100">
                <div className="mb-6">
                  <Button
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white text-base font-bold px-10 h-14 rounded-2xl shadow-xl shadow-blue-600/20 mb-4"
                  >
                    <Phone className="mr-2 h-5 w-5" />
                    Request a Quote
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
                <p className="text-slate-500 text-sm max-w-md mx-auto">
                  Flexible payment options available to fit your estate's needs.
                  Contact us for a personalized quote based on your resident count and requirements.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
