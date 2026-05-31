import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sessions, activities } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { requireUserId } from "@/lib/db/get-user";
import { processNewMemory } from "@/lib/memory/ingest";

export async function GET() {
	try {
		const userId = await requireUserId();
		const [session] = await db
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
			.where(
				and(
					eq(sessions.userId, userId),
					eq(sessions.status, "active"),
				),
			)
			.groupBy(sessions.id)
			.orderBy(desc(sessions.startTime))
			.limit(1);

		return NextResponse.json(session ?? null);
	} catch (error) {
		console.error("Failed to fetch current session:", error);
		return NextResponse.json(
			{ error: "Failed to fetch current session" },
			{ status: 500 },
		);
	}
}

// Used by sendBeacon on tab close (sendBeacon only supports POST)
export async function POST(request: Request) {
	try {
		const userId = await requireUserId();
		const body = await request.json();
		const { action, summary } = body;

		const [activeSession] = await db
			.select()
			.from(sessions)
			.where(and(eq(sessions.userId, userId), eq(sessions.status, "active")))
			.limit(1);

		if (!activeSession) return new Response(null, { status: 204 });

		const status = action === "complete" ? "completed" : "paused";
		const endTime = new Date();
		const durationMinutes = Math.floor(
			(endTime.getTime() - new Date(activeSession.startTime).getTime()) / 60000,
		);

		await db.update(sessions)
			.set({ status, endTime, durationMinutes })
			.where(eq(sessions.id, activeSession.id));

		if (summary) {
			await db.insert(activities).values({
				sessionId: activeSession.id,
				type: "pause_point",
				description: summary,
			});
			// Fire-and-forget memory deduplication/ingestion
			processNewMemory(userId, summary, "summary", activeSession.id).catch(console.error);
		}

		return new Response(null, { status: 204 });
	} catch {
		return new Response(null, { status: 500 });
	}
}

export async function PATCH(request: Request) {
	try {
		const userId = await requireUserId();
		
		// Find current active session
		const [activeSession] = await db
			.select()
			.from(sessions)
			.where(
				and(
					eq(sessions.userId, userId),
					eq(sessions.status, "active"),
				),
			)
			.limit(1);

		if (!activeSession) {
			return NextResponse.json(
				{ error: "No active session found" },
				{ status: 404 },
			);
		}

		const body = await request.json();
		const { action, summary } = body; // "pause" or "complete"

		const status = action === "complete" ? "completed" : "paused";
		const endTime = new Date();
		const durationMinutes = Math.floor(
			(endTime.getTime() - new Date(activeSession.startTime).getTime()) / 60000,
		);

		const [updatedSession] = await db
			.update(sessions)
			.set({
				status,
				endTime,
				durationMinutes,
			})
			.where(eq(sessions.id, activeSession.id))
			.returning();

		if (summary) {
			await db.insert(activities).values({
				sessionId: activeSession.id,
				type: "pause_point",
				description: summary,
			});
			// Fire-and-forget memory deduplication/ingestion
			processNewMemory(userId, summary, "summary", activeSession.id).catch(console.error);
		}

		return NextResponse.json(updatedSession);
	} catch (error) {
		console.error("Failed to update session:", error);
		return NextResponse.json(
			{ error: "Failed to update session" },
			{ status: 500 },
		);
	}
}
