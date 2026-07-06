import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Users, CreditCard, Calendar, MessageSquare, Shield,
  DollarSign, Megaphone, UserCheck, Building, Star, ArrowRight
} from "lucide-react";
import AuthModal from "@/components/auth/AuthModal";
import PWAInstallPrompt from "@/components/pwa/PWAInstallPrompt";
import PricingSection from "@/components/landing/PricingSection";
import DashboardPreview from "@/components/landing/DashboardPreview";
import DemoLoginButtons from "@/components/landing/DemoLoginButtons";
import { ConnectionStatus, SecurityRecommendations } from "@/components/security/SecurityAlert";

const Index = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const features = [
    {
      title: "Smart Resident Management",
      description: "Complete resident profiles, unit management, and detailed emergency contacts with vehicle tracking",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Automated Dues & Payments",
      description: "Streamlined billing system with automated reminders, payment tracking, and financial reporting",
      icon: CreditCard,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Meeting & Attendance Tracking",
      description: "Schedule meetings, track attendance, and maintain comprehensive participation records",
      icon: Calendar,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      title: "Advanced Complaint Management",
      description: "Full complaint lifecycle with image/video support, admin responses, and status tracking",
      icon: MessageSquare,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      title: "Visitor Access Control",
      description: "Generate secure access codes for visitors with real-time verification and security monitoring",
      icon: Shield,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      title: "Expense Management",
      description: "Track estate expenses, categorize spending, generate reports, and manage approval workflows",
      icon: DollarSign,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Broadcast Messaging",
      description: "Send announcements, urgent alerts, and community updates to all residents instantly",
      icon: Megaphone,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      title: "Multi-Role Dashboard",
      description: "Specialized interfaces for admins, residents, and security personnel with role-based access",
      icon: UserCheck,
      color: "text-teal-600",
      bg: "bg-teal-50",
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Estate Manager",
      estate: "Lekki Gardens",
      comment: "XTATE has transformed how we manage our 200+ unit estate. The automated dues collection alone has saved us countless hours.",
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

  const stats = [
    { value: "500+", label: "Estates Managed" },
    { value: "25K+", label: "Happy Residents" },
    { value: "₦2B+", label: "Dues Collected" },
    { value: "99.9%", label: "Uptime" },
  ];

  const handleAuthClick = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-white font-body text-slate-600">
      {/* Security Recommendations (dev-mode only) */}
      <div className="px-4 pt-4">
        <SecurityRecommendations />
      </div>

      {/* Header */}
      <header className="border-b border-gray-100 bg-white/90 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-sm">
              <Building className="text-white h-5 w-5" />
            </div>
            <span className="font-display font-bold text-2xl text-slate-900 tracking-tight">
              XTATE
            </span>
          </div>
          <div className="flex items-center space-x-6">
            <div className="hidden md:block">
              <ConnectionStatus />
            </div>

            <div className="space-x-2">
              <Button
                variant="ghost"
                onClick={() => handleAuthClick('login')}
                className="text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-semibold"
              >
                Sign In
              </Button>
              <Button
                onClick={() => handleAuthClick('register')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-600/20 rounded-xl"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/60 via-white to-white pointer-events-none" />
        <div className="absolute -top-40 right-0 h-96 w-96 rounded-full bg-blue-100/50 blur-3xl pointer-events-none" />

        <div className="relative container mx-auto px-4 py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-sm font-semibold">
            <Building className="h-3.5 w-3.5" />
            Complete Estate Management Solution
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold text-slate-900 mb-8 leading-[1.05] tracking-tight">
            Modern Estate
            <span className="text-blue-600"> Management</span>
            <br />Made Simple
          </h1>

          <p className="text-lg md:text-xl text-slate-500 mb-12 max-w-3xl mx-auto leading-relaxed">
            Transform your residential estate with our comprehensive digital platform.
            From automated dues collection to visitor access control, everything you need in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-14">
            <Button
              size="lg"
              onClick={() => handleAuthClick('register')}
              className="bg-blue-600 hover:bg-blue-700 text-white text-base font-bold px-10 h-14 rounded-2xl shadow-xl shadow-blue-600/20 transition-all hover:scale-[1.02]"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base font-bold px-10 h-14 rounded-2xl border-gray-200 bg-white text-slate-700 hover:bg-slate-50"
            >
              Watch Demo
            </Button>
          </div>

          <DemoLoginButtons />

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mt-20 pt-12 border-t border-gray-100">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-4xl font-bold text-slate-900 mb-1">{stat.value}</div>
                <div className="text-sm font-semibold text-slate-400 uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-3">Platform Features</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
            Everything You Need for Modern Estate Management
          </h2>
          <p className="text-lg text-slate-500">
            Comprehensive features designed to streamline operations and enhance the resident experience
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <CardHeader className="p-8">
                <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-5`}>
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {feature.description}
                </p>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <DashboardPreview />

      {/* Pricing Section */}
      <PricingSection />

      {/* Testimonials */}
      <section className="bg-slate-50/70 py-24 border-y border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-slate-900 mb-4 tracking-tight">
              Trusted by Estate Managers Across Nigeria
            </h2>
            <p className="text-lg text-slate-500">See what our users are saying</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="bg-white rounded-3xl border border-gray-100 shadow-sm">
                <CardContent className="p-8">
                  <div className="flex mb-4 gap-0.5">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-amber-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-600 mb-6 leading-relaxed">&ldquo;{testimonial.comment}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-600">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{testimonial.name}</p>
                      <p className="text-slate-400 text-xs font-medium">{testimonial.role} &middot; {testimonial.estate}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Ready to Transform Your Estate?
          </h2>
          <p className="text-lg mb-10 text-blue-100 max-w-2xl mx-auto">
            Join hundreds of estates already using XTATE to streamline operations,
            enhance security, and improve resident satisfaction.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => handleAuthClick('register')}
              className="text-base font-bold px-10 h-14 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 shadow-xl"
            >
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base font-bold px-10 h-14 rounded-2xl border-white/30 bg-transparent text-white hover:bg-white/10"
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-5 gap-10">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-5">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
                  <Building className="text-white h-5 w-5" />
                </div>
                <span className="font-display font-bold text-2xl text-slate-900 tracking-tight">
                  XTATE
                </span>
              </div>
              <p className="text-slate-500 max-w-md leading-relaxed">
                The most comprehensive estate management platform for modern residential communities.
                Built for Nigeria, designed for excellence.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wide">Product</h4>
              <ul className="space-y-3 text-slate-500 text-sm font-medium">
                <li className="hover:text-blue-600 cursor-pointer transition-colors">Features</li>
                <li className="hover:text-blue-600 cursor-pointer transition-colors">Pricing</li>
                <li className="hover:text-blue-600 cursor-pointer transition-colors">Security</li>
                <li className="hover:text-blue-600 cursor-pointer transition-colors">Integrations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wide">Support</h4>
              <ul className="space-y-3 text-slate-500 text-sm font-medium">
                <li className="hover:text-blue-600 cursor-pointer transition-colors">Help Center</li>
                <li className="hover:text-blue-600 cursor-pointer transition-colors">Contact Us</li>
                <li className="hover:text-blue-600 cursor-pointer transition-colors">Training</li>
                <li className="hover:text-blue-600 cursor-pointer transition-colors">Status</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wide">Company</h4>
              <ul className="space-y-3 text-slate-500 text-sm font-medium">
                <li className="hover:text-blue-600 cursor-pointer transition-colors">About</li>
                <li className="hover:text-blue-600 cursor-pointer transition-colors">Blog</li>
                <li className="hover:text-blue-600 cursor-pointer transition-colors">Careers</li>
                <li className="hover:text-blue-600 cursor-pointer transition-colors">Press</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 mt-12 pt-8 text-center text-slate-400 text-sm">
            <p>&copy; 2026 XTATE. All rights reserved. Built for Nigerian estates.</p>
          </div>
        </div>
      </footer>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />

      <PWAInstallPrompt />
    </div>
  );
};

export default Index;
