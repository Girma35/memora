import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sessions, activities, memoryItems } from "@/lib/db/schema";
import { eq, desc, and, sql, inArray } from "drizzle-orm";

export async function GET() {
	try {
		const userId = 1;

		// Get recent sessions
		const recentSessions = await db
			.select()
			.from(sessions)
			.where(eq(sessions.userId, userId))
			.orderBy(desc(sessions.startTime))
			.limit(10);

		const events: Array<{
			type: string;
			id: number;
			sessionId: number;
			sessionTitle: string;
			title: string;
			description: string;
			timestamp: string;
			duration?: string;
			focusScore?: number;
		}> = [];

		for (const session of recentSessions) {
			events.push({
				type: "session",
				id: session.id,
				sessionId: session.id,
				sessionTitle: session.title,
				title: session.title,
				description: session.summary ?? session.title,
				timestamp: session.startTime.toISOString(),
				duration: session.durationMinutes ? `${session.durationMinutes}m` : undefined,
				focusScore: session.focusScore ?? undefined,
			});

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
					timestamp: act.timestamp.toISOString(),
					duration: act.durationSeconds ? `${Math.round(act.durationSeconds / 60)}m` : undefined,
				});
			}

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
					timestamp: mem.createdAt.toISOString(),
				});
			}
		}

		events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

		return NextResponse.json(events.slice(0, 50));
	} catch (error) {
		console.error("Failed to fetch timeline:", error);
		return NextResponse.json(
			{ error: "Failed to fetch timeline" },
			{ status: 500 },
		);
	}
}
