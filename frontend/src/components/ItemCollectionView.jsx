import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

import { AuthError, deleteItem, listItems, updateItem } from "../api";
import ItemList from "./ItemList";


export default function ItemCollectionView({
  description,
  emptyMessage,
  filterItems,
  title,
}) {
  const { onAuthFailure, refreshVersion, signalItemsChanged } = useOutletContext();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadItems() {
      setStatus("loading");
      setError("");

      try {
        const payload = await listItems();

        if (!active) {
          return;
        }

        setItems(payload);
        setStatus("ready");
      } catch (loadError) {
        if (!active) {
          return;
        }

        if (loadError instanceof AuthError) {
          onAuthFailure(loadError);
          return;
        }

        setError(loadError.message || "Impossible de charger les items.");
        setStatus("error");
      }
    }

    loadItems();

    return () => {
      active = false;
    };
  }, [onAuthFailure, refreshVersion]);

  async function handleDelete(item) {
    const confirmed = window.confirm(`Supprimer "${item.title}" ?`);

    if (!confirmed) {
      return;
    }

    try {
      await deleteItem(item.id);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      signalItemsChanged();
    } catch (deleteError) {
      if (deleteError instanceof AuthError) {
        onAuthFailure(deleteError);
        return;
      }

      setError(deleteError.message || "Suppression impossible.");
    }
  }

  async function handleStatusChange(item, nextStatus) {
    try {
      const updated = await updateItem(item.id, { status: nextStatus });
      setItems((current) =>
        current.map((entry) => (entry.id === updated.id ? updated : entry)),
      );
      signalItemsChanged();
    } catch (updateError) {
      if (updateError instanceof AuthError) {
        onAuthFailure(updateError);
        return;
      }

      setError(updateError.message || "Mise à jour impossible.");
    }
  }

  const visibleItems = filterItems ? filterItems(items) : items;

  return (
    <section className="panel page-panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Vue métier</p>
          <h1 className="page-title">{title}</h1>
          <p className="lede">{description}</p>
        </div>
        <span className={`badge badge--${status}`}>{visibleItems.length}</span>
      </div>
      {error ? <p className="alert alert--error">{error}</p> : null}
      <ItemList
        emptyMessage={emptyMessage}
        items={visibleItems}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
      />
    </section>
  );
}
