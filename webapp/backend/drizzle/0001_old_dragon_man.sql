ALTER TABLE "admin_activity_logs" DROP CONSTRAINT "admin_activity_logs_admin_id_admins_id_fk";
--> statement-breakpoint
ALTER TABLE "admin_sessions" DROP CONSTRAINT "admin_sessions_admin_id_admins_id_fk";
--> statement-breakpoint
ALTER TABLE "admins" DROP CONSTRAINT "admins_created_by_admins_id_fk";
