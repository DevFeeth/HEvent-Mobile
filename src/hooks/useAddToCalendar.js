import { useState } from 'react';
import { Platform } from 'react-native';
// L'API "next" d'expo-calendar n'existe pas dans Expo Go : on utilise l'API legacy
import * as Calendar from 'expo-calendar/legacy';
import { useDispatch, useSelector } from 'react-redux';

import { eventAddedToCalendar, selectIsInCalendar } from '../store/calendarSlice';
import { toLocalDateTime } from '../utils/formatDateTime';

const CALENDAR_ERROR = {
    title: 'Calendrier indisponible',
    message: "Impossible d'ouvrir le calendrier du téléphone.",
};

function eventDates(event) {
    const startDate = toLocalDateTime(event.start_date, event.start_time);
    const endDate = toLocalDateTime(event.end_date ?? event.start_date, event.end_time ?? event.start_time);
    // Événement qui finit après minuit (ex. 22:00 – 02:00 le même jour) : la fin est le lendemain
    if (endDate <= startDate) endDate.setDate(endDate.getDate() + 1);
    return { startDate, endDate };
}

// Ouvre l'écran natif « Nouvel événement », pré-rempli ; l'utilisateur choisit son rappel et valide
export default function useAddToCalendar(event, address) {
    const dispatch = useDispatch();
    const added = useSelector(selectIsInCalendar(event.id));
    const [error, setError] = useState(null);

    const addToCalendar = async () => {
        try {
            const result = await Calendar.createEventInCalendarAsync({
                title: event.name,
                ...eventDates(event),
                location: address ?? undefined,
                notes: event.description ?? undefined,
                alarms: [{ relativeOffset: -60 }],
            });
            // iOS renvoie "saved" ; Android renvoie toujours "done" (impossible de savoir s'il a validé)
            if (result.action === 'saved' || (Platform.OS === 'android' && result.action === 'done')) {
                dispatch(eventAddedToCalendar(event.id));
            }
        } catch {
            setError(CALENDAR_ERROR);
        }
    };

    return {
        available: Platform.OS !== 'web',
        added,
        addToCalendar,
        error,
        clearError: () => setError(null),
    };
}
