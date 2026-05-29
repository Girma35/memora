import { getAIClient } from "./client";

type Activity = typeof import("@/lib/db/schema").activities.$inferSelect;

export async function summarizeSession(
	sessionTitle: string,
	activities: Activity[],
	project?: string | null,
): Promise<string> {
	const client = getAIClient();

	const activityLog = activities
		.map(
			(a) =>
				`[${a.type}] ${a.description} (${a.timestamp.toLocaleTimeString()}${a.durationSeconds ? `, ${Math.round(a.durationSeconds / 60)}m` : ""})`,
		)
		.join("\n");

	const response = await client.chat([
		{
			role: "system",
			content:
				"You are Memora, an AI that summarizes work sessions concisely. Produce 1-2 paragraphs covering what was accomplished, key decisions, and blockers. Be specific and technical.",
		},
		{
			role: "user",
			content: `Session: ${sessionTitle}${project ? `\nProject: ${project}` : ""}\n\nActivities:\n${activityLog}\n\nProvide a concise summary of this work session:`,
		},
	]);

	return response.content;
}

export async function generateDailySummary(
	date: string,
	sessionsData: { title: string; summary?: string | null; durationMinutes?: number | null }[],
): Promise<string> {
	const client = getAIClient();

	const sessionSummaries = sessionsData
		.map(
			(s) =>
				`- ${s.title} (${s.durationMinutes ?? "?"}min): ${s.summary ?? "No summary"}`,
		)
		.join("\n");

	const response = await client.chat([
		{
			role: "system",
			content:
				"You are Memora, an AI that generates daily work summaries. Output 3-4 bullet points covering key accomplishments, patterns, and momentum.",
		},
		{
			role: "user",
			content: `Work sessions for ${date}:\n${sessionSummaries}\n\nGenerate a daily review summary:`,
		},
	]);

	return response.content;
}
