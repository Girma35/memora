"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { NavBar } from "@/components/nav-bar";
import {
	Lightbulb,
	ExternalLink,
	FileText,
	AlertCircle,
	Play,
	CheckCircle,

	Terminal,
	AlignLeft,
	Link as LinkIcon,
	Search,
	GitBranch,
	Info,
	MoreHorizontal,
	Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SessionData {
	id: number;
	title: string;
	project: string | null;
	status: string;
	startTime: string;
	endTime: string | null;
	durationMinutes: number | null;
	focusScore: number | null;
	summary: string | null;
	activityCount: number;
}

interface ContinuationData {
	hasActiveSession: boolean;
	sessionTitle: string;
	project: string | null;
	elapsedMinutes: number;
	pausePoint: string | null;
	blockers: Array<{ id: number; type: string; description: string }>;
	filesTouched: string[];
	nextSteps: string[];
}

interface AnalyticsData {
	streak: {
		streak: number;
		totalMinutes7d: number;
		totalMinutes28d: number;
		changePercent: number;
		peakFocusHour: number | null;
	};
	dailyStats: Array<{
		date: string;
		totalMinutes: number;
		sessionCount: number;
		avgFocus: number;
	}>;
}

interface MemoryData {
	id: number;
	type: string;
	content: string;
	tags: string[] | null;
	importanceScore: number;
	createdAt: string;
	sessionTitle: string | null;
}

export default function Home() {
	const [session, setSession] = useState<SessionData | null>(null);
	const [continuation, setContinuation] = useState<ContinuationData | null>(null);
	const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
	const [memories, setMemories] = useState<MemoryData[]>([]);
	const [loading, setLoading] = useState(true);
	const [chatInput, setChatInput] = useState("");
	const router = useRouter();

	const handleChatSubmit = () => {
		if (chatInput.trim()) {
			router.push(`/ai-chat?q=${encodeURIComponent(chatInput.trim())}`);
		}
	};

	useEffect(() => {
		async function fetchData() {
			try {
				const [sessionRes, continuationRes, analyticsRes, memoryRes] =
					await Promise.all([
						fetch("/api/sessions/current"),
						fetch("/api/continuation"),
						fetch("/api/analytics"),
						fetch("/api/memory"),
					]);

				if (sessionRes.ok) setSession(await sessionRes.json());
				if (continuationRes.ok) setContinuation(await continuationRes.json());
				if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
				if (memoryRes.ok) setMemories(await memoryRes.json());
			} catch (e) {
				console.error("Failed to fetch home data:", e);
			} finally {
				setLoading(false);
			}
		}
		fetchData();
	}, []);

	const activeSession = session;
	const ctx = continuation;
	const streak = analytics?.streak;
	const dailyStats = analytics?.dailyStats ?? [];
	const dailyMemories = memories.filter((m) => m.type === "summary").slice(0, 3);
	const insights = memories.filter((m) => m.type === "insight" || m.type === "pattern").slice(0, 3);

	// Compute yesterday's minutes from dailyStats
	const yesterdayMinutes = dailyStats.length > 1 ? dailyStats[dailyStats.length - 2]?.totalMinutes ?? 0 : 0;
	const yesterdayHours = (yesterdayMinutes / 60).toFixed(1);

	return (
		<div className="flex flex-col min-h-screen bg-[#0E0E0E] text-zinc-300 font-sans">
			<NavBar />

			<main className="flex-1 w-full max-w-4xl mx-auto px-6 py-10 flex flex-col gap-6">
				{loading ? (
					<div className="flex items-center justify-center py-20">
						<Loader2 className="size-6 text-[#00E5FF] animate-spin" />
					</div>
				) : (
					<>
					{/* 1. Hero Stats Card */}
					<div className="rounded-xl border border-white/5 bg-[#141414] p-8 flex flex-col relative overflow-hidden">
						<div className="flex justify-between items-start mb-4">
							<h1 className="text-3xl font-semibold text-white tracking-tight">
								You worked{" "}
								<span className="text-[#00E5FF]">
									{ctx?.elapsedMinutes
										? `${(ctx.elapsedMinutes / 60).toFixed(1)}h`
										: `${yesterdayHours}h`}
								</span>{" "}
								{ctx?.sessionTitle !== "No previous session"
									? `on ${ctx?.sessionTitle ?? "your project"}`
									: "recently"}
							</h1>
							<div className="flex items-center gap-2 px-3 py-1 bg-[#00E5FF]/10 rounded-full border border-[#00E5FF]/20 text-[#00E5FF] text-[10px] font-bold tracking-wider">
								<div className="size-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
								AI AWARENESS ACTIVE
							</div>
						</div>
						<p className="text-zinc-400 text-sm mb-8">
							{ctx?.pausePoint
								? ctx.pausePoint
								: ctx?.sessionTitle !== "No previous session"
									? `Working on ${ctx?.sessionTitle}. ${streak ? `${streak.streak} day streak.` : ""}`
									: "Start a new session to begin tracking."}
						</p>

						{/* Inner suggested step */}
						{ctx && ctx.nextSteps.length > 0 && (
							<div className="bg-[#1C1C1C] rounded-lg border border-white/5 p-4 flex items-center justify-between">
								<div className="flex items-center gap-4">
									<div className="size-10 rounded-full bg-white/5 flex items-center justify-center">
										<Lightbulb className="size-5 text-[#00E5FF]" />
									</div>
									<div>
										<p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-0.5">
											Suggested Next Step
										</p>
										<p className="text-white text-sm">{ctx.nextSteps[0]}</p>
									</div>
								</div>
								<Button onClick={() => router.push("/workspace")} className="bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-black px-5 font-semibold">
									Quick continue
								</Button>
							</div>
						)}
					</div>

					{/* 2. Ongoing Task / Active Session */}
					{activeSession && (
						<div className="rounded-xl border border-white/5 bg-[#141414] p-6 flex flex-col">
							<div className="flex items-center justify-between mb-4">
								<p className="text-[11px] font-bold text-[#00E5FF] tracking-widest uppercase">
									Active Session
								</p>
								<Button onClick={() => router.push("/workspace")} variant="ghost" size="icon" className="size-8 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10">
									<ExternalLink className="size-4" />
								</Button>
							</div>

							<h2 className="text-lg text-white font-medium mb-3">{activeSession.title}</h2>

							{ctx && ctx.filesTouched.length > 0 && (
								<div className="flex gap-2 mb-6">
									{ctx.filesTouched.slice(0, 4).map((file) => (
										<div key={file} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 border border-white/5 text-xs text-zinc-300">
											<FileText className="size-3.5 text-[#00E5FF]" /> {file}
										</div>
									))}
								</div>
							)}

							{ctx && ctx.blockers.length > 0 && (
								<div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
									<div className="flex items-center gap-2 mb-1 text-red-400 font-medium text-sm">
										<AlertCircle className="size-4" /> Blocker identified
									</div>
									<p className="text-xs text-red-200/70 ml-6">{ctx.blockers[0].description}</p>
								</div>
							)}

							<Button onClick={() => router.push("/workspace")} variant="outline" className="w-full bg-white/5 hover:bg-white/10 border-white/10 text-white h-12">
								<Play className="size-4" /> Quick Continue
							</Button>
						</div>
					)}

					{/* 3. AI Daily Summary */}
					<div className="rounded-xl border border-white/5 bg-[#141414] p-6 relative pb-16">
						<p className="text-sm text-white mb-6">AI Daily Summary</p>

						{dailyMemories.length > 0 ? (
							dailyMemories.map((mem) => (
								<div key={mem.id} className="flex gap-4 mb-6">
									<div className="size-10 rounded-full bg-teal-900/40 flex items-center justify-center shrink-0 border border-teal-500/20">
										<CheckCircle className="size-5 text-[#00E5FF]" />
									</div>
									<div>
										<h3 className="text-sm font-medium text-white mb-1">{mem.sessionTitle ?? "Summary"}</h3>
										<p className="text-xs text-zinc-500">{mem.content.slice(0, 150)}</p>
									</div>
								</div>
							))
						) : (
							<p className="text-xs text-zinc-500">No summaries yet. Complete a session to generate your first AI summary.</p>
						)}

						{/* Command Bar Overlay */}
						<div className="absolute bottom-[-18px] left-1/2 -translate-x-1/2 w-[85%] max-w-lg bg-[#1A1A1A] border border-white/10 rounded-full py-2.5 px-4 flex items-center shadow-2xl">
							<div className="size-7 rounded-full bg-[#00E5FF]/20 flex items-center justify-center mr-3">
								<Terminal className="size-3.5 text-[#00E5FF]" />
							</div>
							<input
								type="text"
								value={chatInput}
								onChange={(e) => setChatInput(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") handleChatSubmit();
								}}
								placeholder="Ask Memora OS anything..."
								className="bg-transparent border-none outline-none text-sm text-white flex-1 placeholder:text-zinc-600"
							/>
							<div className="flex items-center gap-2">
								<div className="size-7 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 text-xs font-mono">⌘K</div>
								<div 
									onClick={handleChatSubmit}
									className="size-7 rounded-full bg-[#00E5FF] flex items-center justify-center text-black cursor-pointer hover:bg-[#00E5FF]/90 transition"
								>
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
										<line x1="22" y1="2" x2="11" y2="13"></line>
										<polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
									</svg>
								</div>
							</div>
						</div>
					</div>

					<div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* 4. Context Stack */}
						<div className="rounded-xl border border-white/5 bg-[#141414] p-6 flex flex-col">
							<p className="text-[11px] font-bold text-zinc-500 tracking-widest uppercase mb-4">Context Stack</p>
							<div className="flex flex-col gap-2 mb-6">
								{(ctx?.filesTouched ?? []).length > 0 ? (
									(ctx?.filesTouched ?? []).slice(0, 3).map((file) => (
										<div key={file} className="bg-[#1C1C1C] border border-white/5 rounded-md px-4 py-2.5 flex items-center gap-3">
											<AlignLeft className="size-4 text-zinc-500" />
											<span className="text-sm text-zinc-300">{file}</span>
										</div>
									))
								) : (
									<p className="text-xs text-zinc-500">No files tracked yet.</p>
								)}
							</div>
							<div className="mt-auto bg-[#1C1C1C] border border-white/5 rounded-md p-4 flex flex-col gap-1">
								<div className="flex items-center gap-2 text-xs text-white">
									<GitBranch className="size-3.5 text-[#00E5FF]" /> Branch: main
								</div>
								<div className="text-[11px] text-zinc-500 pl-5">{ctx?.sessionTitle ?? "Task"}</div>
							</div>
						</div>

						{/* 5. AI Insights */}
						<div className="rounded-xl border border-white/5 bg-[#141414] p-6 flex flex-col">
							<p className="text-[11px] font-bold text-zinc-500 tracking-widest uppercase mb-4">AI Insights</p>
							{insights.length > 0 ? (
								insights.map((insight) => (
									<div key={insight.id} className="bg-[#1A2326] border border-[#00E5FF]/10 rounded-md p-4 mb-6">
										<p className="text-sm text-[#00E5FF] font-medium">{insight.content.slice(0, 120)}</p>
									</div>
								))
							) : (
								<div className="bg-[#1A2326] border border-[#00E5FF]/10 rounded-md p-4 mb-6">
									<p className="text-sm text-zinc-500">No insights yet. Work more to generate AI patterns.</p>
								</div>
							)}
							<div className="bg-[#1C1C1C] border border-white/5 rounded-md p-4 mb-6">
								<div className="flex justify-between items-end mb-2 text-xs">
									<span className="text-zinc-400">Productivity</span>
									<span className="text-[#00E5FF] font-semibold">{streak?.streak ?? 0} day streak</span>
								</div>
								<div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
									<div className="h-full bg-[#00E5FF] rounded-full" style={{ width: `${Math.min((streak?.streak ?? 0) * 8, 100)}%` }}></div>
								</div>
							</div>
							<div className="mt-auto flex items-center gap-2 text-[10px] text-zinc-500">
								<Info className="size-3" /> Updated in real-time from active session data.
							</div>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* 6. Timeline Preview */}
						<div className="rounded-xl border border-white/5 bg-[#141414] p-6 flex flex-col">
							<div className="flex justify-between items-center mb-6">
								<p className="text-[11px] font-bold text-zinc-500 tracking-widest uppercase">Timeline Preview</p>
								<MoreHorizontal className="size-4 text-zinc-600" />
							</div>
							<div className="flex flex-col gap-6 relative before:absolute before:inset-y-2 before:left-[3px] before:w-px before:bg-white/10">
								{session ? (
									<div className="relative pl-6">
										<div className="absolute left-0 top-1.5 size-2 rounded-full bg-[#00E5FF]" />
										<p className="text-[10px] text-zinc-500 mb-0.5">{new Date(session.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
										<p className="text-sm text-white">{session.title}</p>
									</div>
								) : (
									<div className="relative pl-6">
										<div className="absolute left-0 top-1.5 size-2 rounded-full bg-zinc-600" />
										<p className="text-xs text-zinc-500">No sessions recorded yet.</p>
									</div>
								)}
							</div>
						</div>

						{/* 7. Focus Analytics */}
						<div className="rounded-xl border border-white/5 bg-[#141414] p-6 flex flex-col">
							<div className="flex justify-between items-center mb-6">
								<p className="text-[11px] font-bold text-zinc-500 tracking-widest uppercase">Focus Analytics</p>
								<span className="text-[10px] font-semibold text-[#00E5FF]">
									{streak ? `${streak.changePercent > 0 ? "+" : ""}${streak.changePercent}% vs last month` : ""}
								</span>
							</div>
							<div className="h-20 flex items-end justify-between gap-1.5 mb-4">
								{dailyStats.length > 0
									? dailyStats.slice(-9).map((day, i) => {
										const maxMin = Math.max(...dailyStats.slice(-9).map((d) => d.totalMinutes), 1);
										const height = Math.max((day.totalMinutes / maxMin) * 100, 5);
										return (
											<div
												key={day.date}
												className="w-full rounded-sm"
												style={{ height: `${height}%`, backgroundColor: day.totalMinutes > 0 ? (i === dailyStats.slice(-9).length - 1 ? "#00E5FF" : "#00E5FF/60") : "rgba(255,255,255,0.1)" }}
											/>
										);
									})
									: <p className="text-xs text-zinc-500 flex items-center h-full">No focus data yet.</p>
								}
							</div>
							<div className="flex justify-between mt-auto">
								<div>
									<p className="text-[10px] text-zinc-500 mb-0.5">Peak Focus</p>
									<p className="text-sm text-white font-semibold">
										{streak?.peakFocusHour ? `${streak.peakFocusHour}:00` : "--"}
									</p>
								</div>
								<div className="text-right">
									<p className="text-[10px] text-zinc-500 mb-0.5">Deep Work</p>
									<p className="text-sm text-white font-semibold">
										{streak ? `${(streak.totalMinutes7d / 60).toFixed(1)}h` : "0h"}
									</p>
								</div>
							</div>
						</div>
					</div>
					</>
				)}
			</main>
		</div>
	);
}
