import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateShoppingItems, type UpdateShoppingItemPayload } from "@/lib/api/update-shopping-items";
import type { ShoppingItem } from "@/lib/api/fetch-shopping-items";

interface MutationContext {
  previousItems?: ShoppingItem[];
}

export function useUpdateShoppingItems() {
  const queryClient = useQueryClient();

  return useMutation<ShoppingItem[], Error, UpdateShoppingItemPayload[], MutationContext>({
    mutationFn: updateShoppingItems,
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: ["shopping-items"] });

      const previousItems = queryClient.getQueryData<ShoppingItem[]>(["shopping-items"]);

      queryClient.setQueryData<ShoppingItem[]>(["shopping-items"], (oldItems = []) =>
        oldItems.map((item) => {
          const update = updates.find((u) => u.id === item.id);
          return update
            ? { ...item, ...update, updatedAt: new Date().toISOString() }
            : item;
        })
      );

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
