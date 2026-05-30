import { useEffect, useState } from "react";

import monSiteLogo from "../assets/mon-site-logo.png";
import ThemeToggle from "./ThemeToggle";

export default function LoginForm({
  appName = "Pense-bête",
  error = "",
  onSubmit,
  pending,
  status = "anonymous",
  theme = "dark",
  onThemeChange,
}) {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [capsLockOn, setCapsLockOn] = useState(false);

  useEffect(() => {
    function syncCapsLock(event) {
      if (event.key === "CapsLock") {
        if (event.type === "keyup") {
          setCapsLockOn((current) => !current);
        }
        return;
      }

      setCapsLockOn(Boolean(event.getModifierState?.("CapsLock")));
    }

    document.addEventListener("keydown", syncCapsLock, true);
    document.addEventListener("keyup", syncCapsLock, true);

    return () => {
      document.removeEventListener("keydown", syncCapsLock, true);
      document.removeEventListener("keyup", syncCapsLock, true);
    };
  }, []);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (pending || status === "checking") {
      return;
    }

    onSubmit(form);
  }

  return (
    <section className="login-shell">
      <article className="login-card">
        <div className="login-head">
          <img className="login-logo" src={monSiteLogo} alt="mon-site.ca" />
          <ThemeToggle
            className="login-theme-toggle"
            onChange={onThemeChange}
            theme={theme}
          />
        </div>
        <p className="eyebrow">{appName}</p>
        <h1>Connexion</h1>
        <p className="hero-copy">
          Accès privé aux notes, aux suivis et aux listes d’achats.
        </p>

        {error ? <div className="status-banner error">{error}</div> : null}

        {status === "checking" ? (
          <div className="status-banner">Restauration de session en cours.</div>
        ) : (
          <form
            action="#"
            className="data-form"
            method="post"
            noValidate
            onSubmit={handleSubmit}
          >
            <label>
              Nom d&apos;utilisateur
              <input
                autoComplete="username"
                className="input"
                name="username"
                onChange={updateField}
                required
                type="text"
                value={form.username}
              />
            </label>
            <label>
              Mot de passe
              <input
                autoComplete="current-password"
                className="input"
                name="password"
                onChange={updateField}
                required
                type="password"
                value={form.password}
              />
            </label>
            {capsLockOn ? (
              <span className="login-warning" role="status" aria-live="polite">
                Verr. Maj activée
              </span>
            ) : null}
            <button type="submit" className="primary-button" disabled={pending}>
              {pending ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        )}
      </article>
    </section>
  );
}
