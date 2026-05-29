import {
	pgTable,
	serial,
	text,
	timestamp,
	integer,
	json,
	pgEnum,
} from "drizzle-orm/pg-core";

// --- Enums ---
export const sessionStatusEnum = pgEnum("session_status", [
	"active",
	"paused",
	"completed",
]);

export const activityTypeEnum = pgEnum("activity_type", [
	"file_edit",
	"command",
	"browser_tab",
	"break",
	"commit",
	"deployment",
	"research",
	"blocker",
	"decision",
	"note",
	"pause_point",
	"milestone",
]);

export const memoryTypeEnum = pgEnum("memory_type", [
	"summary",
	"insight",
	"pattern",
	"milestone",
	"decision_log",
]);

export const entityTypeEnum = pgEnum("entity_type", [
	"project",
	"file",
	"bug",
	"feature",
	"decision",
	"topic",
	"person",
	"meeting",
]);

export const relationTypeEnum = pgEnum("relation_type", [
	"contains",
	"belongs_to",
	"located_in",
	"has_bug",
	"influences",
	"related_to",
	"depends_on",
	"fixes",
	"discusses",
	"implemented_in",
]);

// --- Users ---
export const users = pgTable("users", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- Sessions ---
export const sessions = pgTable("sessions", {
	id: serial("id").primaryKey(),
	userId: integer("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	title: text("title").notNull(),
	project: text("project"),
	status: sessionStatusEnum("status").default("active").notNull(),
	startTime: timestamp("start_time").defaultNow().notNull(),
	endTime: timestamp("end_time"),
	durationMinutes: integer("duration_minutes"),
	focusScore: integer("focus_score"),
	summary: text("summary"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- Activities (unified: everything that happens in a session) ---
export const activities = pgTable("activities", {
	id: serial("id").primaryKey(),
	sessionId: integer("session_id")
		.notNull()
		.references(() => sessions.id, { onDelete: "cascade" }),
	type: activityTypeEnum("type").notNull(),
	description: text("description").notNull(),
	metadata: json("metadata"),
	timestamp: timestamp("timestamp").defaultNow().notNull(),
	durationSeconds: integer("duration_seconds"),
});

// --- Projects ---
export const projects = pgTable("projects", {
	id: serial("id").primaryKey(),
	userId: integer("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	description: text("description"),
	color: text("color").default("#00E5FF"),
	isActive: text("is_active").default("true").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- Memory Items (AI-generated) ---
export const memoryItems = pgTable("memory_items", {
	id: serial("id").primaryKey(),
	userId: integer("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	sessionId: integer("session_id").references(() => sessions.id, {
		onDelete: "set null",
	}),
	type: memoryTypeEnum("type").notNull(),
	content: text("content").notNull(),
	tags: text("tags").array(),
	importanceScore: integer("importance_score").default(0),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- Embeddings (for semantic search) ---
export const embeddings = pgTable("embeddings", {
	id: serial("id").primaryKey(),
	userId: integer("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	entityType: text("entity_type").notNull(), // "session" | "activity" | "memory_item"
	entityId: integer("entity_id").notNull(),
	content: text("content").notNull(),
	embedding: json("embedding"), // vector stored as JSON array
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- Knowledge Entities (nodes in knowledge graph) ---
export const knowledgeEntities = pgTable("knowledge_entities", {
	id: serial("id").primaryKey(),
	userId: integer("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	type: entityTypeEnum("type").notNull(),
	name: text("name").notNull(),
	description: text("description"),
	metadata: json("metadata"),
	strength: integer("strength").default(50),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- Knowledge Relations (edges in knowledge graph) ---
export const knowledgeRelations = pgTable("knowledge_relations", {
	id: serial("id").primaryKey(),
	sourceId: integer("source_id")
		.notNull()
		.references(() => knowledgeEntities.id, { onDelete: "cascade" }),
	targetId: integer("target_id")
		.notNull()
		.references(() => knowledgeEntities.id, { onDelete: "cascade" }),
	relationType: relationTypeEnum("relation_type").notNull(),
	strength: integer("strength").default(50),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- Continuation Points (pause/resume context) ---
export const continuationPoints = pgTable("continuation_points", {
	id: serial("id").primaryKey(),
	sessionId: integer("session_id")
		.notNull()
		.references(() => sessions.id, { onDelete: "cascade" }),
	description: text("description").notNull(),
	contextSnapshot: json("context_snapshot"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});
