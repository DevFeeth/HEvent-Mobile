// Libellés affichés pour chaque catégorie de l'API
export const CATEGORY_LABELS = {
    CONCERT: 'Concert',
    FESTIVAL: 'Festival',
    PARTY: 'Soirée',
    CONFERENCE: 'Conférence',
    SPORT: 'Sport',
};

export const categoryLabel = (name) => CATEGORY_LABELS[name] ?? name;
