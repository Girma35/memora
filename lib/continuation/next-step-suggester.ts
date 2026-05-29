import { getAIClient } from "@/lib/ai/client";
import { getActivitiesForSession } from "@/lib/db/queries/activities";

type Activity = typeof import("@/lib/db/schema").activities.$inferSelect;

export interface SuggestedStep {
	title: string;
	description: string;
	priority: "high" | "medium" | "low";
	context?: string;
}

export async function suggestNextStepsAI(
	sessionTitle: string,
	sessionId: number,
	pausePoint?: string | null,
): Promise<SuggestedStep[]> {
	try {
		const activities = await getActivitiesForSession(sessionId);
		const client = getAIClient();

		const activityLog = activities
			.map((a) => `[${a.type}] ${a.description}`)
			.join("\n");

		const pauseContext = pausePoint ? `\nPaused while: ${pausePoint}` : "";

		const response = await client.chat([
			{
				role: "system",
				content:
					"You are Memora's next-step suggestion engine. Based on the user's work session, suggest 2-3 specific, actionable next steps. Return as JSON array with: title, description, priority (high|medium|low), context (optional). Output ONLY valid JSON.",
			},
			{
				role: "user",
				content: `Session: ${sessionTitle}\n\nActivities:\n${activityLog}${pauseContext}\n\nWhat should the user do next?`,
			},
		]);

		try {
			const parsed = JSON.parse(response.content);
			if (Array.isArray(parsed)) return parsed.slice(0, 3);
		} catch {
			// fallback
		}

		return [
			{
				title: "Continue work",
				description: response.content.slice(0, 150),
				priority: "high",
			},
		];
	} catch {
		// If AI is unavailable, return contextual guesses
		return getFallbackSuggestions(sessionId);
	}
}

async function getFallbackSuggestions(sessionId: number): Promise<SuggestedStep[]> {
	const activities = await getActivitiesForSession(sessionId);
	const blockers = activities.filter((a) => a.type === "blocker");
	const edits = activities.filter((a) => a.type === "file_edit");

	const steps: SuggestedStep[] = [];

	if (blockers.length > 0) {
		steps.push({
			title: `Resolve blocker: ${blockers[0].description.slice(0, 60)}`,
			description: blockers[0].description,
			priority: "high",
		});
	}

	if (edits.length > 0) {
		steps.push({
			title: `Continue editing in current files`,
			description: "Review and commit your latest changes",
			priority: "medium",
			context: edits.map((e) => e.description).join(", "),
		});
	}

	if (steps.length === 0) {
		steps.push({
			title: "Start a new focused session",
			description: "Begin tracking a new work session",
			priority: "medium",
		});
	}

	return steps;
}
