import { Navigate } from "react-router-dom";


export default function AuthGuard({ authStatus, children }) {
  if (authStatus === "checking") {
    return (
      <main className="auth-screen auth-screen--centered">
        <section className="panel panel--compact">
          <p className="eyebrow">Pense-bête</p>
          <h1>Vérification de session</h1>
          <p className="muted">Validation du jeton en cours.</p>
        </section>
      </main>
    );
  }

  if (authStatus !== "authenticated") {
    return <Navigate to="/login" replace />;
  }

  return children;
}
