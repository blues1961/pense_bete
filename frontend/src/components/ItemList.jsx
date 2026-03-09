import { Link } from "react-router-dom";

import { ITEM_KIND_OPTIONS, ITEM_PRIORITY_OPTIONS } from "../api";
import ItemStatusSelect from "./ItemStatusSelect";


function optionLabel(options, value) {
  return options.find((option) => option.value === value)?.label || value;
}


function formatDate(value) {
  if (!value) {
    return null;
  }

  if (value.includes("T")) {
    return new Date(value).toLocaleString("fr-CA", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  return new Date(`${value}T00:00:00`).toLocaleDateString("fr-CA", {
    dateStyle: "medium",
  });
}


export default function ItemList({ emptyMessage, items, onDelete, onStatusChange }) {
  if (!items.length) {
    return <p className="muted">{emptyMessage}</p>;
  }

  return (
    <div className="item-list">
      {items.map((item) => (
        <article key={item.id} className="item-card">
          <div className="item-card__main">
            <div className="item-card__title-row">
              <div>
                <p className="item-card__title">{item.title}</p>
                {item.details ? <p className="muted item-card__excerpt">{item.details}</p> : null}
              </div>
              <Link className="btn btn--light btn--small" to={`/items/${item.id}`}>
                Ouvrir
              </Link>
            </div>
            <div className="meta-list">
              <span className="pill">{optionLabel(ITEM_KIND_OPTIONS, item.kind)}</span>
              <span className="pill">
                Priorité {optionLabel(ITEM_PRIORITY_OPTIONS, item.priority)}
              </span>
              {item.due_date ? <span className="pill">Échéance {formatDate(item.due_date)}</span> : null}
              {item.review_at ? <span className="pill">Revue {formatDate(item.review_at)}</span> : null}
              {item.context ? <span className="pill">Contexte {item.context}</span> : null}
              {item.contact_name ? <span className="pill">Contact {item.contact_name}</span> : null}
            </div>
          </div>
          <div className="item-card__actions">
            <ItemStatusSelect
              onChange={(nextStatus) => onStatusChange(item, nextStatus)}
              value={item.status}
            />
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
