import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

type NotificationType = "payment_confirmation" | "complaint_resolved" | "meeting_invite" | "dues_reminder";

type SendNotificationRequest = {
  type?: NotificationType;
  to?: string | string[];
  estateId?: string;
  data?: Record<string, string | number | null | undefined>;
};

const escapeHtml = (value: unknown) =>
  String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[char] as string));

const formatAmount = (amount: unknown) => {
  const numeric = Number(amount);
  return Number.isFinite(numeric) ? `₦${numeric.toLocaleString()}` : String(amount ?? "");
};

const buildEmail = (
  type: NotificationType,
  data: SendNotificationRequest["data"],
  brandName: string,
): { subject: string; html: string } | null => {
  const d = data || {};
  const wrap = (title: string, body: string) => ({
    subject: title,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #111;">
        <h2 style="color: #1d4ed8;">${escapeHtml(brandName)}</h2>
        <h3>${escapeHtml(title)}</h3>
        <div>${body}</div>
        <p style="margin-top: 24px; font-size: 12px; color: #888;">This is an automated message from ${escapeHtml(brandName)} on XTATE.</p>
      </div>
    `,
  });

  switch (type) {
    case "payment_confirmation":
      return wrap(
        "Payment Confirmed",
        `<p>Hi ${escapeHtml(d.residentName)},</p>
         <p>Your payment for <strong>${escapeHtml(d.dueTitle)}</strong> of <strong>${formatAmount(d.amount)}</strong> has been confirmed.</p>
         ${d.receiptUrl ? `<p><a href="${escapeHtml(d.receiptUrl)}">Download your receipt</a></p>` : ""}`,
      );
    case "complaint_resolved":
      return wrap(
        "Complaint Resolved",
        `<p>Hi ${escapeHtml(d.residentName)},</p>
         <p>Your complaint "<strong>${escapeHtml(d.complaintTitle)}</strong>" has been marked as resolved. Reply to this estate if the issue persists.</p>`,
      );
    case "meeting_invite":
      return wrap(
        "New Community Meeting",
        `<p>You're invited to <strong>${escapeHtml(d.meetingTitle)}</strong>.</p>
         <p>Date: ${escapeHtml(d.meetingDate)}</p>
         ${d.description ? `<p>${escapeHtml(d.description)}</p>` : ""}`,
      );
    case "dues_reminder":
      return wrap(
        "Payment Reminder",
        `<p>Hi ${escapeHtml(d.residentName)},</p>
         <p>This is a reminder that <strong>${escapeHtml(d.dueTitle)}</strong> of <strong>${formatAmount(d.amount)}</strong> is due on ${escapeHtml(d.dueDate)}.</p>`,
      );
    default:
      return null;
  }
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);

  try {
    const payload = (await req.json()) as SendNotificationRequest;
    const { type, to, estateId, data } = payload;

    if (!type || !to) {
      return json({ ok: false, error: "type and to are required" }, 400);
    }

    const recipients = Array.isArray(to) ? to.filter(Boolean) : [to];
    if (recipients.length === 0) {
      return json({ ok: false, error: "No valid recipients" });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.warn("send-notification-email: RESEND_API_KEY not set, skipping send", { type, recipients });
      return json({ ok: false, error: "Email delivery is not configured yet" });
    }

    let brandName = "XTATE";
    if (estateId) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
        { auth: { autoRefreshToken: false, persistSession: false } },
      );
      const { data: tenant } = await supabase
        .from("tenants")
        .select("name")
        .eq("estate_id", estateId)
        .maybeSingle();
      if (tenant?.name) brandName = tenant.name;
    }

    const email = buildEmail(type, data, brandName);
    if (!email) return json({ ok: false, error: `Unknown notification type: ${type}` }, 400);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${brandName} <notifications@xtate.app>`,
        to: recipients,
        subject: email.subject,
        html: email.html,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Resend API error", errorText);
      return json({ ok: false, error: "Email provider rejected the request" }, 502);
    }

    return json({ ok: true });
  } catch (error) {
    console.error("send-notification-email error", error);
    return json({ ok: false, error: error instanceof Error ? error.message : "Failed to send notification" }, 500);
  }
});
