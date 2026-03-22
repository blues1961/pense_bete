import { useEffect, useState } from "react";

import {
  ITEM_KIND_OPTIONS,
  ITEM_PRIORITY_OPTIONS,
  ITEM_STATUS_OPTIONS,
} from "../api";


function toLocalDateInput(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const pad = (part) => String(part).padStart(2, "0");

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("-");
}


function toPayload(form) {
  return {
    title: form.title.trim(),
    details: form.details.trim(),
    kind: form.kind,
    status: form.status,
    priority: form.priority,
    context: form.context.trim(),
    contact_name: form.contact_name.trim(),
    due_date: form.due_date || null,
    review_at: form.review_at ? new Date(`${form.review_at}T00:00:00`).toISOString() : null,
  };
}


export default function ItemEditor({ error, item, onCancel, onDelete, onSave, pending }) {
  const [form, setForm] = useState({
    title: "",
    details: "",
    kind: "task",
    status: "inbox",
    priority: "normal",
    context: "",
    contact_name: "",
    due_date: "",
    review_at: "",
  });

  useEffect(() => {
    if (!item) {
      return;
    }

    setForm({
      title: item.title || "",
      details: item.details || "",
      kind: item.kind || "task",
      status: item.status || "inbox",
      priority: item.priority || "normal",
      context: item.context || "",
      contact_name: item.contact_name || "",
      due_date: item.due_date || "",
      review_at: toLocalDateInput(item.review_at),
    });
  }, [item]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSave(toPayload(form));
  }

  return (
    <form className="panel form-panel" onSubmit={handleSubmit}>
      <div className="panel__header">
        <div>
          <p className="eyebrow">Édition</p>
          <h1 className="page-title">Item</h1>
        </div>
        <div className="stack-inline">
          <button
            className="btn btn--light"
            disabled={pending}
            onClick={onCancel}
            type="button"
          >
            Annuler
          </button>
          <button className="btn" disabled={pending} type="submit">
            {pending ? "Enregistrement..." : "Enregistrer"}
          </button>
          <button
            className="btn btn--light"
            disabled={pending}
            onClick={onDelete}
            type="button"
          >
            Supprimer
          </button>
        </div>
      </div>
      {error ? <p className="alert alert--error">{error}</p> : null}
      <div className="form-grid">
        <label className="field field--full">
          <span className="field__label">Titre</span>
          <input
            className="input"
            name="title"
            onChange={updateField}
            required
            value={form.title}
          />
        </label>
        <label className="field field--full">
          <span className="field__label">Détails</span>
          <textarea
            className="input input--textarea"
            name="details"
            onChange={updateField}
            rows={5}
            value={form.details}
          />
        </label>
        <label className="field">
          <span className="field__label">Type</span>
          <select className="input" name="kind" onChange={updateField} value={form.kind}>
            {ITEM_KIND_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field__label">Statut</span>
          <select className="input" name="status" onChange={updateField} value={form.status}>
            {ITEM_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field__label">Priorité</span>
          <select
            className="input"
            name="priority"
            onChange={updateField}
            value={form.priority}
          >
            {ITEM_PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field__label">Contexte</span>
          <input
            className="input"
            name="context"
            onChange={updateField}
            value={form.context}
          />
        </label>
        <label className="field">
          <span className="field__label">Contact</span>
          <input
            className="input"
            name="contact_name"
            onChange={updateField}
            value={form.contact_name}
          />
        </label>
        <label className="field">
          <span className="field__label">Échéance</span>
          <input
            className="input"
            name="due_date"
            onChange={updateField}
            type="date"
            value={form.due_date}
          />
        </label>
        <label className="field">
          <span className="field__label">Date de révision</span>
          <input
            className="input"
            name="review_at"
            onChange={updateField}
            type="date"
            value={form.review_at}
          />
        </label>
      </div>
      {item?.completed_at ? (
        <p className="muted">
          Terminé le {new Date(item.completed_at).toLocaleString("fr-CA")}
        </p>
      ) : null}
    </form>
  );
}
