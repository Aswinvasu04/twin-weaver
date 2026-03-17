import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { twinApi, TwinRecord } from "@/lib/api";
import { TwinConfig, SimulationHistory } from "@/lib/simulation";

export function useTwins() {
  return useQuery<TwinRecord[]>({
    queryKey: ["twins"],
    queryFn: twinApi.list,
    retry: 1,
  });
}

export function useTwin(id: string | null) {
  return useQuery<TwinRecord>({
    queryKey: ["twin", id],
    queryFn: () => twinApi.get(id!),
    enabled: !!id,
  });
}

export function useSaveTwin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, config }: { name: string; config: TwinConfig }) =>
      twinApi.create(name, config),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["twins"] }),
  });
}

export function useUpdateTwin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name, config }: { id: string; name: string; config: TwinConfig }) =>
      twinApi.update(id, name, config),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["twins"] }),
  });
}

export function useDeleteTwin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => twinApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["twins"] }),
  });
}

export function useSaveHistory() {
  return useMutation({
    mutationFn: ({ twinId, history }: { twinId: string; history: SimulationHistory }) =>
      twinApi.saveHistory(twinId, history),
  });
}
