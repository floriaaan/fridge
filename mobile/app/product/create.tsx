import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Image,
  useColorScheme,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateProduct } from "@/hooks/use-products";
import { SelectModal } from "@/components/select-modal";
import { DatePickerModal } from "@/components/date-picker-modal";
import Snackbar, { SnackbarRef } from "@/components/ui/snackbar";
import { useTranslation } from "@/hooks/use-translation";

const UNITS = ["g", "kg", "ml", "L", "pièce", "portion"];
const CATEGORIES = [
  "meat",
  "frozen",
  "vegetables",
  "dairy",
  "bread",
  "fruits",
  "pantry",
  "other",
];

const productSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  quantity: z.string().min(1, "La quantité est requise"),
  unit: z.string().min(1, "L'unité est requise"),
  location: z.string().min(1, "L'emplacement est requis"),
  expiresAt: z.string().optional(),
  openedAt: z.string().optional(),
  category: z.string().min(1, "La catégorie est requise"),
  openfoodfactId: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function ProductCreateScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const createProduct = useCreateProduct();
  const snackBarRef = useRef<SnackbarRef>(null);
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const product = JSON.parse(params.product as string);

  const productImage = product?.image_url || null;
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const mapOpenFoodFactsCategory = (offCategories: string | null): string => {
    if (!offCategories) return "other";
    const categoryStr = offCategories.toLowerCase();
    if (categoryStr.includes("meat") || categoryStr.includes("poisson"))
      return "meat";
    if (categoryStr.includes("frozen") || categoryStr.includes("surgélé"))
      return "frozen";
    if (
      categoryStr.includes("vegetable") ||
      categoryStr.includes("légume") ||
      categoryStr.includes("fruit")
    )
      return "vegetables";
    if (categoryStr.includes("dairy") || categoryStr.includes("fromage"))
      return "dairy";
    if (categoryStr.includes("bread") || categoryStr.includes("pain"))
      return "bread";
    if (categoryStr.includes("fruit")) return "fruits";
    return "pantry";
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.product_name || "",
      quantity: "1",
      unit: "pièce",
      location: "frigo",
      category: mapOpenFoodFactsCategory(product?.categories),
      openfoodfactId: product?.code || undefined,
    },
  });

  const selectedUnit = watch("unit");
  const selectedCategory = watch("category");
  const selectedDate = watch("expiresAt");

  console.log("Product image", productImage);

  const onSubmit = async (data: ProductFormData) => {
    try {
      await createProduct.mutateAsync([
        {
          ...data,
          quantity: parseInt(data.quantity, 10),
        },
      ]);
      snackBarRef.current?.show("Produit créé avec succès !", 3000);

      setTimeout(() => {
        router.dismissTo("/(tabs)");
      }, 1000);
    } catch (error) {
      console.error("Error creating product:", error);
      snackBarRef.current?.show("Erreur lors de la création du produit", 3000);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View
          className="flex-1 bg-neutral-50 dark:bg-neutral-900 px-5"
          style={{ paddingTop: 16, paddingBottom: insets.bottom + 24 }}
        >
          {product?.code && (
            <View className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-lg mb-4">
              <Text className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                {t("product.scannedBarcode")}
              </Text>
              <Text className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {product?.code}
              </Text>
            </View>
          )}

          {productImage && (
            <View className="mb-4 bg-white dark:bg-neutral-800 p-2 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700">
              <Image
                source={{ uri: productImage }}
                className="w-full h-16"
                resizeMode="contain"
              />
            </View>
          )}

          <ScrollView
            className="flex-1"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 80 }}
          >
            <View className="mb-4">
              <Text className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                {t("product.productName")} *
              </Text>
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className={`border rounded-xl p-3 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 ${errors.name ? "border-red-500" : "border-neutral-300 dark:border-neutral-600"}`}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder={t("product.productNamePlaceholder")}
                    placeholderTextColor={isDark ? "#737373" : "#9ca3af"}
                  />
                )}
                name="name"
              />
              {errors.name && (
                <Text className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </Text>
              )}
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1 mb-4">
                <Text className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  {t("product.quantity")} *
                </Text>
                <Controller
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className={`border rounded-xl p-3 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 ${errors.quantity ? "border-red-500" : "border-neutral-300 dark:border-neutral-600"}`}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      placeholder="1"
                      placeholderTextColor={isDark ? "#737373" : "#9ca3af"}
                      keyboardType="numeric"
                    />
                  )}
                  name="quantity"
                />
                {errors.quantity && (
                  <Text className="text-red-500 text-xs mt-1">
                    {errors.quantity.message}
                  </Text>
                )}
              </View>

              <View className="flex-1 mb-4">
                <Text className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  {t("product.unit")} *
                </Text>
                <TouchableOpacity
                  className={`border rounded-xl p-3 bg-white dark:bg-neutral-800 flex-row justify-between items-center ${errors.unit ? "border-red-500" : "border-neutral-300 dark:border-neutral-600"}`}
                  onPress={() => setShowUnitModal(true)}
                >
                  <Text className="text-base text-neutral-900 dark:text-neutral-100">
                    {selectedUnit}
                  </Text>
                  <Text className="text-neutral-400">▼</Text>
                </TouchableOpacity>
                {errors.unit && (
                  <Text className="text-red-500 text-xs mt-1">
                    {errors.unit.message}
                  </Text>
                )}
              </View>
            </View>

            <SelectModal
              visible={showUnitModal}
              onClose={() => setShowUnitModal(false)}
              title={t("product.unit")}
              options={UNITS}
              selectedValue={selectedUnit}
              onSelect={(value) => setValue("unit", value)}
            />

            <View className="mb-4">
              <Text className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                {t("product.location")} *
              </Text>
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className={`border rounded-xl p-3 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 ${errors.location ? "border-red-500" : "border-neutral-300 dark:border-neutral-600"}`}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder={t("product.locationPlaceholder")}
                    placeholderTextColor={isDark ? "#737373" : "#9ca3af"}
                  />
                )}
                name="location"
              />
              {errors.location && (
                <Text className="text-red-500 text-xs mt-1">
                  {errors.location.message}
                </Text>
              )}
            </View>

            <View className="mb-4">
              <Text className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                {t("product.category")} *
              </Text>
              <TouchableOpacity
                className={`border rounded-xl p-3 bg-white dark:bg-neutral-800 flex-row justify-between items-center ${errors.category ? "border-red-500" : "border-neutral-300 dark:border-neutral-600"}`}
                onPress={() => setShowCategoryModal(true)}
              >
                <Text className="text-base text-neutral-900 dark:text-neutral-100">
                  {selectedCategory}
                </Text>
                <Text className="text-neutral-400">▼</Text>
              </TouchableOpacity>
              {errors.category && (
                <Text className="text-red-500 text-xs mt-1">
                  {errors.category.message}
                </Text>
              )}
            </View>

            <SelectModal
              visible={showCategoryModal}
              onClose={() => setShowCategoryModal(false)}
              title={t("product.category")}
              options={CATEGORIES}
              selectedValue={selectedCategory}
              onSelect={(value) => setValue("category", value)}
            />

            <View className="mb-4">
              <Text className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                {t("product.expiryDate")}
              </Text>
              <TouchableOpacity
                className="border border-neutral-300 dark:border-neutral-600 rounded-xl p-3 bg-white dark:bg-neutral-800 flex-row justify-between items-center"
                onPress={() => setShowDatePicker(true)}
              >
                <Text
                  className={`text-base ${selectedDate ? "text-neutral-900 dark:text-neutral-100" : "text-neutral-400"}`}
                >
                  {selectedDate || t("datePicker.selectDate")}
                </Text>
                <Text className="text-neutral-400">📅</Text>
              </TouchableOpacity>
            </View>

            <DatePickerModal
              visible={showDatePicker}
              onClose={() => setShowDatePicker(false)}
              selectedDate={selectedDate}
              onDateSelect={(date) => setValue("expiresAt", date)}
            />
          </ScrollView>

          <View className="flex-row justify-between mt-4 gap-3">
            <TouchableOpacity
              className="flex-1 border border-neutral-300 dark:border-neutral-600 py-4 rounded-xl items-center bg-white dark:bg-neutral-800"
              onPress={() => router.back()}
              disabled={createProduct.isPending}
            >
              <Text className="text-neutral-900 dark:text-neutral-100 font-semibold">{t("common.cancel")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-4 rounded-xl items-center ${createProduct.isPending ? "bg-neutral-400 dark:bg-neutral-600" : "bg-neutral-900 dark:bg-neutral-100"}`}
              onPress={handleSubmit(onSubmit)}
              disabled={createProduct.isPending}
            >
              <Text className={`font-semibold ${createProduct.isPending ? "text-white" : "text-white dark:text-neutral-900"}`}>
                {createProduct.isPending ? t("common.loading") : t("common.add")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
      <Snackbar ref={snackBarRef} />
    </KeyboardAvoidingView>
  );
}
