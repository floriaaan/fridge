ALTER TABLE "recipe" ADD COLUMN "preparation_time" integer;--> statement-breakpoint
ALTER TABLE "recipe" ADD COLUMN "tags" text[] DEFAULT '{}'::text[] NOT NULL;