import { useState } from "react";


export default function LoginForm({ onSubmit, pending }) {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(form);
  }

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <label className="field">
        <span className="field__label">Nom d’utilisateur</span>
        <input
          autoComplete="username"
          className="input"
          name="username"
          onChange={updateField}
          required
          value={form.username}
        />
      </label>
      <label className="field">
        <span className="field__label">Mot de passe</span>
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
      <button type="submit" className="btn" disabled={pending}>
        {pending ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
}
