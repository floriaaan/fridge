import React from "react";
import { FlatList, type FlatListProps } from "react-native";

type ListProps<T> = FlatListProps<T>;

export function List<T>({ ...props }: ListProps<T>) {
  return (
    <FlatList
      className="flex-1"
      contentContainerClassName="py-2"
      {...props}
    />
  );
}
