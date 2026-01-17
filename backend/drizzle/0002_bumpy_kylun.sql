CREATE TABLE "receipt" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"store_name" text NOT NULL,
	"scanned_at" timestamp DEFAULT now() NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"image_url" text,
	"ocr_raw_data" jsonb,
	"items_count" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "receipt_id" text;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "price" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "receipt" ADD CONSTRAINT "receipt_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "receipt_userId_idx" ON "receipt" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_receipt_id_receipt_id_fk" FOREIGN KEY ("receipt_id") REFERENCES "public"."receipt"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "product_receiptId_idx" ON "product" USING btree ("receipt_id");