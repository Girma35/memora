import { NextResponse } from "next/server";
import { suggestNextStepsAI } from "@/lib/continuation/next-step-suggester";
import { getCurrentSession, getLastCompletedSession } from "@/lib/db/queries/sessions";
import { getContextItemsForSession } from "@/lib/db/queries/activities";

export async function GET() {
	try {
		const userId = 1;
		const activeSession = await getCurrentSession(userId);
		const session = activeSession ?? (await getLastCompletedSession(userId));

		if (!session) {
			return NextResponse.json({ steps: [] });
		}

		const contextItems = await getContextItemsForSession(session.id);
		const pausePoint = contextItems.find((a) => a.type === "pause_point");

		const steps = await suggestNextStepsAI(
			session.title,
			session.id,
			pausePoint?.description,
		);

		return NextResponse.json({ steps, sessionTitle: session.title });
	} catch (error) {
		console.error("Failed to suggest next steps:", error);
		return NextResponse.json(
			{ steps: [], error: "AI suggestion unavailable" },
			{ status: 200 }, // Return 200 with empty steps so UI doesn't break
		);
	}
}
