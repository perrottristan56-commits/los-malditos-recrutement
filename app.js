(() => {
  const form = document.querySelector("#application-form");
  const status = document.querySelector("#form-status");
  const cfg = window.LM_CONFIG || {};
  const configured = cfg.SUPABASE_URL && !cfg.SUPABASE_URL.includes("VOTRE-PROJET") &&
    cfg.SUPABASE_ANON_KEY && !cfg.SUPABASE_ANON_KEY.includes("VOTRE_CLE");
  if (!form) return;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!configured) { status.textContent = "Configuration manquante : ajoute l’URL et la clé publique Supabase dans config.js."; status.className = "form-status error"; return; }
    const data = Object.fromEntries(new FormData(form).entries());
    if (!form.elements.rules_accepted.checked || !form.elements.privacy_accepted.checked) return;
    data.rules_accepted = true; data.privacy_accepted = true;
    // Honeypot is deliberately absent from the visible form; server-side protections are still recommended.
    const client = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
    const button = form.querySelector("button[type=submit]");
    button.disabled = true; status.textContent = "Envoi en cours…"; status.className = "form-status";
    try {
      const { data: inserted, error } = await client.from("applications").insert({
        rp_name: data.rp_name, rp_age: Number(data.rp_age), discord_tag: data.discord_tag,
        game_id: data.game_id || null, backstory: data.backstory, motivation: data.motivation,
        experience: data.experience, roleplay_answer: data.roleplay_answer,
        availability: data.availability, has_mic: data.has_mic,
        conflict: data.conflict, rules_accepted: true, privacy_accepted: true
      }).select("id").single();
      if (error) throw error;
      if (cfg.DISCORD_FUNCTION_URL) {
        // Notification is best-effort; webhook secret stays inside the Edge Function.
        try { await fetch(cfg.DISCORD_FUNCTION_URL, { method: "POST", headers: {"Content-Type":"application/json", "apikey":cfg.SUPABASE_ANON_KEY}, body: JSON.stringify({ application_id: inserted.id }) }); } catch (_) {}
      }
      form.reset(); status.textContent = "Candidature envoyée. Merci, l’équipe Los Malditos l’étudiera dès que possible."; status.className = "form-status success";
    } catch (err) {
      console.error(err); status.textContent = "Impossible d’envoyer la candidature. Vérifie la configuration puis réessaie."; status.className = "form-status error";
    } finally { button.disabled = false; }
  });
})();