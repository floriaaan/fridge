import { API_BASE_URL } from '@/lib/api-config';
import { fetchProducts } from '@/lib/api/fetch-products';
import { authClient } from '@/lib/auth-client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';


interface CreateProductInput {
  name: string;
  quantity: number;
  unit: string;
  location: string;
  expiresAt?: string;
  openedAt?: string;
  category: string;
  openfoodfactId?: string;
}

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (products: CreateProductInput[]) => {
      const cookies = authClient.getCookie();
      const response = await fetch(`${API_BASE_URL}/product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookies,
        },
        body: JSON.stringify(products),
      });

      if (!response.ok) {
        throw new Error('Failed to create product');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
