import { db } from "@/lib/db";
import { memoryItems, sessions, type memoryTypeEnum } from "@/lib/db/schema";
import { eq, desc, and, inArray, sql } from "drizzle-orm";

export async function getMemoriesForUser(
	userId: number,
	type?: string,
) {
	const conditions = [eq(memoryItems.userId, userId)];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	if (type) conditions.push(eq(memoryItems.type, type as any));
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
				inArray(memoryItems.type, ["insight", "pattern"] as const),
			),
		)
		.orderBy(desc(memoryItems.importanceScore))
		.limit(limit);
}

export async function getDailySummary(userId: number) {
	const summaries = await db
		.select()
		.from(memoryItems)
		.where(
			and(
				eq(memoryItems.userId, userId),
				eq(memoryItems.type, "summary" as const),
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
				sql`${memoryItems.content} ILIKE ${`%${query}%`}`,
			),
		)
		.orderBy(desc(memoryItems.importanceScore))
		.limit(10);
}
