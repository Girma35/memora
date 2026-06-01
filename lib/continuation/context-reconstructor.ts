import { getCurrentSession, getLastCompletedSession } from "@/lib/db/queries/sessions";
import { getContextItemsForSession } from "@/lib/db/queries/activities";
import { getInsightsForUser } from "@/lib/db/queries/memory";

type Activity = typeof import("@/lib/db/schema").activities.$inferSelect;

export interface ReconstructedContext {
	hasActiveSession: boolean;
	sessionTitle: string;
	project?: string | null;
	elapsedSeconds: number;
	elapsedMinutes: number;
	pausePoint?: string | null;
	blockers: Activity[];
	filesTouched: string[];
	recentContext: Activity[];
	insights: string[];
	nextSteps: string[];
}

export async function reconstructContext(userId: number): Promise<ReconstructedContext> {
	// Check for active session first
	const activeSession = await getCurrentSession(userId);
	const session = activeSession ?? (await getLastCompletedSession(userId));

	if (!session) {
		return {
			hasActiveSession: false,
			sessionTitle: "No previous session",
			elapsedSeconds: 0,
			elapsedMinutes: 0,
			pausePoint: null,
			blockers: [],
			filesTouched: [],
			recentContext: [],
			insights: [],
			nextSteps: [],
		};
	}

	const contextItems = await getContextItemsForSession(session.id);
	const insights = await getInsightsForUser(userId, 3);

	// Calculate elapsed time
	const startTime = session.startTime;
	const endTime = session.endTime ?? new Date();
	const elapsedSeconds = Math.round(
		(endTime.getTime() - startTime.getTime()) / 1000,
	);
	const elapsedMinutes = Math.floor(elapsedSeconds / 60);

	// Find pause point
	const pauseActivity = contextItems.find((a) => a.type === "pause_point");

	// Extract files touched
	const fileEdits = contextItems.filter((a) => a.type === "file_edit");
	const filesTouched = [
		...new Set(
			fileEdits.map((a) => {
				const meta = a.metadata as Record<string, unknown> | null;
				return typeof meta?.file === "string" ? meta.file : a.description.replace("Modified ", "").replace("Edited ", "");
			}),
		),
	];

	const blockers = contextItems.filter((a) => a.type === "blocker");

	// Generate suggested next steps based on context
	const nextSteps = generateNextSteps(blockers, fileEdits, pauseActivity);

	return {
		hasActiveSession: !!activeSession,
		sessionTitle: session.title,
		project: session.project,
		elapsedSeconds,
		elapsedMinutes,
		pausePoint: pauseActivity?.description ?? null,
		blockers,
		filesTouched,
		recentContext: contextItems.slice(-5),
		insights: insights.map((i) => i.content),
		nextSteps,
	};
}

function generateNextSteps(
	blockers: Activity[],
	fileEdits: Activity[],
	pausePoint?: Activity,
): string[] {
	const steps: string[] = [];

	if (pausePoint) {
		steps.push(`Continue: ${pausePoint.description}`);
	}

	for (const blocker of blockers) {
		const meta = blocker.metadata as Record<string, unknown> | null;
		if (meta?.file) {
			steps.push(`Fix blocker in ${meta.file}: ${blocker.description}`);
		} else {
			steps.push(`Resolve: ${blocker.description}`);
		}
	}

	if (fileEdits.length > 0 && steps.length < 3) {
		const lastFile = fileEdits[fileEdits.length - 1];
		const meta = lastFile.metadata as Record<string, unknown> | null;
		const fileName = typeof meta?.file === "string" ? meta.file : "the current file";
		steps.push(`Review changes in ${fileName}`);
	}

	if (steps.length === 0) {
		steps.push("Start a new task");
	}

	return steps.slice(0, 3);
}
