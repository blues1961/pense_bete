import { NavLink } from "react-router-dom";


const NAV_ITEMS = [
  { to: "/inbox", label: "Inbox" },
  { to: "/today", label: "Aujourd’hui" },
  { to: "/waiting", label: "En attente" },
  { to: "/buy", label: "Achats" },
  { to: "/items", label: "Tous" },
];


export default function SidebarNav() {
  return (
    <nav className="panel side-nav">
      <p className="eyebrow">Navigation</p>
      <div className="side-nav__links">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            className={({ isActive }) =>
              isActive ? "side-nav__link side-nav__link--active" : "side-nav__link"
            }
            to={item.to}
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
