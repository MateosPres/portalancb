import { useEffect } from 'react';

export const useScrollToTop = (trigger: unknown) => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [trigger]);
};
