// Déployer avec Supabase CLI. Configure DISCORD_WEBHOOK_URL comme secret côté Supabase.
// Le webhook n'est jamais placé dans le code public du site.
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const webhook = Deno.env.get("DISCORD_WEBHOOK_URL");
  if (!webhook) return new Response("Not configured", { status: 503 });
  // Ne pas accepter de texte arbitraire depuis le navigateur; notification générique uniquement.
  try {
    await req.json(); // validate JSON body
    const response = await fetch(webhook, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "📩 Une nouvelle candidature Los Malditos a été déposée. Consultez l’espace staff sécurisé." })
    });
    if (!response.ok) return new Response("Discord notification failed", { status: 502 });
    return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
  } catch {
    return new Response("Bad request", { status: 400 });
  }
});