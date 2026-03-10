import { useState } from "react";

import LoginForm from "../components/LoginForm";


export default function LoginPage({
  authStatus,
  onLogin,
  theme,
  onThemeChange,
}) {
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
    <main className="page login-page">
      <LoginForm
        appName="Pense-bête"
        error={error}
        onSubmit={handleSubmit}
        onThemeChange={onThemeChange}
        pending={pending}
        status={authStatus}
        theme={theme}
      />
    </main>
  );
}
