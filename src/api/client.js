import { ApiError } from '../utils/ApiError';
import { API_URL } from './config';

const TIMEOUT_MS = 10000;

// Token JWT gardé en mémoire (perdu au redémarrage de l'app pour l'instant)
let authToken = null;

export function setAuthToken(token) {
    authToken = token;
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
    if (authToken) headers.Authorization = `Bearer ${authToken}`;

    // Sans délai max, une API injoignable peut bloquer l'écran 30 à 60 s
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

    // L'API renvoie du JSON en cas de succès, et du texte pour les erreurs
    let data = text;
    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        // réponse texte, on la garde telle quelle
    }

    if (!response.ok) {
        // Erreurs de validation (400) : tableau de { message, field, ... }
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
