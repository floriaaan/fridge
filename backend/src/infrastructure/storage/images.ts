import { mkdir, writeFile } from "fs/promises";
import { existsSync } from "fs";
import * as path from "path";

const IMAGES_DIR = path.join(process.cwd(), "public", "images", "recipes");

/**
 * Ensures the images directory exists
 */
export const ensureImagesDir = async (): Promise<void> => {
  if (!existsSync(IMAGES_DIR)) {
    await mkdir(IMAGES_DIR, { recursive: true });
  }
};

/**
 * Saves an image buffer to the recipes images directory
 * @param imageBuffer - The image data as a Buffer
 * @param recipeId - The unique recipe ID to use as filename
 * @returns The relative URL path to access the image
 */
export const saveRecipeImage = async (
  imageBuffer: Buffer,
  recipeId: string
): Promise<string> => {
  await ensureImagesDir();

  const filename = `${recipeId}.png`;
  const filepath = path.join(IMAGES_DIR, filename);

  await writeFile(filepath, imageBuffer);

  // Return the public URL path
  return `/images/recipes/${filename}`;
};

/**
 * Gets the public URL for a recipe image
 * @param recipeId - The recipe ID
 * @returns The public URL path
 */
export const getRecipeImageUrl = (recipeId: string): string => {
  return `/images/recipes/${recipeId}.png`;
};
