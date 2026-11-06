export class ApiError extends Error {
    constructor(status, message, fields = []) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.fields = fields;
    }
}

const MESSAGES = {
    0: 'Impossible de joindre le serveur. Vérifie ta connexion.',
    400: 'Certaines informations sont invalides.',
    401: 'Tu dois te connecter pour continuer.',
    402: 'Le paiement a été refusé.',
    403: "Tu n'as pas accès à cette action.",
    404: 'Élément introuvable.',
    409: "Cette action n'est pas possible pour le moment.",
    503: 'Le serveur est momentanément indisponible.',
};

const DEFAULT_MESSAGE = 'Une erreur est survenue. Réessaie plus tard.';

export function getErrorMessage(error, overrides = {}) {
    if (error instanceof ApiError) {
        return overrides[error.status] ?? MESSAGES[error.status] ?? DEFAULT_MESSAGE;
    }
    return DEFAULT_MESSAGE;
}
