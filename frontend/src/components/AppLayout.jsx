import { useState } from "react";
import { Outlet } from "react-router-dom";

import { AuthError, createItem } from "../api";
import monSiteSymbol from "../assets/mon-site-symbol.png";
import QuickCaptureForm from "./QuickCaptureForm";
import SidebarNav from "./SidebarNav";
import ThemeToggle from "./ThemeToggle";


export default function AppLayout({
  onAuthFailure,
  onLogout,
  user,
  children,
  theme,
  onThemeChange,
}) {
  const [refreshVersion, setRefreshVersion] = useState(0);

  async function handleQuickCreate(payload) {
    try {
      const item = await createItem(payload);
      setRefreshVersion((current) => current + 1);
      return item;
    } catch (error) {
      if (error instanceof AuthError) {
        onAuthFailure(error);
      }
      throw error;
    }
  }

  function signalItemsChanged() {
    setRefreshVersion((current) => current + 1);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar__inner">
          <div className="brand">
            <img src={monSiteSymbol} alt="mon-site.ca" className="brand__logo brand__logo--symbol" />
            <div>
              <p className="brand__eyebrow">mon-site.ca</p>
              <strong className="brand__name">Pense-bête</strong>
            </div>
          </div>
          <div className="topbar__right">
            <ThemeToggle theme={theme} onChange={onThemeChange} />
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
      <main className="page container workspace">
        <aside className="workspace__sidebar">
          <SidebarNav />
          <QuickCaptureForm onCreate={handleQuickCreate} />
        </aside>
        <section className="workspace__content">
          {children || (
            <Outlet
              context={{
                onAuthFailure,
                refreshVersion,
                signalItemsChanged,
              }}
            />
          )}
        </section>
      </main>
    </div>
  );
}
