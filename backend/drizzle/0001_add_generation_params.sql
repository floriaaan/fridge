-- Add generationParams JSONB column to recipe table
ALTER TABLE "recipe" ADD COLUMN "generation_params" jsonb;
