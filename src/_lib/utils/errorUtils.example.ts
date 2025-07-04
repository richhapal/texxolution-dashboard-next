// Example usage of error utilities

import { toast } from "react-toastify";
import {
  is401Error,
  handleAPIError,
  getErrorMessage,
} from "@/_lib/utils/errorUtils";

// Example 1: Simple error handling in useEffect
const ExampleComponent = () => {
  const { data, error, isError } = useSomeQuery();

  useEffect(() => {
    if (isError && error) {
      handleAPIError(error, toast); // Automatically handles 401s and shows appropriate toasts
    }
  }, [isError, error]);

  // Handle 401 separately for UI
  if (is401Error(error)) {
    return <PermissionDenied onRetry={() => refetch()} />;
  }

  return <div>...</div>;
};

// Example 2: Handling errors in mutation functions
const handleSubmit = async () => {
  try {
    await someMutation(data).unwrap();
    toast.success("Operation successful!");
  } catch (error) {
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
