// providers.tsx (or providers.ts)
"use client";

import { NextUIProvider } from "@nextui-org/react";
import { ReduxProvider } from "./reduxProvider";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function RootWrapper({ children }: { children: React.ReactNode }) {
  return (
    <NextUIProvider>
      <ReduxProvider>{children}</ReduxProvider>
      <ToastContainer />
    </NextUIProvider>
  );
}
