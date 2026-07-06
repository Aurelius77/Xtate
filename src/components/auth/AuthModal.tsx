
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/SecureAuthContext";
import { useTenant } from "@/contexts/TenantContext";
import ForgotPasswordDialog from "./ForgotPasswordDialog";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'register';
  onModeChange: (mode: 'login' | 'register') => void;
}

const AuthModal = ({ isOpen, onClose, mode, onModeChange }: AuthModalProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const { toast } = useToast();
  const { login, register } = useAuth();
  const { tenantId, tenantSlug } = useTenant();
  const navigate = useNavigate();

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  const [registerForm, setRegisterForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    houseUnit: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(loginForm.email, loginForm.password);
      onClose();
      navigate('/dashboard');
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerForm.password !== registerForm.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Please ensure passwords match",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await register({
        ...registerForm,
        tenantId: tenantId || undefined,
        tenantSlug: tenantSlug || undefined,
      });
      onClose();
      if (result.needsEmailConfirmation) {
        onModeChange('login');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Unable to create account",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "h-12 border-gray-100 bg-gray-50 rounded-xl font-semibold text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-100 focus-visible:ring-offset-0";
  const labelClass = "text-[11px] font-bold text-gray-400 uppercase tracking-wider";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border-none rounded-3xl shadow-2xl p-8">
        <DialogHeader>
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Shield className="text-white h-6 w-6" />
            </div>
          </div>
          <DialogTitle className="text-center font-display text-2xl font-bold text-slate-900 tracking-tight">
            Welcome to XTATE
          </DialogTitle>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(value) => onModeChange(value as 'login' | 'register')}>
          <TabsList className="grid w-full grid-cols-2 bg-gray-50 rounded-xl h-12 p-1">
            <TabsTrigger
              value="login"
              className="rounded-lg font-bold text-slate-400 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className="rounded-lg font-bold text-slate-400 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
            >
              Register
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className={labelClass}>Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  className={inputClass}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className={labelClass}>Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className={inputClass}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 text-slate-400 hover:bg-transparent hover:text-slate-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                  onClick={() => setForgotPasswordOpen(true)}
                >
                  Forgot password?
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="register" className="mt-6">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className={labelClass}>Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  value={registerForm.fullName}
                  onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                  className={inputClass}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className={labelClass}>Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  className={inputClass}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className={labelClass}>Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={registerForm.phone}
                  onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                  className={inputClass}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="houseUnit" className={labelClass}>House/Unit Number</Label>
                <Input
                  id="houseUnit"
                  placeholder="e.g., Block A, Flat 3"
                  value={registerForm.houseUnit}
                  onChange={(e) => setRegisterForm({ ...registerForm, houseUnit: e.target.value })}
                  className={inputClass}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className={labelClass}>Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    className={inputClass}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 text-slate-400 hover:bg-transparent hover:text-slate-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className={labelClass}>Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                  className={inputClass}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>

              <Card className="border-amber-100 bg-amber-50 rounded-2xl">
                <CardContent className="pt-4">
                  <div className="flex items-center space-x-2 text-amber-800">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm font-bold">Resident Account</span>
                  </div>
                  <p className="text-xs text-amber-700 mt-1">
                    All public registrations create resident accounts. Admin and security roles are
                    granted by an estate super admin via invitation.
                  </p>
                </CardContent>
              </Card>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>

      <ForgotPasswordDialog isOpen={forgotPasswordOpen} onClose={() => setForgotPasswordOpen(false)} />
    </Dialog>
  );
};

export default AuthModal;
