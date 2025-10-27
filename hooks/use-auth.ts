// src/hooks/use-auth.js (or similar)
import { useRouter } from 'next/navigation';
import { logout } from '@/app/services/api';

export const useAuthLogout = () => {
    const router = useRouter();

 
    const handleLogout = async () => {
        // 1. Execute the comprehensive cleanup (server and client cookies)
        await logout();

        // 2. Redirect the user to the login page
        await router.push('/login');
    };

    return { handleLogout };
};