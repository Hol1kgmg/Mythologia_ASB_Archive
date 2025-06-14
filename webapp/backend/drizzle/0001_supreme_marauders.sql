CREATE TYPE "public"."admin_role" AS ENUM('super_admin', 'admin', 'viewer');--> statement-breakpoint
CREATE TABLE "admin_activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid NOT NULL,
	"action" varchar(100) NOT NULL,
	"target_type" varchar(50),
	"target_id" varchar(36),
	"details" json,
	"ip_address" varchar(45),
	"user_agent" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid NOT NULL,
	"token" varchar(255) NOT NULL,
	"ip_address" varchar(45),
	"user_agent" varchar(500),
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "admins" ADD COLUMN "role" "admin_role" DEFAULT 'admin' NOT NULL;--> statement-breakpoint
ALTER TABLE "admins" ADD COLUMN "permissions" json DEFAULT '[]'::json NOT NULL;--> statement-breakpoint
ALTER TABLE "admins" ADD COLUMN "is_super_admin" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "admins" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "admins" ADD COLUMN "last_login_at" timestamp;--> statement-breakpoint
ALTER TABLE "admins" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "admin_activity_logs" ADD CONSTRAINT "admin_activity_logs_admin_id_admins_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_admin_id_admins_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admins" ADD CONSTRAINT "admins_created_by_admins_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."admins"("id") ON DELETE no action ON UPDATE no action;