import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, UserCheck, Users, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/SecureAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type DemoRole = "admin" | "resident" | "security";

const DEMO_ACCOUNTS: Record<DemoRole, { email: string; password: string; label: string; icon: React.ElementType }> = {
  admin: { email: "demo.admin@xtate.app", password: "DemoPass123!", label: "Try as Admin", icon: UserCheck },
  resident: { email: "demo.resident@xtate.app", password: "DemoPass123!", label: "Try as Resident", icon: Users },
  security: { email: "demo.security@xtate.app", password: "DemoPass123!", label: "Try as Security", icon: Shield },
};

const DemoLoginButtons = () => {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loadingRole, setLoadingRole] = useState<DemoRole | null>(null);

  const handleDemoLogin = async (role: DemoRole) => {
    const account = DEMO_ACCOUNTS[role];
    setLoadingRole(role);
    try {
      // Ensure demo accounts are seeded (idempotent)
      await supabase.functions.invoke("seed-demo-users");
      await login(account.email, account.password);
      navigate("/dashboard");
    } catch (err) {
      toast({
        title: "Demo login failed",
        description: err instanceof Error ? err.message : "Unable to start demo session",
        variant: "destructive",
      });
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm text-slate-400 font-medium">Or explore instantly with a demo account</p>
      <div className="flex flex-wrap justify-center gap-3">
        {(Object.keys(DEMO_ACCOUNTS) as DemoRole[]).map((role) => {
          const { label, icon: Icon } = DEMO_ACCOUNTS[role];
          const isLoading = loadingRole === role;
          return (
            <Button
              key={role}
              variant="outline"
              onClick={() => handleDemoLogin(role)}
              disabled={loadingRole !== null}
              className="border-gray-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold rounded-xl"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
              {label}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default DemoLoginButtons;
