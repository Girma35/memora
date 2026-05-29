import { db } from "@/lib/db";
import { memoryItems, sessions } from "@/lib/db/schema";
import { eq, desc, and, inArray } from "drizzle-orm";

export async function getMemoriesForUser(userId: number, type?: string) {
	const conditions = [eq(memoryItems.userId, userId)];
	if (type) conditions.push(eq(memoryItems.type, type));
	return db
		.select({
			id: memoryItems.id,
			type: memoryItems.type,
			content: memoryItems.content,
			tags: memoryItems.tags,
			importanceScore: memoryItems.importanceScore,
			createdAt: memoryItems.createdAt,
			sessionId: memoryItems.sessionId,
			sessionTitle: sessions.title,
		})
		.from(memoryItems)
		.leftJoin(sessions, eq(memoryItems.sessionId, sessions.id))
		.where(and(...conditions))
		.orderBy(desc(memoryItems.importanceScore));
}

export async function getInsightsForUser(userId: number, limit = 5) {
	return db
		.select()
		.from(memoryItems)
		.where(
			and(
				eq(memoryItems.userId, userId),
				inArray(memoryItems.type, ["insight", "pattern"]),
			),
		)
		.orderBy(desc(memoryItems.importanceScore))
		.limit(limit);
}

export async function getDailySummary(userId: number) {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const summaries = await db
		.select()
		.from(memoryItems)
		.where(
			and(
				eq(memoryItems.userId, userId),
				eq(memoryItems.type, "summary"),
			),
		)
		.orderBy(desc(memoryItems.createdAt))
		.limit(3);
	return summaries;
}

export async function searchMemories(userId: number, query: string) {
	return db
		.select()
		.from(memoryItems)
		.where(
			and(
				eq(memoryItems.userId, userId),
				// Basic text search using ILIKE
				// In production, replace with pgvector semantic search
				sql`${memoryItems.content} ILIKE ${`%${query}%`}`,
			),
		)
		.orderBy(desc(memoryItems.importanceScore))
		.limit(10);
}

import { sql } from "drizzle-orm";
