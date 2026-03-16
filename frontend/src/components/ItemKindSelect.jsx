import { ITEM_KIND_OPTIONS } from "../api";


export default function ItemKindSelect({ onChange, value }) {
  return (
    <label className="item-kind-select">
      <span className="sr-only">Type</span>
      <select
        className="input input--small"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {ITEM_KIND_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
