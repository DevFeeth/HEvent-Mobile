const DAYS = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
const MONTHS = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

// "2026-12-12T00:00:00.000Z" → "sam. 12 décembre"
// L'API envoie les dates à minuit UTC : on lit en UTC pour ne pas décaler d'un jour
export function formatShortDate(isoDate) {
    const date = new Date(isoDate);
    return `${DAYS[date.getUTCDay()]} ${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]}`;
}
