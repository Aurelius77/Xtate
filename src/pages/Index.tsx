
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, CreditCard, Calendar, MessageSquare, Shield, Smartphone, 
  DollarSign, UserCheck, Building, FileText, Car, Megaphone, 
  CheckCircle, Star, ArrowRight
} from "lucide-react";
import AuthModal from "@/components/auth/AuthModal";

const Index = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const features = [
    {
      title: "Smart Resident Management",
      description: "Complete resident profiles, unit management, and detailed emergency contacts with vehicle tracking",
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-gradient-to-br from-blue-500/10 to-cyan-500/10"
    },
    {
      title: "Automated Dues & Payments",
      description: "Streamlined billing system with automated reminders, payment tracking, and financial reporting",
      icon: CreditCard,
      color: "from-emerald-500 to-green-500",
      bgColor: "bg-gradient-to-br from-emerald-500/10 to-green-500/10"
    },
    {
      title: "Meeting & Attendance Tracking",
      description: "Schedule meetings, track attendance, and maintain comprehensive participation records",
      icon: Calendar,
      color: "from-purple-500 to-violet-500",
      bgColor: "bg-gradient-to-br from-purple-500/10 to-violet-500/10"
    },
    {
      title: "Advanced Complaint Management",
      description: "Full complaint lifecycle with image/video support, admin responses, and status tracking",
      icon: MessageSquare,
      color: "from-orange-500 to-red-500",
      bgColor: "bg-gradient-to-br from-orange-500/10 to-red-500/10"
    },
    {
      title: "Visitor Access Control",
      description: "Generate secure access codes for visitors with real-time verification and security monitoring",
      icon: Shield,
      color: "from-red-500 to-pink-500",
      bgColor: "bg-gradient-to-br from-red-500/10 to-pink-500/10"
    },
    {
      title: "Expense Management",
      description: "Track estate expenses, categorize spending, generate reports, and manage approval workflows",
      icon: DollarSign,
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-gradient-to-br from-yellow-500/10 to-orange-500/10"
    },
    {
      title: "Broadcast Messaging",
      description: "Send announcements, urgent alerts, and community updates to all residents instantly",
      icon: Megaphone,
      color: "from-indigo-500 to-blue-500",
      bgColor: "bg-gradient-to-br from-indigo-500/10 to-blue-500/10"
    },
    {
      title: "Multi-Role Dashboard",
      description: "Specialized interfaces for admins, residents, and security personnel with role-based access",
      icon: UserCheck,
      color: "from-teal-500 to-cyan-500",
      bgColor: "bg-gradient-to-br from-teal-500/10 to-cyan-500/10"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Estate Manager",
      estate: "Lekki Gardens",
      comment: "EstateConnect has transformed how we manage our 200+ unit estate. The automated dues collection alone has saved us countless hours.",
      rating: 5
    },
    {
      name: "Michael Okafor",
      role: "Resident",
      estate: "Victoria Island Heights",
      comment: "Finally, a platform that makes estate living seamless. From generating visitor codes to tracking my dues - everything is at my fingertips.",
      rating: 5
    },
    {
      name: "Adebayo Thomas",
      role: "Security Supervisor",
      estate: "Banana Island Estate",
      comment: "The visitor access code system has made our security operations much more efficient and secure. Highly recommend!",
      rating: 5
    }
  ];

  const handleAuthClick = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Building className="text-white h-5 w-5" />
            </div>
            <span className="font-bold text-2xl bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              EstateConnect
            </span>
          </div>
          <div className="space-x-3">
            <Button 
              variant="ghost" 
              onClick={() => handleAuthClick('login')}
              className="text-cyan-300 hover:text-cyan-100 hover:bg-cyan-500/10"
            >
              Sign In
            </Button>
            <Button 
              onClick={() => handleAuthClick('register')} 
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge variant="secondary" className="mb-8 bg-cyan-500/10 text-cyan-300 border-cyan-500/20 hover:bg-cyan-500/20">
          🏢 Complete Estate Management Solution
        </Badge>
        
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
          Modern Estate
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
            {" "}Management
          </span>
          <br />Made Simple
        </h1>
        
        <p className="text-xl text-cyan-200 mb-12 max-w-4xl mx-auto leading-relaxed">
          Transform your residential estate with our comprehensive digital platform. 
          From automated dues collection to visitor access control, everything you need in one place.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Button 
            size="lg" 
            onClick={() => handleAuthClick('register')} 
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white text-lg px-10 py-4 rounded-xl"
          >
            Start Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="text-lg px-10 py-4 rounded-xl border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
          >
            Watch Demo
          </Button>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">500+</div>
            <div className="text-cyan-300">Estates Managed</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">25K+</div>
            <div className="text-cyan-300">Happy Residents</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">₦2B+</div>
            <div className="text-cyan-300">Dues Collected</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">99.9%</div>
            <div className="text-cyan-300">Uptime</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Everything You Need for
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              {" "}Modern Estate Management
            </span>
          </h2>
          <p className="text-xl text-cyan-200 max-w-3xl mx-auto">
            Comprehensive features designed to streamline operations and enhance the resident experience
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className={`w-14 h-14 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-7 h-7 text-transparent bg-clip-text bg-gradient-to-r ${feature.color}`} />
                </div>
                <CardTitle className="text-xl text-white mb-2">{feature.title}</CardTitle>
                <CardDescription className="text-cyan-200 leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-slate-800/30 py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Trusted by Estate Managers Across Nigeria
            </h2>
            <p className="text-xl text-cyan-200">See what our users are saying</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-cyan-100 mb-4 italic">"{testimonial.comment}"</p>
                  <div>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-cyan-300 text-sm">{testimonial.role}</p>
                    <p className="text-cyan-400 text-sm">{testimonial.estate}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-cyan-600 to-blue-600 py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Estate?
          </h2>
          <p className="text-xl mb-10 text-cyan-100 max-w-3xl mx-auto">
            Join hundreds of estates already using EstateConnect to streamline operations, 
            enhance security, and improve resident satisfaction.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary" 
              onClick={() => handleAuthClick('register')} 
              className="text-lg px-10 py-4 bg-white text-cyan-600 hover:bg-cyan-50"
            >
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-10 py-4 border-white/30 text-white hover:bg-white/10"
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-700/50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-5 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Building className="text-white h-5 w-5" />
                </div>
                <span className="font-bold text-2xl bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  EstateConnect
                </span>
              </div>
              <p className="text-cyan-200 max-w-md">
                The most comprehensive estate management platform for modern residential communities. 
                Built for Nigeria, designed for excellence.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-cyan-300">
                <li className="hover:text-cyan-100 cursor-pointer">Features</li>
                <li className="hover:text-cyan-100 cursor-pointer">Pricing</li>
                <li className="hover:text-cyan-100 cursor-pointer">Security</li>
                <li className="hover:text-cyan-100 cursor-pointer">Integrations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-cyan-300">
                <li className="hover:text-cyan-100 cursor-pointer">Help Center</li>
                <li className="hover:text-cyan-100 cursor-pointer">Contact Us</li>
                <li className="hover:text-cyan-100 cursor-pointer">Training</li>
                <li className="hover:text-cyan-100 cursor-pointer">Status</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-cyan-300">
                <li className="hover:text-cyan-100 cursor-pointer">About</li>
                <li className="hover:text-cyan-100 cursor-pointer">Blog</li>
                <li className="hover:text-cyan-100 cursor-pointer">Careers</li>
                <li className="hover:text-cyan-100 cursor-pointer">Press</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700/50 mt-12 pt-8 text-center text-cyan-300">
            <p>&copy; 2024 EstateConnect. All rights reserved. Built with ❤️ for Nigerian estates.</p>
          </div>
        </div>
      </footer>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </div>
  );
};

export default Index;
