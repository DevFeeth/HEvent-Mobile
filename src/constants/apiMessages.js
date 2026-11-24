// Traduction des refus renvoyés par l'API (texte exact de l'API → titre et message affichés).
// Utilisé automatiquement par getErrorContent (utils/ApiError.js).
export const API_MESSAGES = {
    // Connexion
    'Too many failed login attempts, try again later': {
        title: 'Trop de tentatives',
        message: 'Trop de tentatives de connexion échouées. Réessayez dans 15 minutes.',
    },

    // Billets : QR code et entrée
    'This ticket has already been used': {
        title: 'Billet déjà utilisé',
        message: 'Ce billet a déjà été utilisé.',
    },
    'This ticket has been cancelled': {
        title: 'Billet annulé',
        message: 'Ce billet a été annulé.',
    },
    'The order of this ticket is not paid': {
        title: 'Commande non payée',
        message: 'La commande de ce billet n’est pas encore payée.',
    },
    'This event is not open for entry': {
        title: 'Entrée fermée',
        message: 'L’événement n’est pas ouvert à l’entrée.',
    },
    'This event has not started yet': {
        title: 'Pas encore commencé',
        message: 'L’événement n’a pas encore commencé.',
    },
    'This event is over': {
        title: 'Événement terminé',
        message: 'L’événement est terminé.',
    },
    'This QR code has expired, the ticket owner must refresh it': {
        title: 'QR code expiré',
        message: 'QR code expiré : le participant doit rafraîchir son billet.',
    },
    'This QR code is not valid': {
        title: 'QR code invalide',
        message: 'Ce QR code n’est pas un billet valide.',
    },
    'Only a valid ticket can be cancelled': {
        title: 'Annulation impossible',
        message: 'Seul un billet valide peut être annulé.',
    },

    // Commandes et paiement
    'Not enough tickets available': {
        title: 'Plus assez de billets',
        message: 'Il ne reste plus assez de billets pour votre sélection.',
    },
    'This event is not open for sale': {
        title: 'Vente fermée',
        message: 'Cet événement n’est plus en vente.',
    },
    'This promo code is not valid': {
        title: 'Code promo invalide',
        message: 'Ce code n’existe pas ou n’est pas valable pour cet événement.',
    },
    'The order amount is too low for this promo code': {
        title: 'Montant insuffisant',
        message: 'Le montant de la commande est trop bas pour ce code promo.',
    },
    'This promo code has reached its usage limit': {
        title: 'Code promo épuisé',
        message: 'Ce code promo a atteint sa limite d’utilisation.',
    },
    'The payment was declined, the order is still pending': {
        title: 'Paiement refusé',
        message: 'Votre carte a été refusée. Vos billets restent réservés, vous pouvez réessayer.',
    },
    'This order has expired': {
        title: 'Commande expirée',
        message: 'Le délai de 15 minutes est dépassé, vos billets ont été remis en vente.',
    },
    'Only a pending order can be paid': {
        title: 'Paiement impossible',
        message: 'Cette commande n’est plus en attente de paiement.',
    },

    // Événements et types de billets
    'An event with tickets sold cannot go back to draft': {
        title: 'Brouillon impossible',
        message: 'Des billets ont déjà été vendus, l’événement ne peut pas repasser en brouillon.',
    },
    'The dates of an event cannot be in the past': {
        title: 'Dates invalides',
        message: 'Les dates de l’événement ne peuvent pas être dans le passé.',
    },
    'The quantity cannot be lower than the number of tickets already sold': {
        title: 'Quantité trop basse',
        message: 'Le nombre de places ne peut pas être inférieur au nombre de billets déjà vendus.',
    },
};
