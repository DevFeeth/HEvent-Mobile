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

    const run = useCallback((runKey) => {
        const id = ++lastRequest.current;
        return fetcherRef
            .current()
            .then(
                (data) => ({ data, error: null }),
                (error) => ({ data: null, error })
            )
            .then((res) => {
                if (id === lastRequest.current) setResult({ key: runKey, ...res });
            });
    }, []);

    const cancel = useCallback(() => {
        lastRequest.current++;
    }, []);

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
