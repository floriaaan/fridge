import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchRecipes,
  fetchRecipeSuggestions,
  generateRecipes,
  GenerateRecipesParams,
} from "@/lib/api/fetch-recipes";

export function useRecipes() {
  return useQuery({
    queryKey: ["recipes"],
    queryFn: fetchRecipes,
  });
}

export function useRecipeSuggestions() {
  return useQuery({
    queryKey: ["recipe-suggestions"],
    queryFn: fetchRecipeSuggestions,
  });
}

export function useGenerateRecipes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params?: GenerateRecipesParams) => generateRecipes(params),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      queryClient.invalidateQueries({ queryKey: ["recipe-suggestions"] });
    },
  });
}
