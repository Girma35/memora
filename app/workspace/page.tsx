"use client";

import { useEffect, useState } from "react";
import {
	Target,
	Pause,
	AlertTriangle,
	Clock,
	Code2,
	FileText,
	Search,
	Bot,
	Circle,
	Zap,
	Command,
	Loader2,
	Play,
} from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { NavBar } from "@/components/nav-bar";
import { Button } from "@/components/ui/button";

interface ContinuationData {
	hasActiveSession: boolean;
	sessionTitle: string;
	project: string | null;
	elapsedMinutes: number;
	pausePoint: string | null;
	blockers: Array<{ id: number; type: string; description: string; metadata?: Record<string, unknown> }>;
	filesTouched: string[];
	recentContext: Array<{ id: number; type: string; description: string }>;
	nextSteps: string[];
}

export default function WorkspacePage() {
	const [ctx, setCtx] = useState<ContinuationData | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetch("/api/continuation")
			.then((res) => res.ok ? res.json() : null)
			.then((data) => setCtx(data))
			.catch(() => {})
			.finally(() => setLoading(false));
	}, []);

	const files = ctx?.filesTouched ?? ["auth.ts", "middleware.ts", "session_provider.tsx"];
	const blockers = ctx?.blockers ?? [];
	const steps = ctx?.nextSteps ?? [
		"Verify token refresh logic in production",
		"Test cookie expiration on localhost:3000",
	];
	const minutes = ctx?.elapsedMinutes ?? 52;
	const displayTime = `${Math.floor(minutes / 60).toString().padStart(2, "0")}:${(minutes % 60).toString().padStart(2, "0")}`;

	return (
		<div className="flex flex-col min-h-screen bg-[#111111] text-zinc-300 font-sans">
			<NavBar />

			<div className="flex flex-1 w-full max-w-6xl mx-auto mt-8 px-6 gap-12">
				<AppSidebar />

				<main className="flex-1 pb-24">
					<div className="flex items-center justify-between mb-8">
						<div className="flex items-center gap-3 text-[#00E5FF] font-bold tracking-widest text-xs uppercase">
							<Target className="size-5" />{ctx?.hasActiveSession ? "ACTIVE SESSION" : "WORKSPACE"}
						</div>
						<Button variant="outline" className="rounded-full border-white/10 bg-transparent hover:bg-white/5 text-zinc-300 px-5">
							<Pause className="size-4 mr-2" /> Pause Session
						</Button>
					</div>

					{loading ? (
						<div className="flex items-center justify-center py-32">
							<Loader2 className="size-6 text-[#00E5FF] animate-spin" />
						</div>
					) : (
						<>
						<div className="rounded-2xl border border-white/5 bg-[#141414] p-12 flex flex-col items-center justify-center mb-6 relative overflow-hidden">
							<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#00E5FF]/5 rounded-full blur-3xl pointer-events-none" />

							<div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8 z-10">
								<div className="size-2 rounded-full bg-[#00E5FF]" />
								<span className="text-xs text-zinc-400 font-medium tracking-wide">
									{ctx?.project ?? "Memora"} • {ctx?.sessionTitle ?? "focus"}
								</span>
							</div>

							<h1 className="text-4xl font-bold text-white mb-6 z-10 tracking-tight">
								{ctx?.sessionTitle ?? "Focus Workspace"}
							</h1>

							<div className="text-[120px] font-bold text-white leading-none tracking-tighter mb-4 z-10" style={{ fontVariantNumeric: "tabular-nums" }}>
								{displayTime}
							</div>
							<p className="text-zinc-500 font-medium z-10">Focused Time</p>
						</div>

						<div className="grid grid-cols-2 gap-6 mb-6">
							{/* Identified Blocker */}
							<div className="rounded-2xl border border-red-500/20 bg-[#161212] p-6 relative overflow-hidden">
								<div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500/50" />
								<div className="flex items-center gap-2 text-red-400 font-bold tracking-widest text-[10px] uppercase mb-4">
									<AlertTriangle className="size-4" /> BLOCKER
								</div>
								<p className="text-zinc-300 text-sm leading-relaxed">
									{blockers[0]?.description ?? "No blockers identified"}
								</p>
							</div>

							{/* Memory Tabs & Context */}
							<div className="rounded-2xl border border-white/5 bg-[#141414] p-6">
								<div className="flex items-center gap-2 text-zinc-400 font-bold tracking-widest text-[10px] uppercase mb-5">
									<Clock className="size-4" /> MEMORY CONTEXT
								</div>
								<div className="flex flex-wrap gap-2">
									{files.slice(0, 6).map((file) => (
										<Button key={file} variant="outline" size="sm" className="bg-[#1A1A1A] border-white/5 hover:bg-white/10 hover:border-white/10 text-zinc-300 text-xs font-normal h-8">
											<Code2 className="size-3.5 mr-2 text-[#00E5FF]" /> {file}
										</Button>
									))}
								</div>
							</div>
						</div>

						{/* AI Suggested Next Steps */}
						<div className="rounded-2xl border border-white/5 bg-gradient-to-b from-[#141414] to-[#111111] p-6 pb-12 relative">
							<div className="flex items-center gap-2 text-zinc-400 font-bold tracking-widest text-[10px] uppercase mb-6">
								<Bot className="size-4 text-[#00E5FF]" /> AI SUGGESTED NEXT STEPS
							</div>
							<div className="flex flex-col gap-3 mb-4">
								{steps.map((step, i) => (
									<div key={i} className="flex items-center gap-4 bg-[#1A1A1A] border border-white/5 rounded-xl p-4 cursor-pointer hover:border-white/10 transition-colors">
										<Circle className="size-5 text-zinc-500" />
										<span className="text-zinc-300 text-sm">{step}</span>
									</div>
								))}
							</div>

							{/* Floating Command Bar */}
							<div className="absolute left-1/2 -translate-x-1/2 bottom-[-20px] w-full max-w-lg">
								<div className="absolute inset-0 bg-[#00E5FF]/5 blur-xl rounded-full" />
								<div className="relative flex items-center bg-[#1A1A1A] rounded-2xl border border-white/10 p-2 shadow-2xl h-14">
									<div className="size-10 flex items-center justify-center shrink-0">
										<Zap className="size-5 text-[#00E5FF]" />
									</div>
									<input type="text" placeholder="Ask Memora or press '/' for commands..." className="flex-1 bg-transparent border-none outline-none text-sm text-zinc-300 px-2 placeholder:text-zinc-600 h-full" />
									<div className="flex items-center gap-2 px-3">
										<div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-md px-2 py-1">
											<Command className="size-3 text-zinc-500" />
											<span className="text-[10px] font-mono text-zinc-500">K</span>
										</div>
									</div>
								</div>
							</div>
						</div>
						</>
					)}
				</main>
			</div>
		</div>
	);
}
