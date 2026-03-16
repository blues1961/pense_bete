import { Link, useLocation } from "react-router-dom";

import ItemKindSelect from "./ItemKindSelect";


export default function ItemList({ emptyMessage, items, onDelete, onKindChange }) {
  const location = useLocation();

  if (!items.length) {
    return <p className="muted">{emptyMessage}</p>;
  }

  return (
    <div className="item-list">
      {items.map((item) => (
        <article key={item.id} className="item-card">
          <p className="item-card__title" title={item.title}>
            {item.title}
          </p>
          <div className="item-card__actions">
            <ItemKindSelect
              onChange={(nextKind) => onKindChange(item, nextKind)}
              value={item.kind}
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
          </div>
        </article>
      ))}
    </div>
  );
}
