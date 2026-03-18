import { ITEM_STATUS_OPTIONS } from "../api";


export default function ItemStatusSelect({ onChange, value }) {
  return (
    <label className="item-status-select">
      <span className="sr-only">Statut</span>
      <select
        className="input input--small"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {ITEM_STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
