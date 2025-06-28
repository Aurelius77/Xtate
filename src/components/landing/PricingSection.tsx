
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
    <section className="py-24 bg-slate-800/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Pricing That Works
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              {" "}For Your Estate
            </span>
          </h2>
          <p className="text-xl text-cyan-200 max-w-3xl mx-auto">
            Every estate is unique, and so are their needs. Let's discuss a solution that fits your specific requirements and budget.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="glass-card border-cyan-400/20 text-center">
            <CardHeader className="pb-8">
              <CardTitle className="text-3xl font-bold text-white mb-4">
                Enterprise Solution
              </CardTitle>
              <p className="text-cyan-200 text-lg">
                Comprehensive estate management platform tailored to your needs
              </p>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Features Grid */}
              <div className="grid md:grid-cols-2 gap-4 text-left">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-cyan-100">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Section */}
              <div className="pt-8 border-t border-cyan-400/20">
                <div className="mb-6">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white text-lg px-12 py-4 rounded-xl mb-4"
                  >
                    <Phone className="mr-2 h-5 w-5" />
                    Request a Quote
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
                <p className="text-cyan-300 text-sm max-w-md mx-auto">
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
