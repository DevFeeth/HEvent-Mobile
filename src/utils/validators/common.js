export const clean = (value) => (value ?? '').toString().trim();

export function validateForm(form, rules) {
    const errors = {};
    for (const [field, validator] of Object.entries(rules)) {
        const error = validator(form[field], form);
        if (error) errors[field] = error;
    }
    return errors;
}

export const hasErrors = (errors) => Object.keys(errors).length > 0;

export function required(value, message) {
    return clean(value) ? null : message;
}

export function maxLength(value, max) {
    return clean(value).length > max ? `${max} caractères maximum` : null;
}
