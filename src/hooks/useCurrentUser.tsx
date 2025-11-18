import { useQuery } from "@tanstack/react-query";

import { CurrentAdminResponse } from "@/types/api";

/**
 * Hook to fetch the current admin user information
 * 
 * Fetches user data from /api/cp/admins/current endpoint
 * 
 * @returns Query result with admin user data, loading state, and error state
 */
export const useCurrentUser = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
  const normalizedBase = baseUrl && !/^https?:\/\//i.test(baseUrl) ? `http://${baseUrl}` : baseUrl;
  const apiUrl = normalizedBase || window.location.origin;
  
  return useQuery<CurrentAdminResponse>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const url = new URL("/api/cp/admins/current", apiUrl);
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch current user: ${response.status}`);
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: 1,
  });
};

