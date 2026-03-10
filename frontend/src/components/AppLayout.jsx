import { useState } from "react";
import { Outlet } from "react-router-dom";

import { AuthError, createItem } from "../api";
import monSiteLogo from "../assets/mon-site-logo.png";
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
            <img src={monSiteLogo} alt="mon-site.ca" className="brand__logo" />
            <strong className="brand__name">Pense-bête</strong>
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
      <main className="page">
        <div className="container app-body">
          <QuickCaptureForm onCreate={handleQuickCreate} />
          <div className="workspace">
            <aside className="workspace__sidebar">
              <SidebarNav />
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
          </div>
        </div>
      </main>
    </div>
  );
}
