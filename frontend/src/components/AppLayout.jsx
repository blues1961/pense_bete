import { Outlet } from "react-router-dom";


export default function AppLayout({ onLogout, user, children }) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar__inner">
          <div className="brand">
            <span className="brand__mark">PB</span>
            <div>
              <p className="brand__eyebrow">mon-site.ca</p>
              <strong className="brand__name">Pense-bête</strong>
            </div>
          </div>
          <div className="topbar__right">
            <div className="user-chip">
              <span className="user-chip__label">Connecté</span>
              <strong>{user?.username || "n/a"}</strong>
            </div>
            <button type="button" className="btn btn--light" onClick={onLogout}>
              Se déconnecter
            </button>
          </div>
        </div>
      </header>
      <main className="page container">{children || <Outlet />}</main>
    </div>
  );
}
