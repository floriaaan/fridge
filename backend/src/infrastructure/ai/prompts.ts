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

Generate 3 recipes in ${language}: 1) Quick (<30min), 2) Vegetarian, 3) Elaborate.
Prioritize expiring products.${constraints ? ` ${constraints}.` : ""}

Each recipe needs: title, description (1-2 sentences), instructions (MUST be valid Markdown with numbered list format: "1. Step one\n2. Step two\n3. Step three"), prep time (minutes), tags, ingredients (with quantities as integers and units separately, e.g. quantity: 500, unit: "g").`;
};

export const buildReceiptPrompt = (language: string): string => {
  return `Extract from receipt: store name, date (YYYY-MM-DD), items (name, quantity, price in €, unit), total. Return in ${language}.`;
};

export const buildRecipeImagePrompt = (title: string, description: string): string => {
  const desc = description ? ` ${description.slice(0, 100)}` : "";
  return `Professional food photo: "${title}".${desc} Elegant plating, natural light, appetizing.`;
};
