import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ReminderRequest {
  email: string;
  supplements: string[];
  reminderTime: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const resend = new Resend(apiKey);
    const { email, supplements, reminderTime }: ReminderRequest = await req.json();

    if (!email || !supplements?.length) {
      throw new Error("Missing required fields: email and supplements");
    }

    const supplementList = supplements.map(s => `<li>${s}</li>`).join("");

    const emailResponse = await resend.emails.send({
      from: "Supplements <noreply@lovable.app>",
      to: [email],
      subject: `💊 Supplement Reminder - ${reminderTime}`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
          <h2>Time to take your supplements!</h2>
          <p>Here's your ${reminderTime} supplement schedule:</p>
          <ul>${supplementList}</ul>
          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            Stay consistent for better results. You can manage your reminders in the app.
          </p>
        </div>
      `,
    });

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending reminder email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
