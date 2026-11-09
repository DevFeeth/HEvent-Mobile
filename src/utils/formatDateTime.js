export const formatDateTime = (date, time) => {
    const d = new Date(date);
    const day = `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${String(d.getUTCFullYear()).slice(-2)}`;
    if (!time) return day;
    const t = new Date(time);
    return `${day} ${pad(t.getUTCHours())}:${pad(t.getUTCMinutes())}`;
};

const pad = (n) => String(n).padStart(2, '0');

export function isoToDateInput(isoDate) {
    if (!isoDate) return '';
    const d = new Date(isoDate);
    return `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`;
}

export function isoToTimeInput(isoTime) {
    if (!isoTime) return '';
    const d = new Date(isoTime);
    return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

export function dateInputToApi(value) {
    const [day, month, year] = value.split('/');
    return `${year}-${month}-${day}`;
}

export function maskDateInput(text) {
    const digits = text.replace(/\D/g, '').slice(0, 8);
    return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)].filter(Boolean).join('/');
}

export function maskTimeInput(text) {
    const digits = text.replace(/\D/g, '').slice(0, 4);
    return digits.length > 2 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : digits;
}
