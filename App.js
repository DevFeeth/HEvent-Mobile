import { NavigationContainer } from '@react-navigation/native';

import BottomTabs from './src/navigation/BottomTabs';
import useHideNavigationBar from './src/hooks/useHideNavigationBar';

export default function App() {
    useHideNavigationBar();

    return (
        <NavigationContainer>
            <BottomTabs />
        </NavigationContainer>
    );
}
