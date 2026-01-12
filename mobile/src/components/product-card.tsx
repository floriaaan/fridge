import { Product } from "@/api/fetch-products";
import { Image, Text, TouchableOpacity, View } from "react-native";

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    vegetables: '#8BC34A',
    dairy: '#81C4E8',
    meat: '#D98841',
    poultry: '#4A4238',
    fruits: '#FF9800',
    beverages: '#03A9F4',
    snacks: '#FFC107',
    condiments: '#795548',
  };
  return colors[category.toLowerCase()] || '#9E9E9E';
};

const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'No expiry date';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

const isExpiringSoon = (expiresAt: string | null): boolean => {
  if (!expiresAt) return false;
  const expiry = new Date(expiresAt);
  const today = new Date();
  const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
};

const isExpired = (expiresAt: string | null): boolean => {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
};

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
  const color = getCategoryColor(product.category);
  const expiring = isExpiringSoon(product.expiresAt);
  const expired = isExpired(product.expiresAt);
  
  const dotColor = expired ? '#EF4444' : expiring ? '#FBBF24' : '#4CAF50';
// Extract image URL from openfoodfactData structure
  const imageUrl = 
    product.openfoodfactData?._j?.image_front_url || 
    product.openfoodfactData?._j?.image_url ||
    product.openfoodfactData?.image_url;  
  return (
    <TouchableOpacity 
      onPress={onPress}
      className="relative rounded-3xl overflow-hidden shadow-lg mb-4"
      style={{ 
        aspectRatio: 1,
        width: '48%',
      }}
      activeOpacity={0.9}
    >
      {/* Background image - blurred and zoomed */}
      {imageUrl ? (
        <>
          <Image 
            source={{ uri: imageUrl }}
            className="absolute inset-0 w-full h-full"
            style={{ 
              resizeMode: 'cover',
              transform: [{ scale: 1.5 }],
            }}
            blurRadius={20}
          />
          {/* Dark overlay for better text readability */}
          <View 
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
          />
        </>
      ) : (
        <View 
          className="absolute inset-0"
          style={{ backgroundColor: color }}
        />
      )}
      
      <TouchableOpacity 
        className="absolute top-3 right-3 w-8 h-8 rounded-full items-center justify-center z-10"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
        onPress={(e) => {
          e.stopPropagation();
          console.log('Menu clicked for:', product.name);
        }}
      >
        <View className="flex-row gap-0.5">
          <View className="w-1 h-1 rounded-full bg-white" />
          <View className="w-1 h-1 rounded-full bg-white" />
          <View className="w-1 h-1 rounded-full bg-white" />
        </View>
      </TouchableOpacity>
      
      <View className="h-full flex-col justify-between p-4">
        <View className="flex-1 items-center justify-center">
          {imageUrl ? (
            <Image 
              source={{ uri: imageUrl }}
              className="w-full h-full"
              style={{ 
                resizeMode: 'contain',
              }}
            />
          ) : (
            <Text className="text-5xl text-white font-bold" style={{ opacity: 0.3 }}>
              {product.name.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
        
        <View>
          <Text className="text-2xl font-bold text-white mb-0.5" numberOfLines={1}>
            {product.name}
          </Text>
          <Text className="text-sm text-white mb-2" style={{ opacity: 0.9 }}>
            {product.quantity} {product.unit} • {product.location}
          </Text>
          <View className="flex-row items-center gap-2">
            <View 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: dotColor }}
            />
            <Text className="text-sm text-white" style={{ opacity: 0.95 }}>
              {formatDate(product.expiresAt)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};