const API_BASE = import.meta.env.VITE_API_BASE || "/api";
export const JWT_STORAGE_KEY = "pb.jwt";
export const ITEM_KIND_OPTIONS = [
  { value: "task", label: "Tâche" },
  { value: "buy", label: "Achat" },
  { value: "followup", label: "Suivi" },
  { value: "call", label: "Appel" },
  { value: "question", label: "Question" },
  { value: "idea", label: "Idée" },
  { value: "document", label: "Document" },
];
export const ITEM_STATUS_OPTIONS = [
  { value: "inbox", label: "Inbox" },
  { value: "next", label: "À faire" },
  { value: "waiting", label: "En attente" },
  { value: "scheduled", label: "Planifié" },
  { value: "done", label: "Terminé" },
  { value: "archived", label: "Archivé" },
];
export const ITEM_PRIORITY_OPTIONS = [
  { value: "low", label: "Basse" },
  { value: "normal", label: "Normale" },
  { value: "high", label: "Haute" },
];


export class AuthError extends Error {
  constructor(message = "Authentication failed") {
    super(message);
    this.name = "AuthError";
  }
}


function parseJson(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}


export function getStoredJwt() {
  return parseJson(localStorage.getItem(JWT_STORAGE_KEY)) || null;
}


export function setStoredJwt(tokens) {
  localStorage.setItem(JWT_STORAGE_KEY, JSON.stringify(tokens));
}


export function clearStoredJwt() {
  localStorage.removeItem(JWT_STORAGE_KEY);
}


export function getAccessToken() {
  return getStoredJwt()?.access || null;
}


async function request(path, options = {}, authenticated = false) {
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (authenticated) {
    const access = getAccessToken();

    if (!access) {
      throw new AuthError("Missing access token");
    }

    headers.set("Authorization", `Bearer ${access}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    let detail = "Unauthorized";

    try {
      const payload = await response.json();
      detail = payload.detail || payload.non_field_errors?.[0] || detail;
    } catch {
      detail = response.statusText || detail;
    }

    if (authenticated) {
      throw new AuthError(detail);
    }

    throw new Error(detail);
  }

  if (!response.ok) {
    let detail = "Request failed";

    try {
      const payload = await response.json();
      detail = payload.detail || payload.non_field_errors?.[0] || detail;
    } catch {
      detail = response.statusText || detail;
    }

    throw new Error(detail);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}


export async function createJwt(username, password) {
  return request("/auth/jwt/create/", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}


export async function refreshJwt(refresh) {
  return request("/auth/jwt/refresh/", {
    method: "POST",
    body: JSON.stringify({ refresh }),
  });
}


export async function verifyJwt(token) {
  return request("/auth/jwt/verify/", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}


export async function getWhoAmI() {
  return request("/auth/whoami/", {}, true);
}


export async function login(username, password) {
  const tokens = await createJwt(username, password);
  setStoredJwt(tokens);

  try {
    const user = await getWhoAmI();
    return { tokens, user };
  } catch (error) {
    clearStoredJwt();
    throw error;
  }
}


export async function restoreSession() {
  const stored = getStoredJwt();

  if (!stored?.access) {
    return null;
  }

  try {
    await verifyJwt(stored.access);
  } catch (error) {
    if (!stored.refresh) {
      clearStoredJwt();
      throw error;
    }

    try {
      const refreshed = await refreshJwt(stored.refresh);
      const nextTokens = {
        access: refreshed.access,
        refresh: stored.refresh,
      };
      setStoredJwt(nextTokens);
    } catch (refreshError) {
      clearStoredJwt();
      throw refreshError;
    }
  }

  try {
    const user = await getWhoAmI();
    return { user, tokens: getStoredJwt() };
  } catch (error) {
    clearStoredJwt();
    throw error;
  }
}


export function logout() {
  clearStoredJwt();
}


function buildQuery(params = {}) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, value);
    }
  });

  const query = search.toString();
  return query ? `?${query}` : "";
}


export async function listItems(params = {}) {
  return request(`/items/${buildQuery(params)}`, {}, true);
}


export async function getItem(itemId) {
  return request(`/items/${itemId}/`, {}, true);
}


export async function createItem(payload) {
  return request("/items/", {
    method: "POST",
    body: JSON.stringify(payload),
  }, true);
}


export async function updateItem(itemId, payload) {
  return request(`/items/${itemId}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  }, true);
}


export async function deleteItem(itemId) {
  return request(`/items/${itemId}/`, {
    method: "DELETE",
  }, true);
}
