/**
 * CO2 emissions per kg of food product by category
 * Values are in kg CO2 equivalent per kg of food
 * Based on environmental science research and carbon footprint studies
 */
export const CO2_PER_KG: Record<string, number> = {
  // High impact categories
  meat: 27,
  beef: 27,
  lamb: 25,
  pork: 12,
  poultry: 6.9,
  chicken: 6.9,
  
  // Medium-high impact
  fish: 13,
  seafood: 13,
  cheese: 13.5,
  dairy: 5,
  milk: 3.2,
  eggs: 4.8,
  
  // Medium impact
  chocolate: 4.5,
  coffee: 3.5,
  
  // Low impact
  vegetables: 2,
  fruits: 1.1,
  grains: 0.9,
  bread: 1.4,
  pasta: 1.3,
  rice: 2.7,
  legumes: 0.9,
  beans: 0.9,
  
  // Beverages
  beverages: 0.8,
  drinks: 0.8,
  juice: 0.9,
  
  // Default for unknown categories
  other: 2.5,
  unknown: 2.5,
};

/**
 * Average prices per kg by category (in euros)
 * Used when no specific price is provided
 */
export const AVERAGE_PRICE_PER_KG: Record<string, number> = {
  meat: 15,
  beef: 18,
  lamb: 20,
  pork: 10,
  poultry: 8,
  chicken: 8,
  fish: 15,
  seafood: 18,
  cheese: 12,
  dairy: 3,
  milk: 1.2,
  eggs: 4,
  chocolate: 12,
  coffee: 20,
  vegetables: 3,
  fruits: 3.5,
  grains: 2,
  bread: 4,
  pasta: 2,
  rice: 2.5,
  legumes: 3,
  beans: 3,
  beverages: 2,
  drinks: 2,
  juice: 3,
  other: 5,
  unknown: 5,
};

/**
 * Get CO2 equivalent for a product category
 * @param category - Product category name
 * @returns CO2 in kg per kg of product
 */
export function getCO2PerKg(category: string): number {
  const normalizedCategory = category.toLowerCase().trim();
  return CO2_PER_KG[normalizedCategory] ?? CO2_PER_KG["unknown"] ?? 2.5;
}

/**
 * Get average price for a product category
 * @param category - Product category name
 * @returns Price in euros per kg
 */
export function getAveragePricePerKg(category: string): number {
  const normalizedCategory = category.toLowerCase().trim();
  return AVERAGE_PRICE_PER_KG[normalizedCategory] ?? AVERAGE_PRICE_PER_KG["unknown"] ?? 5;
}

/**
 * Motivation messages based on waste rate
 */
export const MOTIVATION_MESSAGES: { maxRate: number; message: string }[] = [
  { maxRate: 5, message: "Excellent ! Vous êtes un champion 🏆" },
  { maxRate: 10, message: "Très bien ! Continuez comme ça 👍" },
  { maxRate: 20, message: "Pas mal, mais on peut faire mieux 💪" },
  { maxRate: 100, message: "Utilisez les alertes pour réduire le gaspillage" },
];

/**
 * Get motivation message based on waste rate
 * @param wasteRate - Waste rate in percentage
 * @returns Motivation message
 */
export function getMotivationMessage(wasteRate: number): string {
  for (const { maxRate, message } of MOTIVATION_MESSAGES) {
    if (wasteRate <= maxRate) {
      return message;
    }
  }
  const lastMessage = MOTIVATION_MESSAGES[MOTIVATION_MESSAGES.length - 1];
  return lastMessage ? lastMessage.message : "Continuez vos efforts !";
}

/**
 * Convert CO2 saved to tangible equivalents
 * @param co2Kg - CO2 in kg
 * @returns Object with tangible comparisons
 */
export function getCO2Equivalents(co2Kg: number): { carKm: number; message: string } {
  // Average car emits ~200g CO2 per km
  const carKm = Math.round(co2Kg / 0.2);
  return {
    carKm,
    message: `${co2Kg.toFixed(1)}kg de CO2 évité = ${carKm}km en voiture`,
  };
}

/**
 * Convert money saved to tangible equivalents
 * @param amount - Amount in euros
 * @returns Object with tangible comparisons
 */
export function getMoneyEquivalents(amount: number): { coffees: number; message: string } {
  // Average coffee ~5€
  const coffees = Math.floor(amount / 5);
  return {
    coffees,
    message: `${amount.toFixed(2)}€ économisés = ${coffees} cafés ☕`,
  };
}
