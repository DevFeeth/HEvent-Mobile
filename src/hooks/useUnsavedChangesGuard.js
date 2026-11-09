import { useEffect, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';

export default function useUnsavedChangesGuard(hasChanges) {
    const navigation = useNavigation();
    const [pendingAction, setPendingAction] = useState(null);
    const allowLeave = useRef(false);

    useEffect(
        () =>
            navigation.addListener('beforeRemove', (e) => {
                if (!hasChanges || allowLeave.current) return;
                e.preventDefault();
                setPendingAction(e.data.action);
            }),
        [navigation, hasChanges]
    );

    // Après un enregistrement réussi : on quitte sans popup
    const leaveWithoutPrompt = () => {
        allowLeave.current = true;
        navigation.goBack();
    };

    const disableGuard = () => {
        allowLeave.current = true;
    };

    return {
        leaveWithoutPrompt,
        disableGuard,
        popupProps: {
            visible: !!pendingAction,
            onConfirm: () => {
                allowLeave.current = true;
                const action = pendingAction;
                setPendingAction(null);
                navigation.dispatch(action);
            },
            onCancel: () => setPendingAction(null),
        },
    };
}
