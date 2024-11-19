"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "~/store/auth-store";
import { toast } from "sonner";

export default function AuthErrorBoundary({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { site_company, clear_auth_session } = useAuthStore();

    useEffect(() => {
        let mounted = true;
        let hasCheckedAuth = false;

        const handleAuthError = () => {
            if (!mounted || hasCheckedAuth) return;

            const isLoginPage = pathname.includes('/sign-in');
            const wasAuthenticated = localStorage.getItem('auth-storage') !== null;

            if (!isLoginPage && wasAuthenticated && !site_company?.company_prefix) {
                clear_auth_session();
                router.push("/sign-in");
                toast.error("Session expired. Please login again.");
            }

            hasCheckedAuth = true;
        };

        // Delay initial check
        const timer = setTimeout(handleAuthError, 1000);

        return () => {
            mounted = false;
            clearTimeout(timer);
        };
    }, [site_company, router, clear_auth_session, pathname]);

    // Don't block rendering on auth pages
    if (pathname.includes('/sign-in')) {
        return <>{children}</>;
    }

    try {
        // Check auth state
        const hasAuthData = localStorage.getItem('auth-storage') !== null;
        if (!hasAuthData && !pathname.includes('/sign-in')) {
            throw new Error('Authentication required');
        }

        return <>{children}</>;
    } catch (error) {
        // This will trigger the error boundary
        throw new Error('Authentication required');
    }
}