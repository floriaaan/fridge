import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteShoppingItems } from "@/lib/api/delete-shopping-items";
import type { ShoppingItem } from "@/lib/api/fetch-shopping-items";

interface MutationContext {
  previousItems?: ShoppingItem[];
}

export function useDeleteShoppingItem() {
  const queryClient = useQueryClient();

  return useMutation<{ count: number }, Error, string[], MutationContext>({
    mutationFn: deleteShoppingItems,
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: ["shopping-items"] });

      const previousItems = queryClient.getQueryData<ShoppingItem[]>(["shopping-items"]);

      queryClient.setQueryData<ShoppingItem[]>(["shopping-items"], (old = []) =>
        old.filter((item) => !ids.includes(item.id))
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
