import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";

import { AuthError, login, logout, restoreSession } from "./api";
import AppLayout from "./components/AppLayout";
import AuthGuard from "./components/AuthGuard";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";


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
                user={authState.user}
                onLogout={handleLogout}
              />
            </AuthGuard>
          }
        >
          <Route
            path="/"
            element={<HomePage onAuthFailure={handleAuthFailure} />}
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
