
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, CreditCard, Calendar, MessageSquare, Shield, Smartphone } from "lucide-react";
import AuthModal from "@/components/auth/AuthModal";

const Index = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const features = [
    {
      title: "Resident Management",
      description: "Comprehensive resident database with profile management and unit assignments",
      icon: Users,
      color: "bg-blue-100 text-blue-600"
    },
    {
      title: "Smart Dues Management",
      description: "Automated billing, payment tracking, and Paystack integration for seamless transactions",
      icon: CreditCard,
      color: "bg-emerald-100 text-emerald-600"
    },
    {
      title: "Meeting & Attendance",
      description: "Schedule meetings and track attendance with real-time participation monitoring",
      icon: Calendar,
      color: "bg-purple-100 text-purple-600"
    },
    {
      title: "Communication Hub",
      description: "Announcements, complaints management, and document sharing platform",
      icon: MessageSquare,
      color: "bg-orange-100 text-orange-600"
    },
    {
      title: "Secure & Reliable",
      description: "Role-based access control with enterprise-grade security measures",
      icon: Shield,
      color: "bg-red-100 text-red-600"
    },
    {
      title: "Mobile Responsive",
      description: "Fully optimized for mobile devices with intuitive user experience",
      icon: Smartphone,
      color: "bg-indigo-100 text-indigo-600"
    }
  ];

  const handleAuthClick = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* Header */}
      <header className="border-b bg-white/70 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">EC</span>
            </div>
            <span className="font-bold text-xl text-gray-900">EstateConnect</span>
          </div>
          <div className="space-x-2">
            <Button variant="ghost" onClick={() => handleAuthClick('login')}>
              Sign In
            </Button>
            <Button onClick={() => handleAuthClick('register')} className="bg-blue-600 hover:bg-blue-700">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <Badge variant="secondary" className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-100">
          Modern Estate Management Solution
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Transform Your Estate
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600">
            {" "}Management
          </span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
          Streamline dues collection, attendance tracking, and community communication 
          with our comprehensive digital platform designed for modern residential estates.
        </p>
        <div className="space-x-4">
          <Button size="lg" onClick={() => handleAuthClick('register')} className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3">
            Start Free Trial
          </Button>
          <Button size="lg" variant="outline" className="text-lg px-8 py-3">
            Watch Demo
          </Button>
        </div>
        
        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">500+</div>
            <div className="text-gray-600">Estates Managed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">10K+</div>
            <div className="text-gray-600">Residents</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">₦50M+</div>
            <div className="text-gray-600">Dues Collected</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">99%</div>
            <div className="text-gray-600">Uptime</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Manage Your Estate
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to simplify estate management and enhance resident experience
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl text-gray-900">{feature.title}</CardTitle>
                <CardDescription className="text-gray-600 leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Modernize Your Estate?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join hundreds of estates already using EstateConnect to streamline their operations
          </p>
          <Button size="lg" variant="secondary" onClick={() => handleAuthClick('register')} className="text-lg px-8 py-3">
            Get Started Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">EC</span>
                </div>
                <span className="font-bold text-xl">EstateConnect</span>
              </div>
              <p className="text-gray-400">
                Modern estate management for the digital age
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Features</li>
                <li>Pricing</li>
                <li>Security</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Status</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 EstateConnect. All rights reserved.</p>
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
