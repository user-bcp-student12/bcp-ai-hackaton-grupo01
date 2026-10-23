import { healthResponseSchema } from "@wallet/contracts";
import { useQuery } from "@tanstack/react-query";
import { getJson } from "../../lib/apiClient";

export function useHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: () => getJson("/health", healthResponseSchema),
  });
}
