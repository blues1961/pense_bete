import { Link, useLocation } from "react-router-dom";

import ItemKindSelect from "./ItemKindSelect";
import ItemStatusSelect from "./ItemStatusSelect";


export default function ItemList({
  emptyMessage,
  items,
  onDelete,
  onKindChange,
  onStatusChange,
}) {
  const location = useLocation();

  if (!items.length) {
    return <p className="muted">{emptyMessage}</p>;
  }

  return (
    <div className="item-list">
      <div className="item-list__header" aria-hidden="true">
        <span className="item-list__heading item-list__heading--title">Titre</span>
        <span className="item-list__heading">Type</span>
        <span className="item-list__heading">Statut</span>
        <span className="item-list__heading">Modifier</span>
        <span className="item-list__heading">Supprimer</span>
      </div>
      {items.map((item) => (
        <article key={item.id} className="item-card">
          <p className="item-card__title" title={item.title}>
            {item.title}
          </p>
          <ItemKindSelect
            onChange={(nextKind) => onKindChange(item, nextKind)}
            value={item.kind}
          />
          <ItemStatusSelect
            onChange={(nextStatus) => onStatusChange(item, nextStatus)}
            value={item.status}
          />
          <Link
            className="btn btn--light btn--small"
            state={{ from: location.pathname }}
            to={`/items/${item.id}`}
          >
            Modifier
          </Link>
          <button
            className="btn btn--light btn--small"
            onClick={() => onDelete(item)}
            type="button"
          >
            Supprimer
          </button>
        </article>
      ))}
    </div>
  );
}
