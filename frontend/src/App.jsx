import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";

import { AuthError, login, logout, restoreSession } from "./api";
import AppLayout from "./components/AppLayout";
import AuthGuard from "./components/AuthGuard";
import AllItemsPage from "./pages/AllItemsPage";
import BuyPage from "./pages/BuyPage";
import InboxPage from "./pages/InboxPage";
import ItemDetailPage from "./pages/ItemDetailPage";
import LoginPage from "./pages/LoginPage";
import TodayPage from "./pages/TodayPage";
import WaitingPage from "./pages/WaitingPage";


export default function App() {
  const [authState, setAuthState] = useState({
    status: "checking",
    user: null,
  });

  useEffect(() => {
    let active = true;

    restoreSession()
      .then((session) => {
        if (!active) {
          return;
        }

        if (session?.user) {
          setAuthState({ status: "authenticated", user: session.user });
          return;
        }

        setAuthState({ status: "anonymous", user: null });
      })
      .catch(() => {
        if (active) {
          setAuthState({ status: "anonymous", user: null });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleLogin({ username, password }) {
    const session = await login(username, password);
    setAuthState({ status: "authenticated", user: session.user });
  }

  function handleLogout() {
    logout();
    setAuthState({ status: "anonymous", user: null });
  }

  function handleAuthFailure(error) {
    if (error instanceof AuthError) {
      logout();
      setAuthState({ status: "anonymous", user: null });
      return;
    }

    throw error;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            authState.status === "authenticated" ? (
              <Navigate to="/" replace />
            ) : (
              <LoginPage
                authStatus={authState.status}
                onLogin={handleLogin}
              />
            )
          }
        />
        <Route
          element={
            <AuthGuard authStatus={authState.status}>
              <AppLayout
                onAuthFailure={handleAuthFailure}
                user={authState.user}
                onLogout={handleLogout}
              />
            </AuthGuard>
          }
        >
          <Route index element={<Navigate to="/inbox" replace />} />
          <Route path="/inbox" element={<InboxPage />} />
          <Route path="/today" element={<TodayPage />} />
          <Route path="/waiting" element={<WaitingPage />} />
          <Route path="/buy" element={<BuyPage />} />
          <Route path="/items" element={<AllItemsPage />} />
          <Route
            path="/items/:itemId"
            element={<ItemDetailPage />}
          />
        </Route>
        <Route
          path="*"
          element={
            <Navigate
              to={authState.status === "authenticated" ? "/" : "/login"}
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
