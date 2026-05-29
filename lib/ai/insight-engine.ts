import { getAIClient } from "./client";

type Activity = typeof import("@/lib/db/schema").activities.$inferSelect;

export interface Insight {
	type: "pattern" | "insight" | "recommendation";
	content: string;
	confidence: number;
}

export async function generateInsights(
	activities: Activity[],
	recentMemories: string[],
): Promise<Insight[]> {
	const client = getAIClient();

	const activitySummary = activities
		.map((a) => `[${a.type}] ${a.description}`)
		.join("\n");

	const memoriesContext = recentMemories.length > 0
		? `\nRecent memories:\n${recentMemories.map((m) => `- ${m}`).join("\n")}`
		: "";

	const response = await client.chat([
		{
			role: "system",
			content:
				"You are Memora's insight engine. Analyze work activities and produce JSON array of insights. Each insight has: type (pattern|insight|recommendation), content (string), confidence (0-100). Output ONLY valid JSON array.",
		},
		{
			role: "user",
			content: `Recent work activities:\n${activitySummary}${memoriesContext}\n\nIdentify patterns, insights and recommendations:`,
		},
	]);

	try {
		const parsed = JSON.parse(response.content);
		if (Array.isArray(parsed)) {
			return parsed.slice(0, 5);
		}
	} catch {
		// Fallback if AI doesn't return valid JSON
	}

	return [
		{
			type: "insight",
			content: response.content.slice(0, 200),
			confidence: 50,
		},
	];
}

export async function suggestNextSteps(
	sessionTitle: string,
	activities: Activity[],
	pausePoint?: string | null,
): Promise<string[]> {
	const client = getAIClient();

	const context = activities
		.map((a) => `[${a.type}] ${a.description}`)
		.join("\n");

	const pauseContext = pausePoint ? `\nPaused while: ${pausePoint}` : "";

	const response = await client.chat([
		{
			role: "system",
			content:
				"You are Memora. Based on the user's recent work session, suggest 2-3 specific next steps. Be actionable and technical. Return as a simple numbered list.",
		},
		{
			role: "user",
			content: `Session: ${sessionTitle}\n\nActivities:\n${context}${pauseContext}\n\nWhat should the user do next?`,
		},
	]);

	return response.content
		.split("\n")
		.filter((line: string) => /^\d+[\.\)]/.test(line.trim()))
		.map((line: string) => line.replace(/^\d+[\.\)]\s*/, "").trim())
		.slice(0, 3);
}
