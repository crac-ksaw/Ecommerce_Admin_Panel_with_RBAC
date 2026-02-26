const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export async function apiRequest(path, { method = "GET", token, body } = {}) {
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    const message = payload?.message || payload?.error || "Request failed";
    const error = new Error(message);
    error.status = response.status;
    error.details = payload;
    throw error;
  }

  if (payload?.success === true) {
    return payload.data;
  }

  if (payload?.success === false) {
    const error = new Error(payload.message || "Request failed");
    error.status = response.status;
    error.details = payload;
    throw error;
  }

  return payload;
}
