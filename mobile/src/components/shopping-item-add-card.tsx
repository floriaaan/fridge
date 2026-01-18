import React, { useCallback, useMemo, useState } from 'react';
import { Text, View, TouchableOpacity, TextInput, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { useCreateShoppingItem } from '@/hooks/use-create-shopping-item';
import { SelectModal } from '@/components/select-modal';
import type { ShoppingItem } from '@/lib/api/fetch-shopping-items';

type ShoppingItemAddCardProps = {
  defaultUnit?: string;
  defaultQuantity?: number;
  index?: number;
  onCreated?: (item: ShoppingItem) => void;
};

const UNITS = ["g", "kg", "ml", "L", "pièce", "portion", "pcs", "paquets"];

const ADD_BG = '#F3F4F6';
const ADD_TEXT = '#6B7280';
const ADD_ACCENT = '#9CA3AF';

export function ShoppingItemAddCard({
  defaultUnit = 'pcs',
  defaultQuantity = 1,
  index,
  onCreated,
}: ShoppingItemAddCardProps) {
  const { mutateAsync: createItem, isPending } = useCreateShoppingItem();
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState<number>(defaultQuantity);
  const [unit, setUnit] = useState<string>(defaultUnit);
  const [showUnitModal, setShowUnitModal] = useState(false);

  const canSubmit = useMemo(() => name.trim().length > 0 && quantity > 0 && unit.trim().length > 0, [name, quantity, unit]);

  const handleIncrement = () => setQuantity((q) => Math.min(999, q + 1));
  const handleDecrement = () => setQuantity((q) => Math.max(1, q - 1));

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || isPending) return;
    Keyboard.dismiss();
    const payload = { name: name.trim(), quantity, unit: unit.trim(), source: 'manual' as const };
    try {
      const created = await createItem(payload);
      setName('');
      setQuantity(defaultQuantity);
      setUnit(defaultUnit);
      onCreated?.(created);
    } catch {
      // noop: error will be surfaced by query error boundaries/snackbars if any
    }
  }, [canSubmit, isPending, name, quantity, unit, createItem, defaultQuantity, defaultUnit, onCreated]);

  return (
    <Animated.View
      entering={FadeInDown.delay(index ? index * 50 : 0).springify().damping(90).stiffness(600)}
      layout={LinearTransition.springify().damping(80).stiffness(600)}
      className="rounded-2xl border border-gray-200 p-4"
      style={{ backgroundColor: ADD_BG }}
    >
      <View className="flex-row items-center gap-3 mb-3">
        <Ionicons name="add-circle-outline" size={24} color={ADD_ACCENT} />
        <View className="flex-1">
          <TextInput
            value={name}
            onChangeText={setName}
            onBlur={Keyboard.dismiss}
            placeholder="Add an item..."
            placeholderTextColor={ADD_ACCENT}
            style={{ color: ADD_TEXT, fontSize: 14 }}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            editable={!isPending}
          />
        </View>
      </View>
      <View className="flex-row items-center gap-2 justify-end">
        <View className="flex-row items-center bg-white px-2 py-2 rounded-lg border border-gray-200">
          <TouchableOpacity onPress={handleDecrement} disabled={isPending} activeOpacity={0.6}>
            <Ionicons name="remove" size={16} color={ADD_TEXT} />
          </TouchableOpacity>
          <TextInput
            value={String(quantity)}
            onChangeText={(t) => {
              const n = Number(t.replace(/[^0-9]/g, ''));
              if (!Number.isNaN(n)) setQuantity(Math.min(999, Math.max(1, n)));
            }}
            onBlur={Keyboard.dismiss}
            keyboardType="number-pad"
            style={{ color: ADD_TEXT, textAlign: 'center', fontSize: 12, fontWeight: '600', marginHorizontal: 4, minWidth: 20 }}
            editable={!isPending}
          />
          <TouchableOpacity onPress={handleIncrement} disabled={isPending} activeOpacity={0.6}>
            <Ionicons name="add" size={16} color={ADD_TEXT} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          className="border border-gray-300 rounded-lg px-3 py-2 bg-white flex-row justify-between items-center"
          onPress={() => setShowUnitModal(true)}
          disabled={isPending}
        >
          <Text className="text-sm font-semibold" style={{ color: ADD_TEXT }}>
            {unit}
          </Text>
        </TouchableOpacity>
        <SelectModal
          visible={showUnitModal}
          onClose={() => setShowUnitModal(false)}
          title="Choisir une unité"
          options={UNITS}
          selectedValue={unit}
          onSelect={(value) => {
            setUnit(value);
            setShowUnitModal(false);
          }}
        />
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!canSubmit || isPending}
          className="px-3 py-2 rounded-lg"
          activeOpacity={0.7}
          style={{ backgroundColor: ADD_TEXT, opacity: !canSubmit || isPending ? 0.4 : 1 }}
        >
          <Ionicons name="checkmark" size={16} color={ADD_BG} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}
