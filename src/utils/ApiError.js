export class ApiError extends Error {
    constructor(status, message, fields = []) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.fields = fields;
    }
}

const ERRORS = {
    0: { title: 'Serveur injoignable', message: 'Impossible de joindre le serveur. Vérifiez votre connexion.' },
    400: { title: 'Informations invalides', message: 'Certaines informations sont invalides.' },
    401: { title: 'Connexion requise', message: 'Vous devez vous connecter pour continuer.' },
    402: { title: 'Paiement refusé', message: 'Le paiement a été refusé.' },
    403: { title: 'Accès refusé', message: "Vous n'avez pas accès à cette action." },
    404: { title: 'Introuvable', message: 'Élément introuvable.' },
    409: { title: 'Action impossible', message: "Cette action n'est pas possible pour le moment." },
    503: { title: 'Serveur indisponible', message: 'Le serveur est momentanément indisponible.' },
};

const DEFAULT_ERROR = {
    title: 'Une erreur est survenue',
    message: 'Une erreur est survenue. Réessayez plus tard.',
};

export function getErrorContent(error, overrides = {}) {
    if (error instanceof ApiError) {
        const base = ERRORS[error.status] ?? DEFAULT_ERROR;
        const custom = overrides[error.status];
        if (typeof custom === 'string') return { ...base, message: custom };
        return { ...base, ...custom };
    }
    if (typeof error === 'string') return { ...DEFAULT_ERROR, message: error };
    // Un bug JS (TypeError...) a aussi un .message, mais technique : on ne l'affiche pas
    if (error && !(error instanceof Error) && (error.title || error.message)) {
        return {
            title: error.title ?? DEFAULT_ERROR.title,
            message: error.message ?? DEFAULT_ERROR.message,
        };
    }
    return DEFAULT_ERROR;
}
