import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router-dom";

import { AuthError, deleteItem, getItem, listContacts, updateItem } from "../api";
import ItemEditor from "../components/ItemEditor";


export default function ItemDetailPage() {
  const { itemId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { onAuthFailure, signalItemsChanged, user } = useOutletContext();
  const [item, setItem] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [contactsError, setContactsError] = useState("");
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const previousPath = location.state?.from || "/items";

  useEffect(() => {
    let active = true;

    async function loadItem() {
      setStatus("loading");
      setError("");
      setContactsError("");

      try {
        const itemPayload = await getItem(itemId);

        if (!active) {
          return;
        }

        setItem(itemPayload);
        setStatus("ready");
      } catch (loadError) {
        if (!active) {
          return;
        }

        if (loadError instanceof AuthError) {
          onAuthFailure(loadError);
          return;
        }

        setError(loadError.message || "Chargement impossible.");
        setStatus("error");
        return;
      }

      try {
        const contactsPayload = await listContacts();

        if (!active) {
          return;
        }

        setContacts(contactsPayload);
      } catch (loadContactsError) {
        if (!active) {
          return;
        }

        if (loadContactsError instanceof AuthError) {
          onAuthFailure(loadContactsError);
          return;
        }

        setContacts([]);
        setContactsError(loadContactsError.message || "Contacts indisponibles.");
      }
    }

    loadItem();

    return () => {
      active = false;
    };
  }, [itemId, onAuthFailure]);

  async function handleSave(payload) {
    setPending(true);
    setError("");

    try {
      const updated = await updateItem(itemId, payload);
      setItem(updated);
      signalItemsChanged();
      navigate(previousPath, { replace: true });
    } catch (saveError) {
      if (saveError instanceof AuthError) {
        onAuthFailure(saveError);
        return;
      }

      setError(saveError.message || "Enregistrement impossible.");
    }

    setPending(false);
  }

  async function handleDelete() {
    const confirmed = window.confirm(`Supprimer "${item?.title || "cet item"}" ?`);

    if (!confirmed) {
      return;
    }

    setPending(true);
    setError("");

    try {
      await deleteItem(itemId);
      signalItemsChanged();
      navigate(previousPath, { replace: true });
    } catch (deleteError) {
      if (deleteError instanceof AuthError) {
        onAuthFailure(deleteError);
        return;
      }

      setError(deleteError.message || "Suppression impossible.");
      setPending(false);
    }
  }

  function handleCancel() {
    navigate(previousPath, { replace: true });
  }

  function handleContactCreated(contact) {
    setContacts((current) => [...current, contact].sort((a, b) => a.name.localeCompare(b.name)));
  }

  return (
    <section className="stack-large">
      <Link className="link-back" to={previousPath}>
        Retour
      </Link>
      {status === "loading" ? (
        <section className="panel">
          <p className="muted">Chargement de l’item.</p>
        </section>
      ) : null}
      {status === "error" ? (
        <section className="panel">
          <p className="alert alert--error">{error}</p>
        </section>
      ) : null}
      {item ? (
        <ItemEditor
          contacts={contacts}
          contactsError={contactsError}
          error={error}
          item={item}
          onCancel={handleCancel}
          onContactCreated={handleContactCreated}
          onDelete={handleDelete}
          onSave={handleSave}
          pending={pending}
          user={user}
        />
      ) : null}
    </section>
  );
}
