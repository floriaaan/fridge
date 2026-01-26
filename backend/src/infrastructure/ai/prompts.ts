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
2. For each item, extract ONLY food/beverage products meant for human consumption:
   - INCLUDE: Fresh produce (vegetables, fruits), meat, fish, dairy, bakery, beverages, pantry staples
   - EXCLUDE: Pet food, animal feed, cleaning products, bags, batteries, hygiene items, household items
   
3. Improve abbreviated product names while keeping their TRUE nature:
   - Keep raw/unprocessed items as RAW (don't transform them into processed products)
   - Examples:
     * "MCH 500G OIGN JNE" → "Oignons jaunes 500g" (raw vegetable)
     * "140G POITR FUM TR" → "Poitrine fumée en tranches 140g" (processed meat)
     * "TOMATE COTE RGE HF" → "Tomates côtelées rouges" (raw vegetable)
     * "COURGETTE" → "Courgettes" (raw vegetable)
     * "BOEUF BOURGUIGN***" → "Boeuf bourguignon" (prepared dish)
     * "3KG CHAT STER INTE" → EXCLUDE (pet food, not human food)
     
4. Extract quantity as number, unit (g, kg, ml, L, pièce), and price in €
5. Return all data in ${language} language
6. DO NOT transform raw ingredients into processed products
7. DO NOT include pet food or non-human food items

Focus on accuracy, preserve the true nature of each product (raw vs processed).`;
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
