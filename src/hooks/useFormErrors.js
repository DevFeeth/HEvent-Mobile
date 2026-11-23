import { useState } from 'react';

const ALL = 'all';

// allErrors : erreurs de tout le formulaire, recalculées à chaque rendu (donc à chaque frappe).
// Une erreur n'est affichée qu'une fois le champ quitté (onBlur) ou après une tentative d'envoi.
export default function useFormErrors(allErrors) {
    const [touched, setTouched] = useState({});

    const errors =
        touched === ALL
            ? allErrors
            : Object.fromEntries(Object.entries(allErrors).filter(([field]) => touched[field]));

    const touch = (field) => () =>
        setTouched((t) => (t === ALL || t[field] ? t : { ...t, [field]: true }));

    // À l'envoi : affiche toutes les erreurs et indique si le formulaire est valide
    const validateAll = () => {
        setTouched(ALL);
        return Object.keys(allErrors).length === 0;
    };

    const reset = () => setTouched({});

    return { errors, touch, validateAll, reset };
}
