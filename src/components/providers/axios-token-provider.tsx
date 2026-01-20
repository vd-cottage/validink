'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { setAuthToken } from '@/lib/services/api';

export function AxiosTokenProvider({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === 'loading') {
            // Session is still loading, don't do anything yet
            return;
        }

        if (session?.user?.accessToken) {
            // Set the token - interceptor will inject it into all requests
            setAuthToken(session.user.accessToken);
        } else {
            // Clear the token
            setAuthToken(null);
        }
    }, [session, status]);

    return <>{children}</>;
}
