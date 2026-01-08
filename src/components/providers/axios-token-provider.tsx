'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { api, setSessionReady } from '@/lib/services/api';

export function AxiosTokenProvider({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === 'loading') {
            // Session is still loading, don't do anything yet
            return;
        }

        if (session?.user?.accessToken) {
            // Set the token for all future requests
            api.defaults.headers.common['Authorization'] = `Bearer ${session.user.accessToken}`;
            // Mark session as ready - 401 errors will now trigger signOut
            setSessionReady(true);
        } else {
            // Clear the token if no session
            delete api.defaults.headers.common['Authorization'];
            // Only mark as ready if status is 'unauthenticated' (not 'loading')
            if (status === 'unauthenticated') {
                setSessionReady(true);
            }
        }
    }, [session, status]);

    return <>{children}</>;
}
