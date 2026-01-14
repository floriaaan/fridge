import { useQuery } from '@tanstack/react-query';
import { fetchShoppingItems } from '@/lib/api/fetch-shopping-items';

export function useShoppingItems() {
  return useQuery({
    queryKey: ['shopping-items'],
    queryFn: fetchShoppingItems,
  });
}
