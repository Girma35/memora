import { db } from "@/lib/db";
import { sessions, activities } from "@/lib/db/schema";
import { eq, desc, and, sql, lte, gte } from "drizzle-orm";

export interface DailyStats {
	date: string;
	totalMinutes: number;
	sessionCount: number;
	avgFocus: number;
	filesEdited: number;
	commandsRun: number;
	blockersFound: number;
}

export async function getDailyAnalytics(userId: number, days = 7): Promise<DailyStats[]> {
	const stats: DailyStats[] = [];
	for (let i = days - 1; i >= 0; i--) {
		const date = new Date();
		date.setDate(date.getDate() - i);
		const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
		const endOfDay = new Date(startOfDay.getTime() + 86400000);

		const daySessions = await db
			.select()
			.from(sessions)
			.where(
				and(
					eq(sessions.userId, userId),
					gte(sessions.startTime, startOfDay),
					lte(sessions.startTime, endOfDay),
				),
			);

		const sessionIds = daySessions.map((s) => s.id);
		const dayActivities = sessionIds.length > 0
			? await db
					.select()
					.from(activities)
					.where(
						and(
							eq(activities.sessionId, sessionIds[0]),
							// Use sessionId IN query via individual queries
						),
					)
			: [];

		// Get all activities for these sessions
		let allActivities: typeof dayActivities = [];
		for (const sid of sessionIds) {
			const acts = await db
				.select()
				.from(activities)
				.where(and(eq(activities.sessionId, sid)));
			allActivities = [...allActivities, ...acts];
		}

		const totalMinutes = daySessions.reduce((sum, s) => sum + (s.durationMinutes ?? 0), 0);
		const avgFocus = daySessions.length > 0
			? Math.round(daySessions.reduce((sum, s) => sum + (s.focusScore ?? 0), 0) / daySessions.length)
			: 0;

		stats.push({
			date: date.toISOString().split("T")[0],
			totalMinutes,
			sessionCount: daySessions.length,
			avgFocus,
			filesEdited: allActivities.filter((a) => a.type === "file_edit").length,
			commandsRun: allActivities.filter((a) => a.type === "command").length,
			blockersFound: allActivities.filter((a) => a.type === "blocker").length,
		});
	}
	return stats;
}

export async function getProductivityStreak(userId: number) {
	const sixtyDaysAgo = new Date();
	sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

	const recentSessions = await db
		.select({
			date: sql<string>`date_trunc('day', ${sessions.startTime})::date`,
			totalMinutes: sql<number>`coalesce(sum(${sessions.durationMinutes}), 0)`,
		})
		.from(sessions)
		.where(
			and(
				eq(sessions.userId, userId),
				gte(sessions.startTime, sixtyDaysAgo),
			),
		)
		.groupBy(sql`date_trunc('day', ${sessions.startTime})::date`)
		.orderBy(sql`date_trunc('day', ${sessions.startTime})::date desc`);

	let streak = 0;
	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const yesterday = new Date(today.getTime() - 86400000);

	const productiveDays = new Set(
		recentSessions
			.filter((s) => s.totalMinutes > 30)
			.map((s) => s.date),
	);

	for (let i = 0; i < 60; i++) {
		const checkDate = new Date(today.getTime() - i * 86400000);
		const dateStr = checkDate.toISOString().split("T")[0];
		if (productiveDays.has(dateStr)) {
			streak++;
		} else if (checkDate < yesterday) {
			break;
		}
	}

	const totalMinutes7d = recentSessions
		.filter((s) => {
			const d = new Date(s.date);
			return d >= new Date(today.getTime() - 7 * 86400000);
		})
		.reduce((sum, s) => sum + s.totalMinutes, 0);

	const totalMinutes28d = recentSessions
		.filter((s) => {
			const d = new Date(s.date);
			return d >= new Date(today.getTime() - 28 * 86400000);
		})
		.reduce((sum, s) => sum + s.totalMinutes, 0);

	const previous28d = recentSessions
		.filter((s) => {
			const d = new Date(s.date);
			return d >= new Date(today.getTime() - 56 * 86400000) && d < new Date(today.getTime() - 28 * 86400000);
		})
		.reduce((sum, s) => sum + s.totalMinutes, 0);

	const changePercent = previous28d > 0
		? Math.round(((totalMinutes28d - previous28d) / previous28d) * 100)
		: 0;

	// Find peak focus hour
	const focusData = await db
		.select({
			hour: sql<number>`extract(hour from ${sessions.startTime})`,
			avgFocus: sql<number>`avg(${sessions.focusScore})`,
		})
		.from(sessions)
		.where(
			and(
				eq(sessions.userId, userId),
				sql`${sessions.focusScore} is not null`,
			),
		)
		.groupBy(sql`extract(hour from ${sessions.startTime})`)
		.orderBy(sql`avg(${sessions.focusScore}) desc`)
		.limit(1);

	return {
		streak,
		totalMinutes7d: Math.round(totalMinutes7d / 60 * 10) / 10,
		totalMinutes28d: Math.round(totalMinutes28d / 60 * 10) / 10,
		changePercent,
		peakFocusHour: focusData[0]?.hour ?? null,
	};
}
