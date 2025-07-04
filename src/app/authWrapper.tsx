"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/_lib/store/store";
import { useGetProfileQuery } from "@/_lib/rtkQuery/authRTKQuery";
import { loginSuccess, logout } from "@/_lib/store/userSlice";

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAppSelector((state) => state.userSlice);

  // Check current path to allow access to auth pages
  const isAuthPage = pathname === "/signin" || pathname === "/signup";

  // Check if current path requires authentication (dashboard pages)
  const isDashboardPage =
    pathname.startsWith("/dashboard/") || pathname === "/dashboard";

  // Check if it's a protected page (not auth pages and not root)
  const isProtectedPage = !isAuthPage && pathname !== "/";

  // Check if token exists in cookies
  const getTokenFromCookie = () => {
    if (typeof window !== "undefined") {
      const match = document.cookie.match(/(^| )token=([^;]+)/);
      return match ? match[2] : null;
    }
    return null;
  };

  const cookieToken = getTokenFromCookie();

  // Fetch profile only if we have a token but no user data
  const shouldFetchProfile = cookieToken && !isAuthenticated;

  const {
    data: profileData,
    error: profileError,
    isLoading: profileLoading,
  } = useGetProfileQuery(undefined, {
    skip: !shouldFetchProfile,
  });

  // Handle profile fetch results
  useEffect(() => {
    if (profileData && cookieToken) {
      dispatch(
        loginSuccess({
          user: profileData?.profile,
          token: cookieToken,
        })
      );
    }

    if (profileError) {
      // If profile fetch fails (401, etc.), clear auth and redirect to signin
      const error = profileError as any;
      if (
        error?.status === 401 ||
        error?.data?.message?.includes("unauthorized")
      ) {
        dispatch(logout());
        // Clear the invalid token from cookies
        document.cookie =
          "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        router.push("/signin");
      }
    }

    // Authentication logic based on page type
    if (isAuthPage) {
      // If user is already authenticated and tries to access signin/signup, redirect to dashboard
      if (isAuthenticated && cookieToken) {
        router.push("/");
      }
      // Allow access to auth pages for non-authenticated users
      return;
    }

    if (isProtectedPage || isDashboardPage) {
      // Protected pages require authentication
      if (!cookieToken && !isAuthenticated) {
        router.push("/signin");
        return;
      }
    }

    // For root page ("/"), allow access regardless of auth status
  }, [
    profileData,
    profileError,
    cookieToken,
    dispatch,
    router,
    isAuthenticated,
    isAuthPage,
    isProtectedPage,
    isDashboardPage,
    pathname,
  ]);

  return <>{children}</>;
}
