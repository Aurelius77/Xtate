import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const DEFAULT_ESTATE_ID = "00000000-0000-0000-0000-000000000001";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type CreateResidentRequest = {
  fullName?: string;
  email?: string;
  password?: string;
  phone?: string;
  houseUnit?: string;
  tenantId?: string;
  tenantSlug?: string;
};

type TenantRow = {
  id: string;
  estate_id: string | null;
  name: string;
  slug: string;
  status: "active" | "suspended" | "inactive";
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

const findUserByEmail = async (
  supabase: ReturnType<typeof createClient>,
  email: string,
) => {
  let page = 1;
  const perPage = 1000;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const user = data.users.find((candidate) => candidate.email?.toLowerCase() === email);
    if (user) return user;
    if (data.users.length < perPage) return null;

    page += 1;
  }
};

const resolveTenant = async (
  supabase: ReturnType<typeof createClient>,
  tenantId: string,
  tenantSlug: string,
) => {
  if (!tenantId && !tenantSlug) {
    return {
      tenant: null,
      estateId: DEFAULT_ESTATE_ID,
    };
  }

  let query = supabase
    .from("tenants")
    .select("id, estate_id, name, slug, status");

  query = tenantId ? query.eq("id", tenantId) : query.eq("slug", tenantSlug);

  const { data, error } = await query.maybeSingle();
  const tenant = data as TenantRow | null;
  if (error) throw error;
  if (!tenant) throw new Error("Tenant not found");
  if (tenant.status !== "active") throw new Error("This estate is not accepting registrations");
  if (!tenant.estate_id) throw new Error("Tenant is not linked to an estate");

  return {
    tenant,
    estateId: tenant.estate_id,
  };
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const payload = (await req.json()) as CreateResidentRequest;
    const fullName = clean(payload.fullName);
    const email = clean(payload.email).toLowerCase();
    const password = typeof payload.password === "string" ? payload.password : "";
    const phone = clean(payload.phone);
    const houseUnit = clean(payload.houseUnit);
    const tenantId = clean(payload.tenantId);
    const tenantSlug = clean(payload.tenantSlug).toLowerCase();

    if (fullName.length < 2) return json({ ok: false, error: "Full name must be at least 2 characters" });
    if (!isValidEmail(email)) return json({ ok: false, error: "Invalid email format" });
    const passwordError = validatePassword(password);
    if (passwordError) return json({ ok: false, error: passwordError });
    if (!houseUnit) return json({ ok: false, error: "House/unit number is required" });

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

    const { tenant, estateId } = await resolveTenant(supabase, tenantId, tenantSlug);

    const existing = await findUserByEmail(supabase, email);
    if (existing) return json({ ok: false, error: "An account with this email already exists" });

    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        phone,
        house_unit: houseUnit,
        tenant_id: tenant?.id ?? "",
        tenant_slug: tenant?.slug ?? "",
        estate_id: estateId,
      },
    });

    if (createError) throw createError;
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
      .insert({ user_id: userId, role: "resident" });
    if (roleError) throw roleError;

    const { error: residentError } = await supabase.from("residents").upsert(
      {
        user_id: userId,
        house_unit_number: houseUnit,
        estate_id: estateId,
        is_active: true,
      },
      { onConflict: "user_id" },
    );
    if (residentError) throw residentError;

    return json({
      ok: true,
      userId,
      email,
      role: "resident",
      tenantId: tenant?.id ?? null,
      tenantSlug: tenant?.slug ?? null,
      estateId,
    });
  } catch (error) {
    console.error("create-resident-account error", error);
    return json({ ok: false, error: error instanceof Error ? error.message : "Account creation failed" });
  }
});
