ALTER TABLE "product" RENAME COLUMN "slug" TO "categories";
ALTER TABLE "product" ALTER COLUMN "categories" SET DATA TYPE text[];
