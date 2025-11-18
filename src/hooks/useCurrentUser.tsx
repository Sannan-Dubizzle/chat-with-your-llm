import { useQuery } from "@tanstack/react-query";

import { CurrentAdminResponse } from "@/types/api";

/**
 * Hook to fetch the current admin user information
 * 
 * Fetches user data from /api/cp/admins/current endpoint
 * Redirects to LOGIN_URL (VITE_LOGIN_URL) if the request fails with 401, 404, 422, 500, etc.
 * 
 * @returns Query result with admin user data, loading state, and error state
 */
export const useCurrentUser = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
  const normalizedBase = baseUrl && !/^https?:\/\//i.test(baseUrl) ? `http://${baseUrl}` : baseUrl;
  const apiUrl = normalizedBase || window.location.origin;
  const loginUrl = import.meta.env.VITE_LOGIN_URL || "";
  
  // Debug: Log environment variables
  if (loginUrl) {
    console.log(`[useCurrentUser] VITE_LOGIN_URL is set to: ${loginUrl}`);
  } else {
    console.warn(`[useCurrentUser] VITE_LOGIN_URL is not set, will fallback to origin`);
  }
  
  const query = useQuery<CurrentAdminResponse>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      try {
        const url = new URL("/api/cp/admins/current", apiUrl);
        const response = await fetch(url.toString(), {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });

        // Check for error status codes that should trigger redirect
        
        const status = response.status;
        
        // Redirect immediately on 4xx and 5xx status codes (401, 404, 422, 500, etc.)
        if (status >= 400) {
          // Redirect to login_url
          const redirectUrl = loginUrl || window.location.origin;
          console.log(`[useCurrentUser] Redirecting due to status ${status} to: ${redirectUrl}`);
          
          // Use replace() for a hard redirect that doesn't allow going back
          window.location.replace(redirectUrl);
          
          // Return a promise that never resolves to prevent further processing
          return new Promise(() => {});
        }
        
        // For other errors, throw normally
        throw new Error(`Failed to fetch current user: ${status}`);
      

        return response.json();
      } catch (error: any) {
        // Handle network errors, CORS errors, and other fetch failures
        console.error(`[useCurrentUser] Fetch error:`, error);
        
        // Convert error to string to check message
        const errorMessage = String(error?.message || error || '');
        const errorString = errorMessage.toLowerCase();
        
        // Check if error message contains status code (e.g., "401", "404", etc.)
        const statusMatch = errorMessage.match(/(\d{3})/);
        const status = statusMatch ? parseInt(statusMatch[1], 10) : null;
        
        // Check for common error patterns that indicate unauthorized/forbidden access
        const isUnauthorized = status === 401 || 
                              errorString.includes('401') || 
                              errorString.includes('unauthorized') ||
                              errorString.includes('err_failed') ||
                              errorString.includes('cors');
        
        // Always redirect on any fetch error when trying to get current user
        // This handles CORS errors, network errors, and HTTP errors
        const redirectUrl = loginUrl || window.location.origin;
        console.log(`[useCurrentUser] Redirecting due to error (status: ${status || 'unknown'}, message: ${errorMessage.substring(0, 100)}) to: ${redirectUrl}`);
        
        // Use replace() for a hard redirect that doesn't allow going back
        // Use setTimeout to ensure redirect happens even if there are pending operations
        setTimeout(() => {
          window.location.replace(redirectUrl);
        }, 0);
        
        // Return a promise that never resolves to prevent further processing
        return new Promise(() => {});
      }
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: false, // Disable retry to prevent multiple redirect attempts
  });

  return query;
};

