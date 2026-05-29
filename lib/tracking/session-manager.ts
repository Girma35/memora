import { db } from "@/lib/db";
import { sessions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export class SessionManager {
	private userId: number;

	constructor(userId: number) {
		this.userId = userId;
	}

	async startSession(title: string, project?: string) {
		const [session] = await db
			.insert(sessions)
			.values({
				userId: this.userId,
				title,
				project: project ?? null,
				status: "active",
				startTime: new Date(),
			})
			.returning();
		return session;
	}

	async pauseSession(sessionId: number) {
		const [session] = await db
			.update(sessions)
			.set({ status: "paused" })
			.where(eq(sessions.id, sessionId))
			.returning();
		return session;
	}

	async resumeSession(sessionId: number) {
		const [session] = await db
			.update(sessions)
			.set({ status: "active" })
			.where(eq(sessions.id, sessionId))
			.returning();
		return session;
	}

	async completeSession(sessionId: number, summary?: string) {
		const endTime = new Date();
		const existing = await db
			.select()
			.from(sessions)
			.where(eq(sessions.id, sessionId))
			.limit(1);

		if (existing.length === 0) return null;

		const startTime = existing[0].startTime;
		const durationMinutes = Math.round(
			(endTime.getTime() - startTime.getTime()) / 60000,
		);

		const [session] = await db
			.update(sessions)
			.set({
				status: "completed",
				endTime,
				durationMinutes,
				summary: summary ?? null,
			})
			.where(eq(sessions.id, sessionId))
			.returning();
		return session;
	}

	async getActiveSession() {
		const [session] = await db
			.select()
			.from(sessions)
			.where(
				eq(sessions.status, "active") &&
					eq(sessions.userId, this.userId),
			)
			.orderBy(desc(sessions.startTime))
			.limit(1);
		return session ?? null;
	}
}
