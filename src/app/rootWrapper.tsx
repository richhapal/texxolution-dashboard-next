// providers.tsx (or providers.ts)
"use client";

import { HeroUIProvider } from "@heroui/react";
import { ReduxProvider } from "./reduxProvider";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function RootWrapper({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <ReduxProvider>{children}</ReduxProvider>
      <ToastContainer />
    </HeroUIProvider>
  );
}
