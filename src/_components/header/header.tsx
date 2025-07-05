"use client";

import Link from "next/link";
import {
  Button,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { useAppSelector, useAppDispatch } from "@/_lib/store/store";
import { logout } from "@/_lib/store/userSlice";
import { useRouter } from "next/navigation";
import { User, LogOut, Settings, Crown } from "lucide-react";

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

  const getUserInitials = (name: string, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  return (
    <header className="w-full border-b bg-white/95 backdrop-blur-md shadow-sm relative z-50">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-transparent to-purple-50/50"></div>

      <div className="container mx-auto flex h-16 items-center justify-between px-6 relative z-10">
        {/* Logo Section */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="group flex items-center gap-2 transition-all duration-300 hover:scale-105"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
              <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center">
                <div className="w-3 h-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-sm"></div>
              </div>
            </div>
            <div className="text-xl font-bold">
              <span className="text-[#CE1345] drop-shadow-sm">tex</span>
              <span className="text-gray-800 drop-shadow-sm">xolutions</span>
            </div>
          </Link>

          <div className="hidden sm:flex items-center gap-3">
            <div className="w-px h-6 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
              <span className="text-[#0087B7] font-medium text-sm">
                Dashboard
              </span>
            </div>
          </div>
        </div>

        {/* User Section */}
        <div className="flex items-center gap-4">
          {isAuthenticated && user ? (
            // Authenticated user UI
            <div className="flex items-center gap-3">
              {/* Welcome message - hidden on mobile */}
              <div className="hidden md:block text-right">
                <div className="text-sm font-medium text-gray-700">
                  Welcome back!
                </div>
                <div className="text-xs text-gray-500">
                  {user.name || user.email}
                </div>
              </div>

              {/* User Avatar with Dropdown */}
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <div className="flex items-center gap-2 cursor-pointer group">
                    <Avatar
                      size="sm"
                      name={getUserInitials(user.name || "", user.email || "")}
                      className="transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                      classNames={{
                        base: "bg-gradient-to-br from-blue-500 to-purple-600 text-white",
                        name: "text-white font-semibold text-xs",
                      }}
                    />
                    {/* Role indicator */}
                    {user.userType === "superadmin" && (
                      <div className="w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-sm">
                        <Crown className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="User menu"
                  classNames={{
                    base: "w-64 p-2",
                    list: "gap-2",
                  }}
                >
                  <DropdownItem
                    key="profile"
                    className="h-14 gap-2 opacity-100"
                    textValue="Profile"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        size="sm"
                        name={getUserInitials(
                          user.name || "",
                          user.email || ""
                        )}
                        classNames={{
                          base: "bg-gradient-to-br from-blue-500 to-purple-600 text-white",
                          name: "text-white font-semibold text-xs",
                        }}
                      />
                      <div className="flex flex-col">
                        <p className="text-sm font-semibold">
                          {user.name || user.email}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </DropdownItem>
                  <DropdownItem
                    key="settings"
                    startContent={<Settings className="w-4 h-4" />}
                    className="text-gray-700"
                  >
                    Account Settings
                  </DropdownItem>
                  <DropdownItem
                    key="logout"
                    className="text-danger"
                    color="danger"
                    startContent={<LogOut className="w-4 h-4" />}
                    onPress={handleLogout}
                  >
                    Log Out
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          ) : (
            // Non-authenticated user UI
            <div className="flex items-center gap-3">
              <Link href="/signin">
                <Button
                  color="primary"
                  variant="light"
                  size="sm"
                  className="font-medium hover:scale-105 transition-transform duration-200"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Bottom border gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent"></div>
    </header>
  );
}
