import { useState, useEffect } from "react";

// Custom hook to manage pagination limit with localStorage
export function usePaginationLimit(
  defaultLimit: number = 10,
  storageKey: string = "customer-list-limit"
) {
  const [limit, setLimit] = useState<number | null>(null);

  // Load limit from localStorage on component mount
  useEffect(() => {
    try {
      const savedLimit = localStorage.getItem(storageKey);
      if (savedLimit) {
        const parsedLimit = parseInt(savedLimit, 10);
        if (!isNaN(parsedLimit) && parsedLimit > 0) {
          setLimit(parsedLimit);
        } else {
          setLimit(defaultLimit);
        }
      } else {
        setLimit(defaultLimit);
      }
    } catch (error) {
      console.error("Error loading pagination limit from localStorage:", error);
      setLimit(defaultLimit);
    }
  }, [defaultLimit, storageKey]);

  // Save limit to localStorage whenever it changes
  const updateLimit = (newLimit: number) => {
    try {
      localStorage.setItem(storageKey, newLimit.toString());
      setLimit(newLimit);
    } catch (error) {
      console.error("Error saving pagination limit to localStorage:", error);
      setLimit(newLimit);
    }
  };

  return { limit, updateLimit };
}
