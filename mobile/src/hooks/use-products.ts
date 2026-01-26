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

interface UpdateProductInput {
  id: string;
  name?: string;
  quantity?: number;
  openedAt?: string | null;
  consumedAt?: string | null;
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
      // Invalidate achievements queries to check for new badges
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (products: UpdateProductInput[]) => {
      const cookies = authClient.getCookie();
      const response = await fetch(`${API_BASE_URL}/product`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookies,
        },
        body: JSON.stringify(products),
      });

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productIds: string[]) => {
      const cookies = authClient.getCookie();
      const response = await fetch(`${API_BASE_URL}/product`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookies,
        },
        body: JSON.stringify(productIds.map(id => ({ id }))),
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
    },
  });
}

export function useMarkProductOpened() {
  const { mutateAsync: updateProduct } = useUpdateProduct();

  return useMutation({
    mutationFn: async (productId: string) => {
      return updateProduct([{ id: productId, openedAt: new Date().toISOString() }]);
    },
  });
}

export function useMarkProductConsumed() {
  const { mutateAsync: updateProduct } = useUpdateProduct();

  return useMutation({
    mutationFn: async (productId: string) => {
      return updateProduct([{ id: productId, consumedAt: new Date().toISOString(), quantity: 0 }]);
    },
  });
}
