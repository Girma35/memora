import { NavBar } from "@/components/nav-bar";
import { AppSidebar } from "@/components/app-sidebar";
import { requireUserId } from "@/lib/db/get-user";
import { getTimeline } from "@/lib/db/queries/timeline";
import { SessionListClient, type TimelineEvent } from "./SessionListClient";

export const dynamic = "force-dynamic";

export default async function SessionPage() {
	const userId = await requireUserId();
	const timeline = await getTimeline(userId, 50);
	const initialEvents: TimelineEvent[] = timeline.map((event) => ({
		type: event.type,
		id: event.id,
		sessionId: event.sessionId,
		sessionTitle: event.sessionTitle,
		title: event.title,
		description: event.description,
		timestamp: event.timestamp.toISOString(),
		duration: event.duration,
		focusScore: event.focusScore,
	}));

	return (
		<div className="flex flex-col min-h-screen bg-[#111111] text-zinc-300 font-sans">
			<NavBar />

			<div className="flex flex-1 w-full max-w-6xl mx-auto mt-8 px-6 gap-12">
				<AppSidebar />

				<main className="flex-1 max-w-3xl pb-20">
					<div className="mb-10">
						<div className="flex items-center gap-4 mb-2">
							<h1 className="text-3xl font-semibold text-white tracking-tight">
								Session Memory
							</h1>
							<div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-teal-500/30 bg-teal-900/20 text-[#00E5FF] text-xs font-medium">
								<div className="size-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
								Live
							</div>
						</div>
						<p className="text-zinc-400 text-sm">
							Review your work sessions, AI context, and productivity patterns.
						</p>
					</div>
					<SessionListClient initialEvents={initialEvents} />
				</main>
			</div>
		</div>
	);
}
