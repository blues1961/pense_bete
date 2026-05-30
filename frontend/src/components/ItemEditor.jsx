import { useEffect, useState } from "react";

import {
  ITEM_KIND_OPTIONS,
  ITEM_PRIORITY_OPTIONS,
  ITEM_STATUS_OPTIONS,
  createContact,
} from "../api";
import {
  PRIVATE_ENCRYPTION_VERSION,
  deriveVaultKeyMaterial,
  encryptPrivateFields,
} from "../contactCrypto";


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
    external_contact_id: form.external_contact_id,
    external_contact_snapshot: form.external_contact_snapshot,
    due_date: form.due_date || null,
    review_at: form.review_at ? new Date(`${form.review_at}T00:00:00`).toISOString() : null,
  };
}


export default function ItemEditor({
  contacts,
  contactsError,
  error,
  item,
  onCancel,
  onContactCreated,
  onDelete,
  onSave,
  pending,
  user,
}) {
  const [form, setForm] = useState({
    title: "",
    details: "",
    kind: "task",
    status: "inbox",
    priority: "normal",
    context: "",
    contact_name: "",
    external_contact_id: "",
    external_contact_snapshot: {},
    due_date: "",
    review_at: "",
  });
  const [newContact, setNewContact] = useState({
    visibility: "public",
    name: "",
    organization: "",
    address: "",
    email: "",
    phone: "",
    notes: "",
    vaultPassphrase: "",
  });
  const [contactMode, setContactMode] = useState("select");
  const [contactError, setContactError] = useState("");
  const [contactPending, setContactPending] = useState(false);

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
      external_contact_id: item.external_contact_id || "",
      external_contact_snapshot: item.external_contact_snapshot || {},
      due_date: item.due_date || "",
      review_at: toLocalDateInput(item.review_at),
    });
  }, [item]);

  function updateField(event) {
    const { name, value } = event.target;
    if (name === "external_contact_id") {
      const selectedContact = contacts.find((contact) => String(contact.id) === value);
      setForm((current) => ({
        ...current,
        external_contact_id: value,
        external_contact_snapshot: selectedContact || {},
        contact_name: selectedContact?.name || current.contact_name,
      }));
      return;
    }

    setForm((current) => ({ ...current, [name]: value }));
  }

  function updateNewContactField(event) {
    const { name, value } = event.target;
    setNewContact((current) => ({ ...current, [name]: value }));
  }

  async function handleCreateContact() {
    const clearFields = {
      name: newContact.name.trim(),
      organization: newContact.organization.trim(),
      address: newContact.address.trim(),
      email: newContact.email.trim(),
      phone: newContact.phone.trim(),
      notes: newContact.notes.trim(),
    };

    if (newContact.visibility === "public" && !clearFields.name) {
      setContactError("Le nom du contact est obligatoire.");
      return;
    }

    setContactPending(true);
    setContactError("");

    try {
      let payload;

      if (newContact.visibility === "private") {
        const keyMaterial = await deriveVaultKeyMaterial(newContact.vaultPassphrase, user?.username || "default");
        payload = {
          visibility: "private",
          encrypted_payload: await encryptPrivateFields(clearFields, keyMaterial),
          encryption_version: PRIVATE_ENCRYPTION_VERSION,
        };
      } else {
        payload = {
          visibility: "public",
          ...clearFields,
        };
      }

      const created = await createContact(payload);
      onContactCreated(created);
      setForm((current) => ({
        ...current,
        external_contact_id: String(created.id),
        external_contact_snapshot: created,
        contact_name: created.name || clearFields.name,
      }));
      setNewContact({
        visibility: "public",
        name: "",
        organization: "",
        address: "",
        email: "",
        phone: "",
        notes: "",
        vaultPassphrase: "",
      });
      setContactMode("select");
    } catch (createError) {
      setContactError(createError.message || "Création du contact impossible.");
    }

    setContactPending(false);
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSave(toPayload(form));
  }

  const selectedContactIsMissing =
    form.external_contact_id &&
    !contacts.some((contact) => String(contact.id) === String(form.external_contact_id));
  const selectedContact =
    contacts.find((contact) => String(contact.id) === String(form.external_contact_id)) ||
    form.external_contact_snapshot ||
    null;
  const currentContactLabel =
    form.external_contact_snapshot?.name ||
    form.contact_name ||
    (form.external_contact_snapshot?.visibility === "private" ? "Contact privé" : "Contact associé");
  const hasSelectedContactDetails =
    selectedContact &&
    (selectedContact.phone || selectedContact.address || selectedContact.email || selectedContact.organization);

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
          {hasSelectedContactDetails ? (
            <div className="contact-preview">
              {selectedContact.organization ? (
                <span className="contact-preview__line">{selectedContact.organization}</span>
              ) : null}
              {selectedContact.phone ? (
                <a className="contact-preview__line" href={`tel:${selectedContact.phone}`}>
                  Tél. {selectedContact.phone}
                </a>
              ) : null}
              {selectedContact.address ? (
                <span className="contact-preview__line">Adresse : {selectedContact.address}</span>
              ) : null}
              {selectedContact.email ? (
                <a className="contact-preview__line" href={`mailto:${selectedContact.email}`}>
                  {selectedContact.email}
                </a>
              ) : null}
            </div>
          ) : null}
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
          <select
            className="input"
            name="external_contact_id"
            onChange={updateField}
            value={form.external_contact_id}
          >
            <option value="">Aucun contact associé</option>
            {selectedContactIsMissing ? (
              <option value={form.external_contact_id}>
                {currentContactLabel}
              </option>
            ) : null}
            {contacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.name || (contact.visibility === "private" ? "Contact privé" : `Contact #${contact.id}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field__label">Nom libre</span>
          <input
            className="input"
            name="contact_name"
            onChange={updateField}
            placeholder="Nom affiché si aucun contact n’est associé"
            value={form.contact_name}
          />
        </label>
        <div className="field field--full contact-association">
          {contactsError ? (
            <p className="alert alert--error">
              {contactsError} L’item reste modifiable; crée l’utilisateur correspondant dans Contact pour associer ou créer un contact.
            </p>
          ) : null}
          <div className="contact-association__header">
            <span className="field__label">Nouveau contact</span>
            <button
              className="btn btn--light btn--small"
              disabled={Boolean(contactsError)}
              onClick={() => setContactMode((current) => (current === "create" ? "select" : "create"))}
              type="button"
            >
              {contactMode === "create" ? "Fermer" : "Créer un contact"}
            </button>
          </div>
          {contactMode === "create" ? (
            <div className="contact-create">
              <label className="field">
                <span className="field__label">Visibilité</span>
                <select
                  className="input"
                  name="visibility"
                  onChange={updateNewContactField}
                  value={newContact.visibility}
                >
                  <option value="public">Public</option>
                  <option value="private">Privé</option>
                </select>
              </label>
              <label className="field">
                <span className="field__label">Nom</span>
                <input
                  className="input"
                  name="name"
                  onChange={updateNewContactField}
                  value={newContact.name}
                />
              </label>
              <label className="field">
                <span className="field__label">Organisation</span>
                <input
                  className="input"
                  name="organization"
                  onChange={updateNewContactField}
                  value={newContact.organization}
                />
              </label>
              <label className="field">
                <span className="field__label">Téléphone</span>
                <input
                  className="input"
                  name="phone"
                  onChange={updateNewContactField}
                  value={newContact.phone}
                />
              </label>
              <label className="field field--full">
                <span className="field__label">Courriel</span>
                <input
                  className="input"
                  name="email"
                  onChange={updateNewContactField}
                  value={newContact.email}
                />
              </label>
              <label className="field field--full">
                <span className="field__label">Adresse</span>
                <textarea
                  className="input"
                  name="address"
                  onChange={updateNewContactField}
                  rows={2}
                  value={newContact.address}
                />
              </label>
              <label className="field field--full">
                <span className="field__label">Notes</span>
                <textarea
                  className="input"
                  name="notes"
                  onChange={updateNewContactField}
                  rows={2}
                  value={newContact.notes}
                />
              </label>
              {newContact.visibility === "private" ? (
                <label className="field field--full">
                  <span className="field__label">Phrase de passe du coffre Contact</span>
                  <input
                    className="input"
                    name="vaultPassphrase"
                    onChange={updateNewContactField}
                    type="password"
                    value={newContact.vaultPassphrase}
                  />
                </label>
              ) : null}
              <button
                className="btn btn--small"
                disabled={contactPending}
                onClick={handleCreateContact}
                type="button"
              >
                {contactPending ? "Création..." : "Créer et associer"}
              </button>
              {contactError ? <p className="alert alert--error">{contactError}</p> : null}
            </div>
          ) : null}
        </div>
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
