import { db } from "@/lib/db";
import { memoryItems, sessions, activities } from "@/lib/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export interface SearchResult {
	id: number;
	type: "memory" | "session" | "activity";
	title: string;
	content: string;
	relevance: number;
	timestamp: Date;
	sessionId?: number;
	metadata?: Record<string, unknown>;
}

export async function semanticSearch(
	userId: number,
	query: string,
	limit = 10,
): Promise<SearchResult[]> {
	const results: SearchResult[] = [];

	// Search memory items via ILIKE (basic text search)
	// In production, replace with pgvector similarity search
	const memoryResults = await db
		.select({
			id: memoryItems.id,
			type: memoryItems.type,
			content: memoryItems.content,
			importanceScore: memoryItems.importanceScore,
			createdAt: memoryItems.createdAt,
			sessionId: memoryItems.sessionId,
			tags: memoryItems.tags,
		})
		.from(memoryItems)
		.where(
			and(
				eq(memoryItems.userId, userId),
				sql`${memoryItems.content} ILIKE ${`%${query}%`}`,
			),
		)
		.orderBy(desc(memoryItems.importanceScore))
		.limit(limit);

	for (const m of memoryResults) {
		results.push({
			id: m.id,
			type: "memory",
			title: m.type.charAt(0).toUpperCase() + m.type.slice(1),
			content: m.content,
			relevance: m.importanceScore ?? 50,
			timestamp: m.createdAt,
			sessionId: m.sessionId ?? undefined,
			metadata: { tags: m.tags },
		});
	}

	if (results.length >= limit) return results.slice(0, limit);

	// Search sessions
	const sessionResults = await db
		.select()
		.from(sessions)
		.where(
			and(
				eq(sessions.userId, userId),
				sql`${sessions.title} ILIKE ${`%${query}%`}`,
			),
		)
		.orderBy(desc(sessions.startTime))
		.limit(limit);

	for (const s of sessionResults) {
		results.push({
			id: s.id,
			type: "session",
			title: s.title,
			content: s.summary ?? s.title,
			relevance: 75,
			timestamp: s.startTime,
			sessionId: s.id,
			metadata: { project: s.project, focusScore: s.focusScore },
		});
	}

	if (results.length >= limit) return results.slice(0, limit);

	// Search activities
	const activityResults = await db
		.select({
			id: activities.id,
			type: activities.type,
			description: activities.description,
			metadata: activities.metadata,
			timestamp: activities.timestamp,
			sessionId: activities.sessionId,
		})
		.from(activities)
		.where(sql`${activities.description} ILIKE ${`%${query}%`}`)
		.orderBy(desc(activities.timestamp))
		.limit(limit);

	for (const a of activityResults) {
		results.push({
			id: a.id,
			type: "activity",
			title: a.type.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()),
			content: a.description,
			relevance: 60,
			timestamp: a.timestamp,
			sessionId: a.sessionId,
			metadata: a.metadata as Record<string, unknown> | undefined,
		});
	}

	return results.slice(0, limit);
}
