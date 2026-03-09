import { useState } from "react";

import { ITEM_KIND_OPTIONS } from "../api";


export default function QuickCaptureForm({ onCreate }) {
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState("task");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setPending(true);
    setError("");
    setMessage("");

    try {
      await onCreate({
        title,
        kind,
        status: "inbox",
        priority: "normal",
      });
      setTitle("");
      setKind("task");
      setMessage("Item ajouté à l’Inbox.");
    } catch (submitError) {
      setError(submitError.message || "Création impossible.");
    }

    setPending(false);
  }

  return (
    <section className="panel quick-capture">
      <p className="eyebrow">Capture rapide</p>
      <h2>Ajouter un item</h2>
      <form className="form-stack" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field__label">Titre</span>
          <input
            className="input"
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ex: rappeler le garage"
            required
            value={title}
          />
        </label>
        <label className="field">
          <span className="field__label">Type</span>
          <select
            className="input"
            onChange={(event) => setKind(event.target.value)}
            value={kind}
          >
            {ITEM_KIND_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <button className="btn" disabled={pending} type="submit">
          {pending ? "Ajout..." : "Ajouter"}
        </button>
      </form>
      {message ? <p className="muted">{message}</p> : null}
      {error ? <p className="alert alert--error">{error}</p> : null}
    </section>
  );
}
