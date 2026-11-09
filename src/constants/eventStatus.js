import { COLORS } from './colors';

export const EVENT_STATUSES = [
    { value: 'DRAFT', label: 'Brouillon' },
    { value: 'PUBLISHED', label: 'Publié' },
    { value: 'CANCELLED', label: 'Annulé' },
    { value: 'FINISHED', label: 'Terminé' },
];

export const EVENT_STATUS_VALUES = EVENT_STATUSES.map((s) => s.value);

// Bandeau de statut affiché sur chaque événement
export const EVENT_STATUS_BANNERS = {
    DRAFT: { label: 'Brouillon', icon: 'construct-outline', background: COLORS.draft, color: COLORS.white },
    PUBLISHED: { label: 'Actif', icon: 'checkmark-circle-outline', background: COLORS.success, color: COLORS.white },
    CANCELLED: { label: 'Annulé', icon: 'close-circle-outline', background: COLORS.error, color: COLORS.white },
    FINISHED: { label: 'Terminé', icon: 'flag-outline', background: COLORS.finished, color: COLORS.finishedText },
};

export const CREATE_EVENT_STATUSES = EVENT_STATUSES.filter(
    (s) => s.value === 'DRAFT' || s.value === 'PUBLISHED'
);
