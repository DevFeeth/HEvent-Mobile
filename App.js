import { NavigationContainer } from '@react-navigation/native';

import { AuthProvider } from './src/context/AuthContext';
import BottomTabs from './src/navigation/BottomTabs';
import useHideNavigationBar from './src/hooks/useHideNavigationBar';

export default function App() {
    useHideNavigationBar();

    return (
        <AuthProvider>
            <NavigationContainer>
                <BottomTabs />
            </NavigationContainer>
        </AuthProvider>
    );
}
