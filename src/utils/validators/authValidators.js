import { clean, maxLength, required } from './common';

const NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:[ '-][A-Za-zÀ-ÖØ-öø-ÿ]+)*$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const POSTAL_CODE_REGEX = /^\d{4}$/;

export const AUTH_LIMITS = {
    name: 50,
    email: 254,
    passwordMin: 8,
    passwordMax: 72,
    address: 100,
    postalCode: 4,
    city: 60,
};

function validateName(value, label) {
    return (
        required(value, `${label} requis`) ??
        maxLength(value, AUTH_LIMITS.name) ??
        (NAME_REGEX.test(clean(value)) ? null : `${label} invalide`)
    );
}

export const validateFirstName = (value) => validateName(value, 'Prénom');

export const validateLastName = (value) => validateName(value, 'Nom');

export function validateEmail(value) {
    const v = clean(value);
    if (!v) return 'E-mail requis';
    if (v.length > AUTH_LIMITS.email || !EMAIL_REGEX.test(v)) return 'E-mail invalide';
    return null;
}

export function validateLoginPassword(value) {
    return value ? null : 'Mot de passe requis';
}

export function validateNewPassword(value) {
    const v = value ?? '';
    if (!v) return 'Mot de passe requis';
    if (v.length < AUTH_LIMITS.passwordMin) return `${AUTH_LIMITS.passwordMin} caractères minimum`;
    if (v.length > AUTH_LIMITS.passwordMax) return `${AUTH_LIMITS.passwordMax} caractères maximum`;
    return null;
}

export const validateAddress = (value) => maxLength(value, AUTH_LIMITS.address);

export function validatePostalCode(value) {
    const v = clean(value);
    return v && !POSTAL_CODE_REGEX.test(v) ? '4 chiffres' : null;
}

export function validateCity(value) {
    if (!clean(value)) return null;
    return maxLength(value, AUTH_LIMITS.city) ?? (NAME_REGEX.test(clean(value)) ? null : 'Ville invalide');
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
