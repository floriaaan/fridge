import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { type Product } from '@/api/fetch-products';
import { Card } from '@/components/ui/card';

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card>
      <View style={styles.container}>
        <View>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.details}>
            {product.quantity} {product.unit} - {product.location}
          </Text>
        </View>
        {product.expiresAt && <Text style={styles.date}>Expires: {new Date(product.expiresAt).toLocaleDateString()}</Text>}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  details: {
    fontSize: 14,
    color: '#666',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
});
