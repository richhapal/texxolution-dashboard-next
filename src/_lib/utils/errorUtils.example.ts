// Example usage of error utilities

import { useEffect } from "react";
import { toast } from "react-toastify";
import {
  is401Error,
  handleAPIError,
  getErrorMessage,
} from "@/_lib/utils/errorUtils";

// Mock hook for example purposes
const useSomeQuery = () => ({ data: null, error: null, isError: false });

// Example 1: Simple error handling in useEffect
const ExampleComponent = () => {
  const { data, error, isError } = useSomeQuery();

  useEffect(() => {
    if (isError && error) {
      handleAPIError(error, toast); // Automatically handles 401s and shows appropriate toasts
    }
  }, [isError, error]);

  // Handle 401 separately for UI
  if (error && is401Error(error)) {
    // Return JSX for PermissionDenied component
    // return <PermissionDenied onRetry={() => refetch()} />;
    return "Permission denied component would be returned here";
  }

  return "Component content would be here";
};

// Example 2: Handling errors in mutation functions
const handleSubmit = async (data: any) => {
  try {
    // await someMutation(data).unwrap();
    console.log("Operation would be performed with:", data);
    toast.success("Operation successful!");
  } catch (error: any) {
    handleAPIError(error, toast); // Will show appropriate error message
  }
};

// Example 3: Manual error message extraction
const getCustomErrorMessage = (error: any) => {
  if (is401Error(error)) {
    return "You need to login again";
  }
  return getErrorMessage(error);
};
