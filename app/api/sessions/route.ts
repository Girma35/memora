import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sessions, activities } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { requireUserId } from "@/lib/db/get-user";

export async function GET() {
	try {
		const userId = await requireUserId();
		const allSessions = await db
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

		return NextResponse.json(allSessions);
	} catch (error) {
		console.error("Failed to fetch sessions:", error);
		return NextResponse.json(
			{ error: "Failed to fetch sessions" },
			{ status: 500 },
		);
	}
}
