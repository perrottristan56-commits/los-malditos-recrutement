(() => {
  const form = document.querySelector("#application-form");
  const status = document.querySelector("#form-status");
  const cfg = window.LM_CONFIG || {};

  if (!form || !status) {
    console.error("Formulaire ou zone de message introuvable.");
    return;
  }

  const configured =
    cfg.SUPABASE_URL &&
    !cfg.SUPABASE_URL.includes("VOTRE-PROJET") &&
    cfg.SUPABASE_ANON_KEY &&
    !cfg.SUPABASE_ANON_KEY.includes("VOTRE_CLE");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!configured) {
      status.textContent =
        "Configuration manquante : vérifie config.js.";
      status.className = "form-status error";
      return;
    }

    if (!window.supabase?.createClient) {
      status.textContent =
        "La bibliothèque Supabase n'a pas été chargée. Recharge la page.";
      status.className = "form-status error";
      console.error("Bibliothèque Supabase indisponible.");
      return;
    }

    if (
      !form.elements.rules_accepted?.checked ||
      !form.elements.privacy_accepted?.checked
    ) {
      status.textContent =
        "Tu dois accepter le règlement et la politique de confidentialité.";
      status.className = "form-status error";
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    const button = form.querySelector('button[type="submit"]');

    if (button) button.disabled = true;

    status.textContent = "Envoi en cours…";
    status.className = "form-status";

    try {
      const client = window.supabase.createClient(
        cfg.SUPABASE_URL,
        cfg.SUPABASE_ANON_KEY
      );

      const { error } = await client
        .from("applications")
        .insert({
          rp_name: data.rp_name,
          rp_age: Number(data.rp_age),
          discord_tag: data.discord_tag,
          game_id: data.game_id || null,
          backstory: data.backstory,
          motivation: data.motivation,
          experience: data.experience,
          roleplay_answer: data.roleplay_answer,
          availability: data.availability,
          has_mic: data.has_mic,
          conflict: data.conflict,
          rules_accepted: true,
          privacy_accepted: true
        });

      if (error) {
        console.error("Erreur Supabase :", error);
        throw error;
      }

      form.reset();

      status.textContent =
        "Candidature envoyée ! Merci, l’équipe Los Malditos l’étudiera dès que possible.";
      status.className = "form-status success";

    } catch (error) {
      console.error("Échec de l'envoi :", error);

      const message = error?.message || String(error);

      status.textContent =
        "Échec de l'envoi : " + message;

      status.className = "form-status error";

    } finally {
      if (button) button.disabled = false;
    }
  });
})();
```
