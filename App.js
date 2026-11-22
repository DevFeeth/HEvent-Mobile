import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';

import BottomTabs from './src/navigation/BottomTabs';
import useHideNavigationBar from './src/hooks/useHideNavigationBar';
import useSessionRestore from './src/hooks/useSessionRestore';
import { store } from './src/store';

// useSessionRestore utilise le store : il doit être appelé sous le Provider
function Root() {
    useSessionRestore();

    return (
        <NavigationContainer>
            <BottomTabs />
        </NavigationContainer>
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
