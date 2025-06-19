import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { GearItem, GearPerformance } from "@/types/gear";

export function useGear() {
  const queryClient = useQueryClient();

  const gearItems = useQuery({
    queryKey: ["/api/gear"],
  });

  const getGearByCategory = (category?: string) => {
    return useQuery({
      queryKey: ["/api/gear", category],
      queryFn: async () => {
        const response = await fetch(`/api/gear${category ? `?category=${category}` : ""}`);
        if (!response.ok) throw new Error("Failed to fetch gear");
        return response.json();
      },
    });
  };

  const addGearItem = useMutation({
    mutationFn: async (gear: Omit<GearItem, "id" | "createdAt">) => {
      const response = await apiRequest("POST", "/api/gear", gear);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gear"] });
    },
  });

  const addPerformanceRating = useMutation({
    mutationFn: async ({ 
      gearId, 
      rating, 
      notes 
    }: { 
      gearId: string; 
      rating: number; 
      notes?: string; 
    }) => {
      const response = await apiRequest("POST", `/api/gear/${gearId}/performance`, {
        rating,
        notes,
        dateLogged: new Date().toISOString().split('T')[0]
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gear"] });
    },
  });

  return {
    gearItems,
    getGearByCategory,
    addGearItem,
    addPerformanceRating,
  };
}

export function useAnalytics() {
  const stats = useQuery({
    queryKey: ["/api/analytics/stats"],
  });

  return { stats };
}
