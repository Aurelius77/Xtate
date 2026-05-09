import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Shield, UserCheck, Users, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/SecureAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type DemoRole = "admin" | "resident" | "security";

const DEMO_ACCOUNTS: Record<DemoRole, { email: string; password: string; label: string; icon: React.ElementType }> = {
  admin: { email: "demo.admin@estateconnect.app", password: "DemoPass123!", label: "Try as Admin", icon: UserCheck },
  resident: { email: "demo.resident@estateconnect.app", password: "DemoPass123!", label: "Try as Resident", icon: Users },
  security: { email: "demo.security@estateconnect.app", password: "DemoPass123!", label: "Try as Security", icon: Shield },
};

const DemoLoginButtons = () => {
  const { login } = useAuth();
  const { toast } = useToast();
  const [loadingRole, setLoadingRole] = useState<DemoRole | null>(null);

  const handleDemoLogin = async (role: DemoRole) => {
    const account = DEMO_ACCOUNTS[role];
    setLoadingRole(role);
    try {
      // Ensure demo accounts are seeded (idempotent)
      await supabase.functions.invoke("seed-demo-users");
      await login(account.email, account.password);
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
    <div className="mt-10 flex flex-col items-center gap-3">
      <p className="text-sm text-cyan-300/80">Or explore instantly with a demo account</p>
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
              className="border-cyan-500/30 text-cyan-200 hover:bg-cyan-500/10"
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
