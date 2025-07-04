// Error handling utilities for RTK Query
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

export interface SerializedError {
  name?: string;
  message?: string;
  stack?: string;
  code?: string;
}

// RTK Query error types
export type APIError = FetchBaseQueryError | SerializedError | undefined;

// Type guard to check if error is RTK Query error with status
export function isRTKQueryError(error: any): error is FetchBaseQueryError {
  return error && typeof error === "object" && "status" in error;
}

// Type guard to check if error is a serialized error
export function isSerializedError(error: any): error is SerializedError {
  return (
    error &&
    typeof error === "object" &&
    "message" in error &&
    !("status" in error)
  );
}

// Check if error is 401 Unauthorized
export function is401Error(error: APIError): boolean {
  return isRTKQueryError(error) && error.status === 401;
}

// Get error message from any error type
export function getErrorMessage(error: APIError): string {
  if (!error) return "Unknown error occurred";

  if (isRTKQueryError(error)) {
    // Handle RTK Query errors
    if (error.data) {
      if (typeof error.data === "string") {
        return error.data;
      }

      if (typeof error.data === "object" && error.data !== null) {
        const data = error.data as any;
        return data.message || data.error || `Server error: ${error.status}`;
      }
    }

    return `Request failed with status: ${error.status}`;
  }

  if (isSerializedError(error)) {
    return error.message || "Network error occurred";
  }

  return "Unknown error occurred";
}

// Show appropriate error toast (to be used with react-toastify)
export function handleAPIError(error: APIError, toast: any): void {
  // Don't show toast for 401 errors as they should be handled separately
  if (is401Error(error)) {
    return;
  }

  const message = getErrorMessage(error);
  toast.error(message);
}
