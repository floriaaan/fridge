import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchPasskeys,
  fetchApiKeys,
  createPasskey,
  createApiKey,
  deletePasskey,
  deleteApiKey,
  type Passkey,
  type ApiKey,
} from "@/lib/api/fetch-credentials";

// Passkeys
export function usePasskeys() {
  return useQuery<Passkey[]>({
    queryKey: ["passkeys"],
    queryFn: fetchPasskeys,
  });
}

export function useCreatePasskey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => createPasskey(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["passkeys"] });
    },
  });
}

export function useDeletePasskey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePasskey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["passkeys"] });
    },
  });
}

// API Keys
export function useApiKeys() {
  return useQuery<ApiKey[]>({
    queryKey: ["apiKeys"],
    queryFn: fetchApiKeys,
  });
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => createApiKey(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apiKeys"] });
    },
  });
}

export function useDeleteApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteApiKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apiKeys"] });
    },
  });
}
