import { useEffect, useState } from "react";

export default function QuickCaptureForm({ onCreate }) {
  const [title, setTitle] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!message) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setMessage("");
    }, 2600);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [message]);

  async function handleSubmit(event) {
    event.preventDefault();

    const normalizedTitle = title.trim();

    if (!normalizedTitle) {
      return;
    }

    setPending(true);
    setError("");
    setMessage("");

    try {
      await onCreate({
        title: normalizedTitle,
        kind: "task",
        status: "inbox",
        priority: "normal",
      });
      setTitle("");
      setMessage("Item ajouté à l’Inbox.");
    } catch (submitError) {
      setError(submitError.message || "Création impossible.");
    }

    setPending(false);
  }

  return (
    <section className="panel quick-capture">
      {message ? (
        <p className="quick-capture__toast" role="status" aria-live="polite">
          {message}
        </p>
      ) : null}
      <div className="quick-capture__intro">
        <p className="eyebrow">Capture rapide</p>
        <h2>Entrer une idée dès qu’elle arrive</h2>
        <p className="quick-capture__lede">
          Une seule ligne, un clic, et l’item entre dans l’Inbox.
        </p>
      </div>
      <form className="quick-capture__form" onSubmit={handleSubmit}>
        <label className="quick-capture__field" htmlFor="quick-capture-title">
          <span className="sr-only">Nouvel item</span>
          <input
            autoFocus
            className="input quick-capture__input"
            id="quick-capture-title"
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ex: rappeler le garage, noter une idée, penser à acheter..."
            required
            value={title}
          />
        </label>
        <button className="btn quick-capture__submit" disabled={pending} type="submit">
          {pending ? "Ajout..." : "Ajouter"}
        </button>
      </form>
      {error ? <p className="alert alert--error">{error}</p> : null}
    </section>
  );
}
