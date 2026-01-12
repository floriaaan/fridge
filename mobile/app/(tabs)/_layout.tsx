import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';



export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen
        name="shopping-list"
        options={{
          title: 'Shopping List',
          tabBarIcon: ({ color, size }) => <Ionicons name="cart" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Products',
          tabBarIcon: ({ color, size }) => <Ionicons name="fast-food" size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="debug"
        options={{
          title: 'DEBUG',
          tabBarIcon: ({ color, size }) => <Ionicons name="bug" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
