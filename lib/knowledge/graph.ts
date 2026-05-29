import { db } from "@/lib/db";
import { memoryItems, sessions, activities } from "@/lib/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export interface GraphEntity {
	id: string;
	type: "project" | "file" | "bug" | "feature" | "decision" | "topic";
	name: string;
	description: string;
	strength: number;
	relatedTo: { id: string; name: string; relation: string; strength: number }[];
}

export async function buildKnowledgeGraph(
	userId: number,
	limit = 20,
): Promise<GraphEntity[]> {
	const entities: Map<string, GraphEntity> = new Map();

	// Extract entities from recent memory items
	const recentMemories = await db
		.select()
		.from(memoryItems)
		.where(eq(memoryItems.userId, userId))
		.orderBy(desc(memoryItems.importanceScore))
		.limit(50);

	for (const mem of recentMemories) {
		const tags = mem.tags ?? [];
		for (const tag of tags) {
			if (!entities.has(tag)) {
				entities.set(tag, {
					id: tag,
					type: inferTagType(tag),
					name: tag.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
					description: mem.content.slice(0, 100),
					strength: mem.importanceScore ?? 50,
					relatedTo: [],
				});
			}
		}
	}

	// Add projects from sessions
	const recentSessions = await db
		.select()
		.from(sessions)
		.where(
			and(
				eq(sessions.userId, userId),
				sql`${sessions.project} is not null`,
			),
		)
		.orderBy(desc(sessions.startTime))
		.limit(20);

	const projects = [...new Set(recentSessions.map((s) => s.project).filter(Boolean))];
	for (const project of projects) {
		if (project && !entities.has(project)) {
			entities.set(project, {
				id: project,
				type: "project",
				name: project.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
				description: `Project with ${recentSessions.filter((s) => s.project === project).length} sessions`,
				strength: 90,
				relatedTo: [],
			});
		}
	}

	// Extract files from activities
	const recentActivities = await db
		.select()
		.from(activities)
		.where(eq(activities.type, "file_edit"))
		.orderBy(desc(activities.timestamp))
		.limit(50);

	for (const act of recentActivities) {
		const meta = act.metadata as Record<string, unknown> | null;
		const filePath = typeof meta?.file === "string" ? meta.file : act.description.replace("Modified ", "").replace("Edited ", "");
		if (filePath && !entities.has(filePath)) {
			entities.set(filePath, {
				id: filePath,
				type: "file",
				name: filePath.split("/").pop() ?? filePath,
				description: `File modified in sessions`,
				strength: 70,
				relatedTo: [],
			});
		}
	}

	// Build relationships
	const entityArray = Array.from(entities.values());

	// Connect related entities based on co-occurrence
	for (let i = 0; i < entityArray.length; i++) {
		for (let j = i + 1; j < entityArray.length; j++) {
			const similarity = computeSimilarity(entityArray[i], entityArray[j]);
			if (similarity > 0) {
				entityArray[i].relatedTo.push({
					id: entityArray[j].id,
					name: entityArray[j].name,
					relation: getRelationType(entityArray[i].type, entityArray[j].type),
					strength: similarity,
				});
				entityArray[j].relatedTo.push({
					id: entityArray[i].id,
					name: entityArray[i].name,
					relation: getRelationType(entityArray[j].type, entityArray[i].type),
					strength: similarity,
				});
			}
		}
	}

	return entityArray
		.sort((a, b) => b.strength - a.strength)
		.slice(0, limit);
}

function inferTagType(tag: string): GraphEntity["type"] {
	const lower = tag.toLowerCase();
	if (lower.endsWith(".ts") || lower.endsWith(".tsx") || lower.endsWith(".js") || lower.endsWith(".css")) return "file";
	if (lower.includes("bug") || lower.includes("fix") || lower.includes("error")) return "bug";
	if (lower.includes("feat") || lower.includes("feature") || lower.includes("impl")) return "feature";
	if (lower.includes("decid") || lower.includes("arch") || lower.includes("choice")) return "decision";
	if (lower.includes("topic") || lower.includes("research") || lower.includes("learn")) return "topic";
	return "topic";
}

function computeSimilarity(a: GraphEntity, b: GraphEntity): number {
	let score = 0;
	if (a.type === b.type) score += 20;
	const aWords = a.name.toLowerCase().split(/\s+/);
	const bWords = b.name.toLowerCase().split(/\s+/);
	const common = aWords.filter((w) => bWords.includes(w));
	score += common.length * 15;
	return Math.min(score, 100);
}

function getRelationType(from: GraphEntity["type"], to: GraphEntity["type"]): string {
	if (from === "project" && to === "file") return "contains";
	if (from === "file" && to === "project") return "belongs_to";
	if (from === "bug" && to === "file") return "located_in";
	if (from === "file" && to === "bug") return "has_bug";
	if (from === "decision" && to === "feature") return "influences";
	if (from === "topic" && to === "feature") return "related_to";
	return "related_to";
}
