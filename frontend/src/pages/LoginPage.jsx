import { useState } from "react";

import LoginForm from "../components/LoginForm";


export default function LoginPage({ authStatus, onLogin }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(credentials) {
    setPending(true);
    setError("");

    try {
      await onLogin(credentials);
    } catch (submitError) {
      setError(submitError.message || "Connexion impossible");
      setPending(false);
      return;
    }

    setPending(false);
  }

  return (
    <main className="auth-screen">
      <section className="auth-card">
        <div className="auth-card__content">
          <p className="eyebrow">Pense-bête</p>
          <h1>Connexion privée</h1>
          <p className="lede">
            Capture rapide et suivi léger. L’accès à l’application passe par JWT
            et toutes les routes métier restent protégées.
          </p>
          {error ? <p className="alert alert--error">{error}</p> : null}
          {authStatus === "checking" ? (
            <p className="muted">Restauration de session en cours.</p>
          ) : (
            <LoginForm onSubmit={handleSubmit} pending={pending} />
          )}
        </div>
        <aside className="auth-card__aside">
          <p className="eyebrow">Socle</p>
          <ul className="plain-list">
            <li>JWT stocké sous `pb.jwt`</li>
            <li>Vérification et refresh à l’ouverture</li>
            <li>Endpoint courant: `/api/auth/whoami/`</li>
          </ul>
        </aside>
      </section>
    </main>
  );
}
