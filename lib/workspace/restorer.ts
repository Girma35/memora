import { getCurrentSession, getLastCompletedSession } from "@/lib/db/queries/sessions";
import { getContextItemsForSession } from "@/lib/db/queries/activities";
import { getInsightsForUser } from "@/lib/db/queries/memory";

export interface WorkspaceSnapshot {
	files: string[];
	tabs: { title: string; url: string }[];
	notes: string[];
	blockers: string[];
	focusContext: string;
	suggestedNextStep: string;
}

export async function restoreWorkspace(userId: number): Promise<WorkspaceSnapshot | null> {
	const activeSession = await getCurrentSession(userId);
	const lastSession = activeSession ?? (await getLastCompletedSession(userId));

	if (!lastSession) return null;

	const contextItems = await getContextItemsForSession(lastSession.id);
	const insights = await getInsightsForUser(userId, 1);

	// Extract files
	const fileEdits = contextItems.filter((a) => a.type === "file_edit");
	const files = fileEdits.map((a) => {
		const meta = a.metadata as Record<string, unknown> | null;
		return (typeof meta?.file === "string" ? meta.file : a.description.replace("Modified ", "")) ?? "";
	}).filter(Boolean);

	// Extract research tabs
	const researchItems = contextItems.filter((a) => a.type === "research");
	const tabs = researchItems.map((a) => ({
		title: a.description.slice(0, 60),
		url: (a.metadata as Record<string, unknown> | null)?.url as string ?? a.description,
	}));

	// Extract blockers
	const blockers = contextItems
		.filter((a) => a.type === "blocker")
		.map((a) => a.description);

	// Extract notes/decisions
	const notes = contextItems
		.filter((a) => a.type === "note" || a.type === "decision")
		.map((a) => a.description);

	// Focus context
	const pausePoint = contextItems.find((a) => a.type === "pause_point");
	const focusContext = pausePoint?.description ?? lastSession.summary ?? lastSession.title;

	return {
		files: [...new Set(files)],
		tabs,
		blockers,
		notes,
		focusContext,
		suggestedNextStep: insights[0]?.content.slice(0, 120) ?? "Continue where you left off",
	};
}
