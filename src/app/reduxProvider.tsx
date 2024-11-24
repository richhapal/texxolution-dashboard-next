// providers.tsx (or providers.ts)
"use client";

import { Provider } from "react-redux";
import { store } from "../_lib/store/store";

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}
