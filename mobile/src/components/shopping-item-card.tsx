import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { type ShoppingItem } from '@/lib/api/fetch-shopping-items';
import { Card } from '@/components/ui/card';

type ShoppingItemCardProps = {
  item: ShoppingItem;
};

export function ShoppingItemCard({ item }: ShoppingItemCardProps) {
  return (
    <Card>
      <View style={styles.container}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.details}>
          {item.quantity} {item.unit}
        </Text>
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
});
