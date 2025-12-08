'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { api } from '@/lib/services/api';

export function AxiosTokenProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();

    useEffect(() => {
        if (session?.user?.accessToken) {
            // Set the token for all future requests
            api.defaults.headers.common['Authorization'] = `Bearer ${session.user.accessToken}`;
        } else {
            // Clear the token if no session
            delete api.defaults.headers.common['Authorization'];
        }
    }, [session]);

    return <>{children}</>;
}
