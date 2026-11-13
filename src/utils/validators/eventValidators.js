import { EVENT_STATUS_VALUES } from '../../constants/eventStatus';
import { clean, maxLength, required, validateForm } from './common';

const DATE_REGEX = /^(\d{2})\/(\d{2})\/(\d{4})$/;
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
const URL_REGEX = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
const PRICE_REGEX = /^\d+(\.\d{1,2})?$/;

export const EVENT_LIMITS = {
    eventName: 100,
    description: 1000,
    ticketTypeName: 50,
    ticketTypeDescription: 500,
    priceMax: 999.99,
    quantityMax: 1000000,
};

export const validateEventName = (value) =>
    required(value, 'Nom requis') ?? maxLength(value, EVENT_LIMITS.eventName);

export const validateDescription = (value) => maxLength(value, EVENT_LIMITS.description);

export function validateImageUrl(value) {
    const v = clean(value);
    return v && !URL_REGEX.test(v) ? 'Lien invalide (http:// ou https://)' : null;
}

export const validateCategory = (value) => required(value, 'Catégorie requise');

export function validateStatus(value) {
    if (!clean(value)) return 'Statut requis';
    return EVENT_STATUS_VALUES.includes(value) ? null : 'Statut invalide';
}

export function parseDateInput(value) {
    const match = DATE_REGEX.exec(clean(value));
    if (!match) return null;
    const [, day, month, year] = match.map(Number);
    const date = new Date(year, month - 1, day);
    return date.getDate() === day && date.getMonth() === month - 1 ? date : null;
}

export function validateDate(value) {
    if (!clean(value)) return 'Date requise';
    return parseDateInput(value) ? null : 'Date invalide (JJ/MM/AAAA)';
}

export function validateTime(value) {
    if (!clean(value)) return 'Heure requise';
    return TIME_REGEX.test(clean(value)) ? null : 'Heure invalide (HH:MM)';
}

export const EVENT_RULES = {
    name: validateEventName,
    description: validateDescription,
    image_url: validateImageUrl,
    category_name: validateCategory,
    status: validateStatus,
    start_date: validateDate,
    start_time: validateTime,
    end_date: validateDate,
    end_time: validateTime,
};

const toDateTime = (date, time) => {
    const [hours, minutes] = time.split(':').map(Number);
    const d = parseDateInput(date);
    d.setHours(hours, minutes);
    return d;
};

export function validateEventForm(form, { changed = {}, initial = {} } = {}) {
    const errors = validateForm(form, EVENT_RULES);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (const field of ['start_date', 'end_date']) {
        if (!errors[field] && changed[field] && parseDateInput(form[field]) < today) {
            errors[field] = 'Date déjà passée';
        }
    }

    const datesValid = !['start_date', 'start_time', 'end_date', 'end_time'].some((f) => errors[f]);
    if (datesValid && toDateTime(form.end_date, form.end_time) <= toDateTime(form.start_date, form.start_time)) {
        errors.end_time = 'La fin doit être après le début';
    }

    if (initial.image_url && !clean(form.image_url)) {
        errors.image_url = 'L’image ne peut pas être retirée, remplacez le lien';
    }
    return errors;
}

export const validateTicketTypeName = (value) =>
    required(value, 'Nom requis') ?? maxLength(value, EVENT_LIMITS.ticketTypeName);

export const validateTicketTypeDescription = (value) => maxLength(value, EVENT_LIMITS.ticketTypeDescription);

export const parsePrice = (value) => Number(clean(value).replace(',', '.'));

export function validatePrice(value) {
    const v = clean(value).replace(',', '.');
    if (!v) return 'Prix requis';
    if (!PRICE_REGEX.test(v)) return 'Prix invalide (ex. 12,50)';
    if (Number(v) > EVENT_LIMITS.priceMax) return 'Prix trop élevé';
    return null;
}

export function validateQuantity(value, sold = 0) {
    const v = clean(value);
    if (!v) return 'Quantité requise';
    if (!/^\d+$/.test(v)) return 'Nombre entier positif';
    if (Number(v) > EVENT_LIMITS.quantityMax) return 'Quantité trop grande';
    if (Number(v) < sold) return `Au moins ${sold} (billets déjà vendus)`;
    return null;
}

export const ticketTypeRules = (sold = 0) => ({
    name: validateTicketTypeName,
    description: validateTicketTypeDescription,
    price: validatePrice,
    available_quantity: (value) => validateQuantity(value, sold),
});

export const TICKET_TYPE_RULES = ticketTypeRules();
