import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ExtractRequest {
  file_path: string; // path within bloodwork-uploads bucket
  mime_type: string;
}

const SYSTEM_PROMPT = `You extract lab/blood-work data from medical reports.
Return ONLY structured data. Use the report's reference ranges when present.
If a marker is not in the document, do not invent it. Dates must be ISO (YYYY-MM-DD).
Common marker keys to use when matching: vitamin_d, vitamin_b12, folate, ferritin, iron,
magnesium, zinc, calcium, tsh, hemoglobin, hba1c, hdl, ldl, triglycerides, omega_3_index.
If a marker doesn't match these keys, leave key empty and provide a clean name.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Unauthorized" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) return json({ error: "Unauthorized" }, 401);

    const { file_path, mime_type } = (await req.json()) as ExtractRequest;
    if (!file_path || typeof file_path !== "string" || file_path.length > 500) {
      return json({ error: "Invalid file_path" }, 400);
    }
    // Enforce the user can only extract from their own folder
    if (!file_path.startsWith(`${user.id}/`)) {
      return json({ error: "Forbidden" }, 403);
    }

    // Download the file via service-role to read bytes (bucket is private)
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);
    const { data: fileData, error: dlErr } = await admin.storage
      .from("bloodwork-uploads")
      .download(file_path);
    if (dlErr || !fileData) return json({ error: "File not found" }, 404);

    const arrayBuf = await fileData.arrayBuffer();
    const b64 = base64Encode(new Uint8Array(arrayBuf));
    const dataUrl = `data:${mime_type || fileData.type || "application/octet-stream"};base64,${b64}`;

    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) return json({ error: "AI not configured" }, 500);

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: "Extract all lab markers, values, units, reference ranges, and the test date from this report." },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "submit_bloodwork",
              description: "Return parsed blood work",
              parameters: {
                type: "object",
                properties: {
                  test_date: { type: "string", description: "ISO date YYYY-MM-DD" },
                  lab_name: { type: "string" },
                  markers: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        key: { type: "string", description: "Catalog key if known, else empty" },
                        name: { type: "string" },
                        value: { type: "number" },
                        unit: { type: "string" },
                        range_low: { type: "number" },
                        range_high: { type: "number" },
                      },
                      required: ["name", "value", "unit"],
                    },
                  },
                },
                required: ["markers"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "submit_bloodwork" } },
      }),
    });

    if (!aiResp.ok) {
      const txt = await aiResp.text();
      if (aiResp.status === 429) return json({ error: "Rate limit, try again shortly" }, 429);
      if (aiResp.status === 402) return json({ error: "AI credits exhausted" }, 402);
      return json({ error: `AI error: ${txt.slice(0, 300)}` }, 500);
    }

    const payload = await aiResp.json();
    const toolCall = payload?.choices?.[0]?.message?.tool_calls?.[0];
    const args = toolCall?.function?.arguments;
    if (!args) return json({ error: "No structured result" }, 500);
    const parsed = typeof args === "string" ? JSON.parse(args) : args;

    return json({ ok: true, extracted: parsed });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function base64Encode(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}