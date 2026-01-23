/**
 * Optimized prompts for AI generation to reduce token usage
 */

export const buildRecipePrompt = (
  productsList: string,
  language: string,
  params: {
    cuisine?: string;
    difficulty?: "easy" | "medium" | "hard";
    maxTime?: number;
    servings?: number;
  } = {}
): string => {
  const constraints = [
    params.cuisine && `Cuisine: ${params.cuisine}`,
    params.difficulty && `Difficulty: ${params.difficulty}`,
    params.maxTime && `Max time: ${params.maxTime}min`,
    params.servings && `Servings: ${params.servings}`,
  ]
    .filter(Boolean)
    .join(". ");

  return `Products: ${productsList}

Generate 3 recipes. ALL text (title, description, instructions) MUST be in ${language} language.
Prioritize expiring products.${constraints ? ` ${constraints}.` : ""}

Requirements:
- Recipe 1: Quick (<30min)
- Recipe 2: Vegetarian
- Recipe 3: Elaborate/Gourmet

Each recipe needs:
- title (in ${language})
- description: 1-2 sentences (in ${language})
- instructions: MUST be valid Markdown with numbered list format (in ${language}): "1. First step\n2. Second step\n3. Third step"
- prep time in minutes
- tags
- ingredients with quantities as integers and units separately (e.g. quantity: 500, unit: "g")`;
};

export const buildReceiptPrompt = (language: string): string => {
  return `Extract ONLY food and beverage items from this receipt.

Instructions:
1. Identify store name, date (YYYY-MM-DD format), and total amount
2. For each item:
   - Extract ONLY food/beverage products (ignore non-food items like bags, cleaning products, batteries, etc.)
   - Improve abbreviated product names using context clues:
     * "MCH 500G OIGN JNE" → "Oignons jaunes 500g"
     * "140G POITR FUM TR" → "Poitrine fumée en tranches 140g"
     * "PT LT 1L 1/2 ECR" → "Lait demi-écrémé 1L"
   - Extract quantity as number, unit (g, kg, ml, L, pièce), and price in €
3. Return all data in ${language} language

Focus on accuracy and clarity for food items only.`;
};

export const buildFridgeScanPrompt = (language: string): string => {
  return `Analyze this photo of fridge contents. Identify ONLY visible food and beverage products.

Instructions:
1. List only edible items (ignore containers, labels, non-food items)
2. For each food product:
   - Provide specific name (e.g., "Yaourt nature Danone" not just "yaourt")
   - Estimate quantity as number
   - Specify unit (pièce, g, kg, ml, L)
3. Return all data in ${language} language

Focus on food items only, be specific with product names.`;
};

export const buildRecipeImagePrompt = (title: string, description: string): string => {
  const desc = description ? ` ${description.slice(0, 100)}` : "";
  return `Professional food photo: "${title}".${desc} Elegant plating, natural light, appetizing.`;
};
