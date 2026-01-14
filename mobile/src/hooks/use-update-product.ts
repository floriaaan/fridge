import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProduct } from "@/lib/api/update-product";

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
