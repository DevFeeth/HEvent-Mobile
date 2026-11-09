const NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:[ '-][A-Za-zÀ-ÖØ-öø-ÿ]+)*$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const POSTAL_CODE_REGEX = /^\d{4}$/;

export const LIMITS = {
    name: 50,
    email: 254,
    passwordMin: 8,
    passwordMax: 72,
    address: 100,
    postalCode: 4,
    city: 60,
    eventName: 100,
    description: 1000,
    quantityMax: 1000000,
    ticketTypeName: 50,
    ticketTypeDescription: 500,
    priceMax: 99999999.99,
};

const DATE_REGEX = /^(\d{2})\/(\d{2})\/(\d{4})$/;
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
const URL_REGEX = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

const clean = (value) => (value ?? '').toString().trim();

function validateName(value, label) {
    const v = clean(value);
    if (!v) return `${label} requis`;
    if (v.length > LIMITS.name) return `${LIMITS.name} caractères maximum`;
    if (!NAME_REGEX.test(v)) return `${label} invalide`;
    return null;
}

export const validateFirstName = (value) => validateName(value, 'Prénom');

export const validateLastName = (value) => validateName(value, 'Nom');

export function validateEmail(value) {
    const v = clean(value);
    if (!v) return 'E-mail requis';
    if (v.length > LIMITS.email || !EMAIL_REGEX.test(v)) return 'E-mail invalide';
    return null;
}

export function validateLoginPassword(value) {
    return value ? null : 'Mot de passe requis';
}

export function validateNewPassword(value) {
    const v = value ?? '';
    if (!v) return 'Mot de passe requis';
    if (v.length < LIMITS.passwordMin) return `${LIMITS.passwordMin} caractères minimum`;
    if (v.length > LIMITS.passwordMax) return `${LIMITS.passwordMax} caractères maximum`;
    return null;
}

export function validateAddress(value) {
    const v = clean(value);
    if (v.length > LIMITS.address) return `${LIMITS.address} caractères maximum`;
    return null;
}

export function validatePostalCode(value) {
    const v = clean(value);
    if (v && !POSTAL_CODE_REGEX.test(v)) return '4 chiffres';
    return null;
}

export function validateCity(value) {
    const v = clean(value);
    if (!v) return null;
    if (v.length > LIMITS.city) return `${LIMITS.city} caractères maximum`;
    if (!NAME_REGEX.test(v)) return 'Ville invalide';
    return null;
}

export const LOGIN_RULES = {
    email: validateEmail,
    password: validateLoginPassword,
};

export const REGISTER_RULES = {
    first_name: validateFirstName,
    last_name: validateLastName,
    email: validateEmail,
    password: validateNewPassword,
};

export const PROFILE_RULES = {
    first_name: validateFirstName,
    last_name: validateLastName,
    address: validateAddress,
    postal_code: validatePostalCode,
    city: validateCity,
};

export function validateForm(form, rules) {
    const errors = {};
    for (const [field, validator] of Object.entries(rules)) {
        const error = validator(form[field]);
        if (error) errors[field] = error;
    }
    return errors;
}

// --- Événement ---

export function validateEventName(value) {
    const v = clean(value);
    if (!v) return 'Nom requis';
    if (v.length > LIMITS.eventName) return `${LIMITS.eventName} caractères maximum`;
    return null;
}

export function validateDescription(value) {
    const v = clean(value);
    if (v.length > LIMITS.description) return `${LIMITS.description} caractères maximum`;
    return null;
}

export function validateImageUrl(value) {
    const v = clean(value);
    if (v && !URL_REGEX.test(v)) return 'Lien invalide (http:// ou https://)';
    return null;
}

export function validateCategory(value) {
    return clean(value) ? null : 'Catégorie requise';
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

// Règles par champ + règles entre champs (fin après début, pas de date passée)
// changed : champs modifiés → on ne refuse une date passée que si elle a été changée,
// sinon un événement en cours ne pourrait plus être modifié
export function validateEventForm(form, changed = {}) {
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
    return errors;
}

// --- Type de billet ---

export function validateTicketTypeName(value) {
    const v = clean(value);
    if (!v) return 'Nom requis';
    if (v.length > LIMITS.ticketTypeName) return `${LIMITS.ticketTypeName} caractères maximum`;
    return null;
}

export function validateTicketTypeDescription(value) {
    const v = clean(value);
    if (v.length > LIMITS.ticketTypeDescription) return `${LIMITS.ticketTypeDescription} caractères maximum`;
    return null;
}

// "12,5" → 12.5 (on accepte la virgule du clavier français)
export const parsePrice = (value) => Number(clean(value).replace(',', '.'));

export function validatePrice(value) {
    const v = clean(value).replace(',', '.');
    if (!v) return 'Prix requis';
    if (!/^\d+(\.\d{1,2})?$/.test(v)) return 'Prix invalide (ex. 12,50)';
    if (Number(v) > LIMITS.priceMax) return 'Prix trop élevé';
    return null;
}

export function validateQuantity(value) {
    const v = clean(value);
    if (!v) return 'Quantité requise';
    if (!/^\d+$/.test(v)) return 'Nombre entier positif';
    if (Number(v) > LIMITS.quantityMax) return 'Quantité trop grande';
    return null;
}

export const TICKET_TYPE_RULES = {
    name: validateTicketTypeName,
    description: validateTicketTypeDescription,
    price: validatePrice,
    available_quantity: validateQuantity,
};

// Total des places d'un événement = billets déjà vendus + places encore en vente de chaque type
// (available_quantity est le stock restant : il baisse à chaque vente)
export const totalCapacity = (soldCount, ticketTypes) =>
    soldCount + ticketTypes.reduce((sum, t) => sum + Number(t.available_quantity), 0);
