import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createShoppingItem, type CreateShoppingItemPayload } from "@/lib/api/create-shopping-item";
import type { ShoppingItem } from "@/lib/api/fetch-shopping-items";

interface MutationContext {
  previousItems?: ShoppingItem[];
}

export function useCreateShoppingItem() {
  const queryClient = useQueryClient();

  return useMutation<ShoppingItem, Error, CreateShoppingItemPayload, MutationContext>({
    mutationFn: createShoppingItem,
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: ["shopping-items"] });

      const previousItems = queryClient.getQueryData<ShoppingItem[]>(["shopping-items"]);

      const tempItem: ShoppingItem = {
        id: `temp-${Date.now()}`,
        userId: "me",
        name: input.name,
        quantity: input.quantity,
        unit: input.unit,
        checked: input.checked ?? false,
        source: input.source ?? "manual",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData<ShoppingItem[]>(["shopping-items"], (old = []) => [...old, tempItem]);

      return { previousItems };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(["shopping-items"], context.previousItems);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-items"] });
    },
  });
}
