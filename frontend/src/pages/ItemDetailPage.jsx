import { useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext, useParams } from "react-router-dom";

import { AuthError, deleteItem, getItem, updateItem } from "../api";
import ItemEditor from "../components/ItemEditor";


export default function ItemDetailPage() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { onAuthFailure, signalItemsChanged } = useOutletContext();
  const [item, setItem] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadItem() {
      setStatus("loading");
      setError("");

      try {
        const payload = await getItem(itemId);

        if (!active) {
          return;
        }

        setItem(payload);
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
      navigate("/items", { replace: true });
    } catch (deleteError) {
      if (deleteError instanceof AuthError) {
        onAuthFailure(deleteError);
        return;
      }

      setError(deleteError.message || "Suppression impossible.");
      setPending(false);
    }
  }

  return (
    <section className="stack-large">
      <Link className="link-back" to="/items">
        Retour à Tous
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
          error={error}
          item={item}
          onDelete={handleDelete}
          onSave={handleSave}
          pending={pending}
        />
      ) : null}
    </section>
  );
}
