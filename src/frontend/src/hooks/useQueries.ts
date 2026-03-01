import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { VehicleRecord } from "../backend.d";
import { useActor } from "./useActor";

export function useGetAllRecords() {
  const { actor, isFetching } = useActor();
  return useQuery<VehicleRecord[]>({
    queryKey: ["vehicleRecords"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllRecords();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      vehicleNumber,
      action,
      date,
      time,
    }: {
      vehicleNumber: string;
      action: string;
      date: string;
      time: string;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.addRecord(vehicleNumber, action, date, time);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicleRecords"] });
    },
  });
}

export function useDeleteRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.deleteRecord(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicleRecords"] });
    },
  });
}
