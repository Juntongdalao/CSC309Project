// Configure the backend URL + JSON + Authorization
import useAuthStore from "../store/authStore";

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Helper to call the backend with JSON + optional Bearer token
export async function apiFetch(path, options = {}) {
    const {
        method = 'GET',
        headers = {},
        body,
        token: explicitToken, // caller can still override if they want,
    } = options;

    // Prefer an explicit token if provided, otherwise use the one from Zustand
    const storeState = useAuthStore.getState();
    const token = explicitToken ?? storeState.token;

    const finalHeaders = {
        'Content-Type': 'application/json',
        ...headers,
    };

    if (token) {
        finalHeaders.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers: finalHeaders,
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        const err = new Error(data.error || `Request failed with status ${res.status}`);
        err.status = res.status;
        err.body = data;
        throw err;
    }
    return data;
}