export const EVENT_STATUSES = [
    { value: 'DRAFT', label: 'Brouillon' },
    { value: 'PUBLISHED', label: 'Publié' },
    { value: 'CANCELLED', label: 'Annulé' },
    { value: 'FINISHED', label: 'Terminé' },
];

export const EVENT_STATUS_VALUES = EVENT_STATUSES.map((s) => s.value);

export const CREATE_EVENT_STATUSES = EVENT_STATUSES.filter(
    (s) => s.value === 'DRAFT' || s.value === 'PUBLISHED'
);
