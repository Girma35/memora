import { db } from "@/lib/db";
import { sessions, activities, projects } from "@/lib/db/schema";
import { eq, desc, and, sql, lte, gte } from "drizzle-orm";

export type SessionWithMeta = Awaited<ReturnType<typeof getSessionsWithMeta>>[number];

export async function getSessionsWithMeta(userId: number) {
	return db
		.select({
			id: sessions.id,
			title: sessions.title,
			project: sessions.project,
			status: sessions.status,
			startTime: sessions.startTime,
			endTime: sessions.endTime,
			durationMinutes: sessions.durationMinutes,
			focusScore: sessions.focusScore,
			summary: sessions.summary,
			createdAt: sessions.createdAt,
			activityCount: sql<number>`count(distinct ${activities.id})`,
		})
		.from(sessions)
		.leftJoin(activities, eq(activities.sessionId, sessions.id))
		.where(eq(sessions.userId, userId))
		.groupBy(sessions.id)
		.orderBy(desc(sessions.startTime));
}

export async function getCurrentSession(userId: number) {
	const [session] = await db
		.select()
		.from(sessions)
		.where(and(eq(sessions.userId, userId), eq(sessions.status, "active")))
		.orderBy(desc(sessions.startTime))
		.limit(1);
	return session ?? null;
}

export async function getLastCompletedSession(userId: number) {
	const [session] = await db
		.select()
		.from(sessions)
		.where(and(eq(sessions.userId, userId), eq(sessions.status, "completed")))
		.orderBy(desc(sessions.endTime))
		.limit(1);
	return session ?? null;
}

export async function getYesterdayWorkDuration(userId: number) {
	const yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	const startOfDay = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
	const endOfDay = new Date(startOfDay.getTime() + 86400000);

	const rows = await db
		.select({
			totalMinutes: sql<number>`coalesce(sum(${sessions.durationMinutes}), 0)`,
		})
		.from(sessions)
		.where(
			and(
				eq(sessions.userId, userId),
				gte(sessions.startTime, startOfDay),
				lte(sessions.startTime, endOfDay),
			),
		);
	return rows[0]?.totalMinutes ?? 0;
}

export async function getRecentDaysDuration(userId: number, days: number) {
	const since = new Date();
	since.setDate(since.getDate() - days);

	const rows = await db
		.select({
			totalMinutes: sql<number>`coalesce(sum(${sessions.durationMinutes}), 0)`,
		})
		.from(sessions)
		.where(
			and(
				eq(sessions.userId, userId),
				gte(sessions.startTime, since),
			),
		);
	return rows[0]?.totalMinutes ?? 0;
}

export async function getSessionsForTimeline(userId: number, limit = 20) {
	return db
		.select()
		.from(sessions)
		.where(eq(sessions.userId, userId))
		.orderBy(desc(sessions.startTime))
		.limit(limit);
}

export async function getSessionById(sessionId: number) {
	const [session] = await db
		.select()
		.from(sessions)
		.where(eq(sessions.id, sessionId))
		.limit(1);
	return session ?? null;
}
