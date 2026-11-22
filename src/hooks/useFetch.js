import { useCallback, useEffect, useRef, useState } from 'react';

export default function useFetch(fetcher, deps = []) {
    const key = JSON.stringify(deps);
    const [result, setResult] = useState({ key: null, data: null, error: null });
    const [refreshing, setRefreshing] = useState(false);

    const fetcherRef = useRef(fetcher);
    useEffect(() => {
        fetcherRef.current = fetcher;
    });

    const lastRequest = useRef(0);
    const controllerRef = useRef(null);

    // Annule la requête en cours : sa réponse sera ignorée et la connexion HTTP coupée
    const cancel = useCallback(() => {
        lastRequest.current++;
        controllerRef.current?.abort();
    }, []);

    const run = useCallback(
        (runKey) => {
            cancel();
            const id = lastRequest.current;
            const controller = new AbortController();
            controllerRef.current = controller;
            return fetcherRef
                .current(controller.signal)
                .then(
                    (data) => ({ data, error: null }),
                    (error) => ({ data: null, error })
                )
                .then((res) => {
                    if (id === lastRequest.current) setResult({ key: runKey, ...res });
                });
        },
        [cancel]
    );

    // Cleanup : écran quitté ou dépendances changées avant la réponse
    useEffect(() => {
        run(key);
        return cancel;
    }, [key, run, cancel]);

    const refetch = useCallback(() => {
        setRefreshing(true);
        return run(key).finally(() => setRefreshing(false));
    }, [key, run]);

    const current = result.key === key;
    return {
        data: current ? result.data : null,
        error: current ? result.error : null,
        loading: !current || refreshing,
        refetch,
    };
}
