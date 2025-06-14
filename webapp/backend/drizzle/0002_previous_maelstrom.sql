CREATE INDEX "admin_activity_logs_admin_id_idx" ON "admin_activity_logs" USING btree ("admin_id");--> statement-breakpoint
CREATE INDEX "admin_activity_logs_created_at_idx" ON "admin_activity_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "admin_activity_logs_admin_created_idx" ON "admin_activity_logs" USING btree ("admin_id","created_at");--> statement-breakpoint
CREATE INDEX "admin_activity_logs_action_idx" ON "admin_activity_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "admin_activity_logs_action_created_idx" ON "admin_activity_logs" USING btree ("action","created_at");--> statement-breakpoint
CREATE INDEX "admin_activity_logs_target_idx" ON "admin_activity_logs" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "admin_sessions_admin_id_idx" ON "admin_sessions" USING btree ("admin_id");--> statement-breakpoint
CREATE INDEX "admin_sessions_expires_at_idx" ON "admin_sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "admin_sessions_admin_expires_idx" ON "admin_sessions" USING btree ("admin_id","expires_at");