import React from 'react';
import { Text, View, ActivityIndicator } from 'react-native';
import { useProducts } from '@/hooks/use-products';
import { List } from '@/components/ui/list';
import { ProductCard } from '@/features/products/components/product-card';

export default function ProductsScreen() {
  const { data: products, isLoading, isError, error } = useProducts();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Loading products...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Error fetching data</Text>
        <Text>{error?.message}</Text>
      </View>
    );
  }

  return <List data={products} renderItem={({ item }) => <ProductCard product={item} />} keyExtractor={(item) => item.id} />;
}
