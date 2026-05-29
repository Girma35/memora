import { db } from "@/lib/db";
import { activities, sessions } from "@/lib/db/schema";
import { eq, desc, and, inArray } from "drizzle-orm";

export async function getActivitiesForSession(sessionId: number) {
	return db
		.select()
		.from(activities)
		.where(eq(activities.sessionId, sessionId))
		.orderBy(activities.timestamp);
}

export async function getActivitiesForMultipleSessions(sessionIds: number[]) {
	if (sessionIds.length === 0) return [];
	return db
		.select()
		.from(activities)
		.where(inArray(activities.sessionId, sessionIds))
		.orderBy(activities.timestamp);
}

export async function getRecentActivitiesForUser(userId: number, limit = 20) {
	const userSessions = await db
		.select({ id: sessions.id })
		.from(sessions)
		.where(eq(sessions.userId, userId))
		.orderBy(desc(sessions.startTime))
		.limit(10);

	if (userSessions.length === 0) return [];

	const sessionIds = userSessions.map((s) => s.id);
	return db
		.select({
			id: activities.id,
			sessionId: activities.sessionId,
			type: activities.type,
			description: activities.description,
			metadata: activities.metadata,
			timestamp: activities.timestamp,
			durationSeconds: activities.durationSeconds,
			sessionTitle: sessions.title,
		})
		.from(activities)
		.leftJoin(sessions, eq(activities.sessionId, sessions.id))
		.where(inArray(activities.sessionId, sessionIds))
		.orderBy(desc(activities.timestamp))
		.limit(limit);
}

export async function getFilesForSession(sessionId: number) {
	return db
		.select()
		.from(activities)
		.where(
			and(
				eq(activities.sessionId, sessionId),
				inArray(activities.type, ["file_edit"]),
			),
		)
		.orderBy(activities.timestamp);
}

export async function getBlockersForSession(sessionId: number) {
	return db
		.select()
		.from(activities)
		.where(
			and(
				eq(activities.sessionId, sessionId),
				inArray(activities.type, ["blocker"]),
			),
		)
		.orderBy(activities.timestamp);
}

export async function getContextItemsForSession(sessionId: number) {
	return db
		.select()
		.from(activities)
		.where(
			and(
				eq(activities.sessionId, sessionId),
				inArray(activities.type, [
					"file_edit",
					"research",
					"blocker",
					"decision",
					"note",
				]),
			),
		)
		.orderBy(activities.timestamp);
}
