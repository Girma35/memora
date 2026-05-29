CREATE TYPE "public"."entity_type" AS ENUM('project', 'file', 'bug', 'feature', 'decision', 'topic', 'person', 'meeting');--> statement-breakpoint
CREATE TYPE "public"."relation_type" AS ENUM('contains', 'belongs_to', 'located_in', 'has_bug', 'influences', 'related_to', 'depends_on', 'fixes', 'discusses', 'implemented_in');--> statement-breakpoint
CREATE TABLE "continuation_points" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"description" text NOT NULL,
	"context_snapshot" json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "embeddings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" integer NOT NULL,
	"content" text NOT NULL,
	"embedding" json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_entities" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" "entity_type" NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"metadata" json,
	"strength" integer DEFAULT 50,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_relations" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_id" integer NOT NULL,
	"target_id" integer NOT NULL,
	"relation_type" "relation_type" NOT NULL,
	"strength" integer DEFAULT 50,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "continuation_points" ADD CONSTRAINT "continuation_points_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "embeddings" ADD CONSTRAINT "embeddings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_entities" ADD CONSTRAINT "knowledge_entities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_relations" ADD CONSTRAINT "knowledge_relations_source_id_knowledge_entities_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."knowledge_entities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_relations" ADD CONSTRAINT "knowledge_relations_target_id_knowledge_entities_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."knowledge_entities"("id") ON DELETE cascade ON UPDATE no action;