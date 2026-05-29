import { db } from "@/lib/db";
import { sessions, activities, memoryItems } from "@/lib/db/schema";
import { eq, desc, and, sql, lte, gte } from "drizzle-orm";

export interface TimelineEvent {
	type: "session" | "activity" | "memory" | "break";
	id: number;
	sessionId: number;
	sessionTitle: string;
	title: string;
	description: string;
	timestamp: Date;
	duration?: string;
	focusScore?: number;
	metadata?: Record<string, unknown>;
}

export async function getTimeline(userId: number, limit = 20): Promise<TimelineEvent[]> {
	// Get recent sessions
	const recentSessions = await db
		.select()
		.from(sessions)
		.where(eq(sessions.userId, userId))
		.orderBy(desc(sessions.startTime))
		.limit(10);

	const events: TimelineEvent[] = [];

	for (const session of recentSessions) {
		// Add session event
		events.push({
			type: "session",
			id: session.id,
			sessionId: session.id,
			sessionTitle: session.title,
			title: session.title,
			description: session.summary ?? session.title,
			timestamp: session.startTime,
			duration: session.durationMinutes ? `${session.durationMinutes}m` : undefined,
			focusScore: session.focusScore ?? undefined,
		});

		// Get activities for this session
		const sessionActivities = await db
			.select()
			.from(activities)
			.where(eq(activities.sessionId, session.id))
			.orderBy(activities.timestamp);

		for (const act of sessionActivities) {
			events.push({
				type: "activity",
				id: act.id,
				sessionId: session.id,
				sessionTitle: session.title,
				title: act.type.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()),
				description: act.description,
				timestamp: act.timestamp,
				duration: act.durationSeconds ? `${Math.round(act.durationSeconds / 60)}m` : undefined,
				metadata: act.metadata as Record<string, unknown> | undefined,
			});
		}

		// Get memory items for this session
		const sessionMemories = await db
			.select()
			.from(memoryItems)
			.where(
				and(
					eq(memoryItems.sessionId, session.id),
					inArray(memoryItems.type, ["insight", "summary"]),
				),
			)
			.orderBy(desc(memoryItems.importanceScore));

		for (const mem of sessionMemories) {
			events.push({
				type: "memory",
				id: mem.id,
				sessionId: session.id,
				sessionTitle: session.title,
				title: mem.type === "insight" ? "AI Insight" : "Summary",
				description: mem.content,
				timestamp: mem.createdAt,
				metadata: { tags: mem.tags },
			});
		}
	}

	// Sort all events by timestamp descending, then take limit
	events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
	return events.slice(0, limit);
}
