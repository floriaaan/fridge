import React, { useMemo, useState, useEffect } from "react";
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
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateProduct } from "@/hooks/use-products";
import { SelectModal } from "@/components/select-modal";
import { DatePickerModal } from "@/components/date-picker-modal";

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

  const { barcode, name } = useMemo(
    () => ({
      barcode:
        typeof params.barcode === "string"
          ? params.barcode
          : Array.isArray(params.barcode)
            ? params.barcode[0]
            : "",
      name:
        typeof params.name === "string"
          ? params.name
          : Array.isArray(params.name)
            ? params.name[0]
            : "",
    }),
    [params]
  );

  const [productImage, setProductImage] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(false);
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
      name: name || "",
      quantity: "1",
      unit: "g",
      location: "frigo",
      category: "other",
      openfoodfactId: barcode || undefined,
    },
  });

  useEffect(() => {
    if (barcode) {
      setLoadingImage(true);
      fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`)
        .then((res) => res.json())
        .then((data) => {
          if (data.status === 1) {
            if (data.product?.image_url) {
              setProductImage(data.product.image_url);
            }
            const mappedCategory = mapOpenFoodFactsCategory(
              data.product?.categories
            );
            setValue("category", mappedCategory);
          }
        })
        .catch((error) => console.error("Error fetching product image:", error))
        .finally(() => setLoadingImage(false));
    }
  }, [barcode, setValue]);

  const selectedUnit = watch("unit");
  const selectedCategory = watch("category");
  const selectedDate = watch("expiresAt");

  const onSubmit = async (data: ProductFormData) => {
    try {
      await createProduct.mutateAsync([
        {
          ...data,
          quantity: parseInt(data.quantity, 10),
        },
      ]);
      router.back();
    } catch (error) {
      console.error("Error creating product:", error);
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
          className="flex-1 bg-gray-50 px-5"
          style={{ paddingTop: 16, paddingBottom: insets.bottom + 24 }}
        >
          {barcode && (
            <View className="bg-gray-100 p-3 rounded-lg mb-4">
              <Text className="text-xs text-gray-500 mb-1">
                Code-barres détecté
              </Text>
              <Text className="text-sm font-semibold text-gray-900">
                {barcode}
              </Text>
            </View>
          )}

          {loadingImage && (
            <View className="items-center justify-center bg-white rounded-xl p-8 mb-4 border border-gray-200">
              <ActivityIndicator size="large" color="#111827" />
              <Text className="text-gray-500 text-sm mt-2">
                Chargement de l&apos;image...
              </Text>
            </View>
          )}

          {productImage && !loadingImage && (
            <View className="mb-4 bg-white p-2 rounded-xl overflow-hidden border border-gray-200">
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
              <Text className="text-sm font-semibold text-gray-700 mb-1.5">
                Nom *
              </Text>
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className={`border rounded-xl p-3 bg-white ${errors.name ? "border-red-500" : "border-gray-300"}`}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="Nom du produit"
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
                <Text className="text-sm font-semibold text-gray-700 mb-1.5">
                  Quantité *
                </Text>
                <Controller
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className={`border rounded-xl p-3 bg-white ${errors.quantity ? "border-red-500" : "border-gray-300"}`}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      placeholder="1"
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
                <Text className="text-sm font-semibold text-gray-700 mb-1.5">
                  Unité *
                </Text>
                <TouchableOpacity
                  className={`border rounded-xl p-3 bg-white flex-row justify-between items-center ${errors.unit ? "border-red-500" : "border-gray-300"}`}
                  onPress={() => setShowUnitModal(true)}
                >
                  <Text className="text-base text-gray-900">
                    {selectedUnit}
                  </Text>
                  <Text className="text-gray-400">▼</Text>
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
              title="Choisir une unité"
              options={UNITS}
              selectedValue={selectedUnit}
              onSelect={(value) => setValue("unit", value)}
            />

            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-1.5">
                Emplacement *
              </Text>
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className={`border rounded-xl p-3 bg-white ${errors.location ? "border-red-500" : "border-gray-300"}`}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="frigo"
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
              <Text className="text-sm font-semibold text-gray-700 mb-1.5">
                Catégorie *
              </Text>
              <TouchableOpacity
                className={`border rounded-xl p-3 bg-white flex-row justify-between items-center ${errors.category ? "border-red-500" : "border-gray-300"}`}
                onPress={() => setShowCategoryModal(true)}
              >
                <Text className="text-base text-gray-900">
                  {selectedCategory}
                </Text>
                <Text className="text-gray-400">▼</Text>
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
              title="Choisir une catégorie"
              options={CATEGORIES}
              selectedValue={selectedCategory}
              onSelect={(value) => setValue("category", value)}
            />

            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-1.5">
                Date d&apos;expiration
              </Text>
              <TouchableOpacity
                className="border border-gray-300 rounded-xl p-3 bg-white flex-row justify-between items-center"
                onPress={() => setShowDatePicker(true)}
              >
                <Text
                  className={`text-base ${selectedDate ? "text-gray-900" : "text-gray-400"}`}
                >
                  {selectedDate || "Sélectionner une date"}
                </Text>
                <Text className="text-gray-400">📅</Text>
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
              className="flex-1 border border-gray-300 py-4 rounded-xl items-center bg-white"
              onPress={() => router.back()}
              disabled={createProduct.isPending}
            >
              <Text className="text-gray-900 font-semibold">Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-4 rounded-xl items-center ${createProduct.isPending ? "bg-gray-400" : "bg-gray-900"}`}
              onPress={handleSubmit(onSubmit)}
              disabled={createProduct.isPending}
            >
              <Text className="text-white font-semibold">
                {createProduct.isPending ? "Création..." : "Créer"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
