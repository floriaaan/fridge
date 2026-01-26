CREATE TABLE "badge" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"icon" text NOT NULL,
	"criteria" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "badge_type_unique" UNIQUE("type")
);
--> statement-breakpoint
CREATE TABLE "challenge" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"goal" jsonb NOT NULL,
	"reward" jsonb NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_badge" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"badge_id" text NOT NULL,
	"earned_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_challenge" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"challenge_id" text NOT NULL,
	"progress" jsonb NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_gamification_profile" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"streak" integer DEFAULT 0 NOT NULL,
	"last_activity_date" timestamp,
	"total_badges" integer DEFAULT 0 NOT NULL,
	"total_challenges_completed" integer DEFAULT 0 NOT NULL,
	"eco_score" numeric(10, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_gamification_profile_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "user_badge" ADD CONSTRAINT "user_badge_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_badge" ADD CONSTRAINT "user_badge_badge_id_badge_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."badge"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_challenge" ADD CONSTRAINT "user_challenge_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_challenge" ADD CONSTRAINT "user_challenge_challenge_id_challenge_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenge"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_gamification_profile" ADD CONSTRAINT "user_gamification_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "challenge_type_idx" ON "challenge" USING btree ("type");--> statement-breakpoint
CREATE INDEX "challenge_startDate_idx" ON "challenge" USING btree ("start_date");--> statement-breakpoint
CREATE INDEX "user_badge_userId_idx" ON "user_badge" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_badge_badgeId_idx" ON "user_badge" USING btree ("badge_id");--> statement-breakpoint
CREATE INDEX "user_challenge_userId_idx" ON "user_challenge" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_challenge_challengeId_idx" ON "user_challenge" USING btree ("challenge_id");--> statement-breakpoint
CREATE INDEX "user_gamification_profile_userId_idx" ON "user_gamification_profile" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_gamification_profile_points_idx" ON "user_gamification_profile" USING btree ("points");