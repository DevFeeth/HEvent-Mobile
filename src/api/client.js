import { ApiError } from '../utils/ApiError';
import { API_URL } from './config';

const TIMEOUT_MS = 10000;

let authToken = null;
let onUnauthorized = null;

export function setAuthToken(token) {
    authToken = token;
}

// Appelé quand l'API refuse le token (expiré, compte désactivé...) : useSessionRestore déconnecte l'utilisateur
export function setUnauthorizedHandler(handler) {
    onUnauthorized = handler;
}

function buildQuery(params) {
    if (!params) return '';
    const query = Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== null)
        .flatMap(([key, value]) =>
            (Array.isArray(value) ? value : [value]).map(
                (v) => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`
            )
        )
        .join('&');
    return query ? `?${query}` : '';
}

async function request(method, path, { body, params } = {}) {
    const headers = { Accept: 'application/json' };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    const sentToken = authToken;
    if (sentToken) headers.Authorization = `Bearer ${sentToken}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let response;
    let text;
    try {
        response = await fetch(`${API_URL}${path}${buildQuery(params)}`, {
            method,
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined,
            signal: controller.signal,
        });
        text = await response.text();
    } catch (err) {
        throw new ApiError(0, controller.signal.aborted ? `Timeout after ${TIMEOUT_MS} ms` : err.message);
    } finally {
        clearTimeout(timer);
    }

    let data = text;
    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        // On garde la data brut
    }

    // Sans token envoyé (ex. mauvais mot de passe au login), un 401 ne veut pas dire « session expirée ».
    // Si le token a changé entre-temps (reconnexion), on ne déconnecte pas la nouvelle session.
    if (response.status === 401 && sentToken && sentToken === authToken) onUnauthorized?.();

    if (!response.ok) {
        const fields = Array.isArray(data) ? data : [];
        const message = fields.length
            ? fields.map((e) => e.message).join('\n')
            : typeof data === 'string' && data
                ? data
                : response.statusText;
        throw new ApiError(response.status, message, fields);
    }
    return data;
}

export const api = {
    get: (path, options) => request('GET', path, options),
    post: (path, body, options) => request('POST', path, { ...options, body }),
    patch: (path, body, options) => request('PATCH', path, { ...options, body }),
    delete: (path, options) => request('DELETE', path, options),
};
