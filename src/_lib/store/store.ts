// store.ts
import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import rootReducer from "./rootReducer";
import { listApi } from "../rtkQuery/listRtkQuery";
import { authApi } from "../rtkQuery/authRTKQuery";
import { uploadApi } from "../rtkQuery/uploadRTKQuery";
import { productDashboardApi } from "../rtkQuery/productDashboardRTKQuery";
import { purchaseApi } from "../rtkQuery/purchaseRTKQuery";

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          // Ignore these action types
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/REGISTER",
        ],
        ignoredPaths: ["purchaseApi.mutations.exportPurchases"],
      },
    })
      .concat(listApi.middleware)
      .concat(authApi.middleware)
      .concat(uploadApi.middleware)
      .concat(productDashboardApi.middleware)
      .concat(purchaseApi.middleware),
});

// Types for dispatch and state
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

// Hooks for using redux in components
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
