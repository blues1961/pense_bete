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
    <section className="login-card">
      <div className="login-head">
        <img src={monSiteLogo} alt="mon-site.ca" className="login-logo" />
        <h1 className="login-title">{appName}</h1>
        <p className="login-sub">Connexion</p>
        <ThemeToggle
          className="login-theme-toggle"
          onChange={onThemeChange}
          theme={theme}
        />
      </div>

      {error ? <p className="alert alert--error">{error}</p> : null}

      {status === "checking" ? (
        <p className="login-status muted">Restauration de session en cours.</p>
      ) : (
        <form
          action="#"
          className="login-form"
          method="post"
          noValidate
          onSubmit={handleSubmit}
        >
          <label className="login-label">
            <span>Nom d’utilisateur</span>
            <input
              autoComplete="username"
              className="input"
              name="username"
              onChange={updateField}
              required
              value={form.username}
            />
          </label>
          <label className="login-label">
            <span>Mot de passe</span>
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
          <button type="submit" className="btn btn--light" disabled={pending}>
            {pending ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      )}
    </section>
  );
}
