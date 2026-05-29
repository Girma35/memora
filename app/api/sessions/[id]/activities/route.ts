import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { activities } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const sessionId = Number.parseInt(id);
		if (Number.isNaN(sessionId)) {
			return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
		}

		const result = await db
			.select()
			.from(activities)
			.where(eq(activities.sessionId, sessionId))
			.orderBy(activities.timestamp);

		return NextResponse.json(result);
	} catch (error) {
		console.error("Failed to fetch activities:", error);
		return NextResponse.json(
			{ error: "Failed to fetch activities" },
			{ status: 500 },
		);
	}
}
