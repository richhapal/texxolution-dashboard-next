// store.ts
import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import rootReducer from "./rootReducer";
import { listApi } from "../rtkQuery/listRtkQuery";
import { authApi } from "../rtkQuery/authRTKQuery";
import { uploadApi } from "../rtkQuery/uploadRTKQuery";
import { productDashboardApi } from "../rtkQuery/productDashboardRTKQuery";

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(listApi.middleware)
      .concat(authApi.middleware)
      .concat(uploadApi.middleware)
      .concat(productDashboardApi.middleware),
});

// Types for dispatch and state
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

// Hooks for using redux in components
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
