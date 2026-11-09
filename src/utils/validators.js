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
};

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
