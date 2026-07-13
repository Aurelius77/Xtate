import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type CreateTenantAdminRequest = {
  fullName?: string;
  email?: string;
  password?: string;
  phone?: string;
  estateId?: string;
  tenantId?: string;
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const clean = (value: unknown) =>
  typeof value === "string" ? value.replace(/[<>]/g, "").trim() : "";

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validatePassword = (password: string) => {
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(password)) return "Password must contain uppercase letter";
  if (!/[a-z]/.test(password)) return "Password must contain lowercase letter";
  if (!/[0-9]/.test(password)) return "Password must contain number";
  if (!/[!@#$%^&*]/.test(password)) return "Password must contain special character";
  return null;
};

type RoleRow = { role: "admin" | "resident" | "security" | "super_admin" };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);

  try {
    const authorization = req.headers.get("Authorization") ?? "";
    const token = authorization.replace("Bearer ", "");
    if (!token) return json({ ok: false, error: "Missing authorization token" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    const { data: callerData, error: callerError } = await supabase.auth.getUser(token);
    if (callerError || !callerData.user) return json({ ok: false, error: "Invalid authorization token" }, 401);

    const { data: roles, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", callerData.user.id);
    if (roleError) throw roleError;

    const isSuperAdmin = ((roles ?? []) as RoleRow[]).some((row) => row.role === "super_admin");
    if (!isSuperAdmin) return json({ ok: false, error: "Only super admins can create tenant admin accounts" }, 403);

    const payload = (await req.json()) as CreateTenantAdminRequest;
    const fullName = clean(payload.fullName);
    const email = clean(payload.email).toLowerCase();
    const password = typeof payload.password === "string" ? payload.password : "";
    const phone = clean(payload.phone);
    const estateId = clean(payload.estateId);
    const tenantId = clean(payload.tenantId);

    if (fullName.length < 2) return json({ ok: false, error: "Full name must be at least 2 characters" });
    if (!isValidEmail(email)) return json({ ok: false, error: "Invalid email format" });
    const passwordError = validatePassword(password);
    if (passwordError) return json({ ok: false, error: passwordError });
    if (!estateId) return json({ ok: false, error: "estateId is required" });

    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        phone,
        estate_id: estateId,
        tenant_id: tenantId,
        role: "admin",
      },
    });

    if (createError) {
      const message = createError.message.toLowerCase();
      if (message.includes("already") || message.includes("registered") || message.includes("exists")) {
        return json({ ok: false, error: "An account with this email already exists" });
      }
      throw createError;
    }
    const userId = created.user?.id;
    if (!userId) throw new Error("Supabase did not return a created user id");

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: userId,
      email,
      full_name: fullName,
      phone,
      estate_id: estateId,
      updated_at: new Date().toISOString(),
    });
    if (profileError) throw profileError;

    const { error: deleteRoleError } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId);
    if (deleteRoleError) throw deleteRoleError;

    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({ user_id: userId, role: "admin" });
    if (roleError) throw roleError;

    return json({ ok: true, userId, email });
  } catch (error) {
    console.error("create-tenant-admin error", error);
    return json({ ok: false, error: error instanceof Error ? error.message : "Admin account creation failed" });
  }
});
