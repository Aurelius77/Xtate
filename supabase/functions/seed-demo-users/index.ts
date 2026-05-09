// Seeds demo accounts for landing-page demo login buttons.
// Idempotent: safe to call repeatedly. Returns ok once accounts exist.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Role = "admin" | "resident" | "security";

const DEMO_USERS: Array<{
  email: string;
  password: string;
  full_name: string;
  role: Role;
  house_unit?: string;
}> = [
  { email: "demo.admin@estateconnect.app", password: "DemoPass123!", full_name: "Demo Admin", role: "admin" },
  { email: "demo.resident@estateconnect.app", password: "DemoPass123!", full_name: "Demo Resident", role: "resident", house_unit: "B12" },
  { email: "demo.security@estateconnect.app", password: "DemoPass123!", full_name: "Demo Security", role: "security" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    for (const u of DEMO_USERS) {
      // Check if already exists
      const { data: list } = await supabase.auth.admin.listUsers();
      const existing = list?.users?.find((x) => x.email?.toLowerCase() === u.email);

      if (!existing) {
        const { error } = await supabase.auth.admin.createUser({
          email: u.email,
          password: u.password,
          email_confirm: true,
          user_metadata: {
            full_name: u.full_name,
            phone: "",
            role: u.role,
            house_unit: u.house_unit ?? "",
          },
        });
        if (error && !`${error.message}`.toLowerCase().includes("already")) {
          throw error;
        }
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("seed-demo-users error", e);
    return new Response(JSON.stringify({ ok: false, error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
