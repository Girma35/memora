CREATE TYPE "public"."activity_type" AS ENUM('file_edit', 'command', 'browser_tab', 'break', 'commit', 'deployment', 'research', 'blocker', 'decision', 'note', 'pause_point', 'milestone');--> statement-breakpoint
CREATE TYPE "public"."memory_type" AS ENUM('summary', 'insight', 'pattern', 'milestone', 'decision_log');--> statement-breakpoint
CREATE TYPE "public"."session_status" AS ENUM('active', 'paused', 'completed');--> statement-breakpoint
CREATE TABLE "activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"type" "activity_type" NOT NULL,
	"description" text NOT NULL,
	"metadata" json,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"duration_seconds" integer
);
--> statement-breakpoint
CREATE TABLE "memory_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"session_id" integer,
	"type" "memory_type" NOT NULL,
	"content" text NOT NULL,
	"tags" text[],
	"importance_score" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"color" text DEFAULT '#00E5FF',
	"is_active" text DEFAULT 'true' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" text NOT NULL,
	"project" text,
	"status" "session_status" DEFAULT 'active' NOT NULL,
	"start_time" timestamp DEFAULT now() NOT NULL,
	"end_time" timestamp,
	"duration_minutes" integer,
	"focus_score" integer,
	"summary" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memory_items" ADD CONSTRAINT "memory_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memory_items" ADD CONSTRAINT "memory_items_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;