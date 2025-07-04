"use client";

import Link from "next/link";
import { Button } from "@heroui/react";
import { useAppSelector, useAppDispatch } from "@/_lib/store/store";
import { logout } from "@/_lib/store/userSlice";
import { useRouter } from "next/navigation";

export default function Header() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((state) => state.userSlice);

  const handleLogout = () => {
    dispatch(logout());
    // Clear token from cookies
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    router.push("/signin");
  };

  return (
    <header className="w-full border-b bg-white">
      <div className=" w-full flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-xl font-bold">
            {/* <LogoIcon /> */}
            <span className="text-[#CE1345]">tex</span>
            <span className="text-black">xolutions</span>
            {/* <span className="text-[#F5FDC0]">xolution </span>Admin */}
          </Link>
          <span className="text-muted-foreground text-[#83D6F3]">|</span>
          <span className="text-[#0087B7]">Dashboard</span>
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated && user ? (
            // Authenticated user UI
            <>
              <span className="text-sm text-gray-700">
                Welcome, {user.name || user.email}
              </span>
              <Button
                onClick={handleLogout}
                color="danger"
                variant="light"
                size="sm"
              >
                Log Out
              </Button>
            </>
          ) : (
            // Non-authenticated user UI
            <>
              <Link href="/signin">
                <Button color="primary" variant="light" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button color="secondary" variant="flat" size="sm">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
