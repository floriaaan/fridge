CREATE TABLE "statistics_snapshot" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"period" text NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"total_products" integer NOT NULL,
	"consumed_products" integer NOT NULL,
	"discarded_products" integer NOT NULL,
	"money_wasted" numeric(10, 2) NOT NULL,
	"money_saved" numeric(10, 2) NOT NULL,
	"co2_avoided" numeric(10, 2) NOT NULL,
	"top_categories" jsonb,
	"calculated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "consumed_at" timestamp;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "discarded_at" timestamp;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "discard_reason" text;--> statement-breakpoint
ALTER TABLE "statistics_snapshot" ADD CONSTRAINT "statistics_snapshot_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "statistics_snapshot_userId_idx" ON "statistics_snapshot" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "statistics_snapshot_period_idx" ON "statistics_snapshot" USING btree ("period");--> statement-breakpoint
CREATE INDEX "statistics_snapshot_periodStart_idx" ON "statistics_snapshot" USING btree ("period_start");