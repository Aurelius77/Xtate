import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

type DueRow = {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  due_date: string;
  frequency: "one_time" | "monthly" | "quarterly" | "annually";
  estate_id: string | null;
  next_run_date: string | null;
};

const addInterval = (dateStr: string, frequency: DueRow["frequency"]) => {
  const date = new Date(`${dateStr}T00:00:00Z`);
  switch (frequency) {
    case "monthly":
      date.setUTCMonth(date.getUTCMonth() + 1);
      break;
    case "quarterly":
      date.setUTCMonth(date.getUTCMonth() + 3);
      break;
    case "annually":
      date.setUTCFullYear(date.getUTCFullYear() + 1);
      break;
    default:
      return null;
  }
  return date.toISOString().slice(0, 10);
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);

  const cronSecret = Deno.env.get("CRON_SECRET");
  if (!cronSecret || req.headers.get("x-cron-secret") !== cronSecret) {
    return json({ ok: false, error: "Unauthorized" }, 401);
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const today = new Date().toISOString().slice(0, 10);

    const { data: dueRows, error: dueError } = await supabase
      .from("dues")
      .select("id, title, description, amount, due_date, frequency, estate_id, next_run_date")
      .eq("is_active", true)
      .not("frequency", "eq", "one_time")
      .not("next_run_date", "is", null)
      .lte("next_run_date", today);

    if (dueError) throw dueError;

    const results: Array<{ dueId: string; newDueId: string; residentsAssigned: number }> = [];

    for (const due of (dueRows ?? []) as DueRow[]) {
      if (!due.estate_id || !due.next_run_date) continue;

      const periodDueDate = due.next_run_date;
      const nextRunDate = addInterval(periodDueDate, due.frequency);

      const { data: newDue, error: insertDueError } = await supabase
        .from("dues")
        .insert({
          title: due.title,
          description: due.description,
          amount: due.amount,
          due_date: periodDueDate,
          frequency: due.frequency,
          estate_id: due.estate_id,
          is_active: true,
          next_run_date: nextRunDate,
          last_generated_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (insertDueError) {
        console.error("Failed to create recurring due instance", due.id, insertDueError);
        continue;
      }

      // Hand the recurrence baton to the new row so this template doesn't regenerate again.
      await supabase.from("dues").update({ next_run_date: null }).eq("id", due.id);

      const { data: residents, error: residentsError } = await supabase
        .from("residents")
        .select("id, user_id")
        .eq("estate_id", due.estate_id)
        .eq("is_active", true);

      if (residentsError) {
        console.error("Failed to load residents for recurring due", due.id, residentsError);
        continue;
      }

      if (residents && residents.length > 0) {
        await supabase.from("resident_dues").insert(
          residents.map((resident) => ({
            due_id: newDue.id,
            resident_id: resident.id,
            estate_id: due.estate_id,
            amount: due.amount,
            status: "pending",
          })),
        );

        const userIds = residents.map((r) => r.user_id).filter(Boolean);
        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("full_name, email")
            .in("id", userIds);

          for (const profile of profiles ?? []) {
            if (!profile.email) continue;
            try {
              await supabase.functions.invoke("send-notification-email", {
                body: {
                  type: "dues_reminder",
                  to: profile.email,
                  estateId: due.estate_id,
                  data: {
                    residentName: profile.full_name || "Resident",
                    dueTitle: due.title,
                    amount: due.amount,
                    dueDate: periodDueDate,
                  },
                },
              });
            } catch (emailError) {
              console.error("send-notification-email failed for recurring due", due.id, emailError);
            }
          }
        }
      }

      results.push({ dueId: due.id, newDueId: newDue.id, residentsAssigned: residents?.length ?? 0 });
    }

    return json({ ok: true, generated: results.length, results });
  } catch (error) {
    console.error("generate-recurring-dues error", error);
    return json({ ok: false, error: error instanceof Error ? error.message : "Failed to generate recurring dues" }, 500);
  }
});
