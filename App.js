import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';

import OfflineBanner from './src/components/OfflineBanner';
import BottomTabs from './src/navigation/BottomTabs';
import useHideNavigationBar from './src/hooks/useHideNavigationBar';
import useNetworkStatus from './src/hooks/useNetworkStatus';
import useSessionRestore from './src/hooks/useSessionRestore';
import { store } from './src/store';

// Ces hooks utilisent le store : ils doivent être appelés sous le Provider
function Root() {
    useSessionRestore();
    useNetworkStatus();

    return (
        <>
            <NavigationContainer>
                <BottomTabs />
            </NavigationContainer>
            <OfflineBanner />
        </>
    );
}

export default function App() {
    useHideNavigationBar();

    return (
        <Provider store={store}>
            <Root />
        </Provider>
    );
}
