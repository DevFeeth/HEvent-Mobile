import { useDispatch } from 'react-redux';

import useFetch from './useFetch';

// Charge des données depuis l'API et les range dans le store avec l'action donnée.
// L'écran lit ensuite les données avec useSelector ; ce hook ne renvoie que loading, error et refetch.
export default function useStoreLoader(fetcher, toAction, deps = []) {
    const dispatch = useDispatch();
    const { loading, error, refetch } = useFetch(
        (signal) => fetcher(signal).then((data) => dispatch(toAction(data))),
        deps
    );
    return { loading, error, refetch };
}
