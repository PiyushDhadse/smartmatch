// hooks/useApi.js
import { useAuth } from "@/app/context/AuthContext";

export function useApi() {
  const { session } = useAuth();

  const authenticatedFetch = async (endpoint, options = {}) => {
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
      {
        ...options,
        headers,
      },
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  };

  return { authenticatedFetch };
}
