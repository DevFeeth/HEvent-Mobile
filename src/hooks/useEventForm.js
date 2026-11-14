import { useMemo, useState } from 'react';

import { ApiError } from '../utils/ApiError';
import { dateInputToApi, isoToDateInput, isoToTimeInput } from '../utils/formatDateTime';
import { validateEventForm } from '../utils/validators/eventValidators';

const toForm = (event = {}) => ({
    name: event.name ?? '',
    description: event.description ?? '',
    image_url: event.image_url ?? '',
    category_name: event.category_name ?? '',
    status: event.status ?? 'DRAFT',
    start_date: isoToDateInput(event.start_date),
    start_time: isoToTimeInput(event.start_time),
    end_date: isoToDateInput(event.end_date),
    end_time: isoToTimeInput(event.end_time),
});

const TO_API = {
    name: (v) => v.trim(),
    description: (v) => v.trim(),
    image_url: (v) => v.trim(),
    category_name: (v) => v,
    status: (v) => v,
    start_date: dateInputToApi,
    start_time: (v) => v,
    end_date: dateInputToApi,
    end_time: (v) => v,
};

const REFUSALS = {
    'An event with tickets sold cannot go back to draft': {
        title: 'Brouillon impossible',
        message: 'Des billets ont déjà été vendus, l’événement ne peut pas repasser en brouillon.',
    },
    'The dates of an event cannot be in the past': {
        title: 'Dates invalides',
        message: 'Les dates de l’événement ne peuvent pas être dans le passé.',
    },
};

export const toEventError = (err) => (err instanceof ApiError && REFUSALS[err.message]) || err;

export default function useEventForm(event) {
    const initial = useMemo(() => toForm(event), [event]);
    const [form, setForm] = useState(initial);
    const [errors, setErrors] = useState({});

    const update = (field, mask) => (value) =>
        setForm((f) => ({ ...f, [field]: mask ? mask(value) : value }));

    const changed = Object.fromEntries(
        Object.keys(TO_API)
            .filter((field) => form[field].trim() !== initial[field].trim())
            .map((field) => [field, true])
    );

    const validate = () => {
        const next = validateEventForm(form, { changed: event ? changed : TO_API, initial });
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const toChanges = () =>
        Object.fromEntries(Object.keys(changed).map((field) => [field, TO_API[field](form[field])]));

    const toPayload = () =>
        Object.fromEntries(
            Object.keys(TO_API)
                .filter((field) => form[field].trim())
                .map((field) => [field, TO_API[field](form[field])])
        );

    return {
        form,
        update,
        errors,
        changed,
        hasChanges: Object.keys(changed).length > 0,
        validate,
        toChanges,
        toPayload,
    };
}
