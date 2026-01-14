import React from 'react';
import { FlatList, StyleSheet, type FlatListProps } from 'react-native';

type ListProps<T> = FlatListProps<T>;

export function List<T>({ ...props }: ListProps<T>) {
  return <FlatList style={styles.list} contentContainerStyle={styles.content} {...props} />;
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  content: {
    paddingVertical: 8,
  },
});
