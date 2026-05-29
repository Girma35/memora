import { NextResponse } from "next/server";
import { memoryItems, sessions } from "@/lib/db/schema";
import { db } from "@/lib/db";
import { eq, desc } from "drizzle-orm";

export async function GET() {
	try {
		const userId = 1;
		const memories = await db
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
			.where(eq(memoryItems.userId, userId))
			.orderBy(desc(memoryItems.importanceScore));

		return NextResponse.json(memories);
	} catch (error) {
		console.error("Failed to fetch memories:", error);
		return NextResponse.json(
			{ error: "Failed to fetch memories" },
			{ status: 500 },
		);
	}
}
