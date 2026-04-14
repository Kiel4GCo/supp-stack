import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
        status: 500, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const resend = new Resend(apiKey);

    // Get current time and day of week
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = dayNames[now.getDay()];

    // Find users whose reminder time is within 15-minute window
    const [hours, minutes] = currentTime.split(':').map(Number);
    const windowStart = `${String(hours).padStart(2, '0')}:${String(Math.max(0, minutes - 15)).padStart(2, '0')}`;

    const { data: prefs, error: prefsError } = await supabase
      .from('email_reminder_preferences')
      .select('*')
      .eq('enabled', true)
      .gte('reminder_time', windowStart)
      .lte('reminder_time', currentTime)
      .contains('days_of_week', [currentDay]);

    if (prefsError) throw prefsError;
    if (!prefs?.length) {
      return new Response(JSON.stringify({ message: "No reminders to send", count: 0 }), {
        status: 200, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    let sent = 0;
    for (const pref of prefs) {
      // Get user's saved stack items
      const { data: stacks } = await supabase
        .from('saved_stacks')
        .select('id')
        .eq('user_id', pref.user_id)
        .limit(1);

      if (!stacks?.length) continue;

      const { data: items } = await supabase
        .from('saved_stack_items')
        .select('supplement:supplements(name)')
        .eq('stack_id', stacks[0].id);

      if (!items?.length) continue;

      const supplementNames = items.map((i: any) => i.supplement?.name).filter(Boolean);
      if (!supplementNames.length) continue;

      const supplementList = supplementNames.map((s: string) => `<li>${s}</li>`).join("");

      await resend.emails.send({
        from: "Supplements <noreply@lovable.app>",
        to: [pref.email],
        subject: `💊 Supplement Reminder - ${pref.reminder_time}`,
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
            <h2>Time to take your supplements!</h2>
            <p>Here's your ${pref.reminder_time} supplement schedule:</p>
            <ul>${supplementList}</ul>
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              Stay consistent for better results.
            </p>
          </div>
        `,
      });

      // Update last_sent_at
      await supabase
        .from('email_reminder_preferences')
        .update({ last_sent_at: new Date().toISOString() })
        .eq('id', pref.id);

      sent++;

    return new Response(JSON.stringify({ message: `Sent ${sent} reminders`, count: sent }), {
      status: 200, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error processing reminders:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
