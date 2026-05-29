import { NextResponse } from "next/server";
import { getActivitiesForSession } from "@/lib/db/queries/activities";
import { getSessionById } from "@/lib/db/queries/sessions";
import { summarizeSession } from "@/lib/ai/summarizer";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { sessionId } = body;

		if (!sessionId) {
			return NextResponse.json(
				{ error: "sessionId is required" },
				{ status: 400 },
			);
		}

		const session = await getSessionById(Number(sessionId));
		if (!session) {
			return NextResponse.json(
				{ error: "Session not found" },
				{ status: 404 },
			);
		}

		const sessionActivities = await getActivitiesForSession(session.id);
		const aiSummary = await summarizeSession(
			session.title,
			sessionActivities,
			session.project,
		);

		return NextResponse.json({ summary: aiSummary });
	} catch (error) {
		console.error("Summarization failed:", error);
		// Return a fallback summary if AI is unavailable
		return NextResponse.json({
			summary: "AI summarization is currently unavailable. Check your OPENAI_API_KEY configuration.",
			fallback: true,
		});
	}
}
