import { useEffect } from 'react';
import * as NavigationBar from 'expo-navigation-bar';

// Cache la barre de navigation Android (boutons retour / accueil) au lancement
export default function useHideNavigationBar() {
    useEffect(() => {
        NavigationBar.setVisibilityAsync('hidden');
    }, []);
}
