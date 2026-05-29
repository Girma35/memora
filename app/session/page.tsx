"use client";

import { useEffect, useState } from "react";
import { Activity, GitMerge, Lightbulb, FileText, Coffee, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavBar } from "@/components/nav-bar";
import { AppSidebar } from "@/components/app-sidebar";

interface TimelineEvent {
	type: string;
	id: number;
	sessionId: number;
	sessionTitle: string;
	title: string;
	description: string;
	timestamp: string;
	duration?: string;
	focusScore?: number;
}

export default function SessionPage() {
	const [events, setEvents] = useState<TimelineEvent[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetch("/api/timeline")
			.then((res) => res.ok ? res.json() : [])
			.then((data) => setEvents(data))
			.catch(() => {})
			.finally(() => setLoading(false));
	}, []);

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

					{loading ? (
						<div className="flex items-center justify-center py-20">
							<Loader2 className="size-6 text-[#00E5FF] animate-spin" />
						</div>
					) : (
						<div className="relative border-l border-white/5 ml-3 pl-8 flex flex-col gap-8">
							{events.length === 0 && (
								<>
									<div className="relative group">
										<div className="absolute -left-[37px] top-4 size-3 rounded-full bg-[#00E5FF] ring-4 ring-[#111111]" />
										<div className="rounded-xl border border-white/5 bg-[#161616] p-6 hover:border-white/10 transition-colors">
											<div className="flex justify-between items-start mb-6">
												<div>
													<h2 className="text-xl font-medium text-white mb-1">Deep Work: Authentication Refactor</h2>
													<p className="text-xs text-zinc-500">Today • 09:00 AM - 11:30 AM (2h 30m)</p>
												</div>
												<div className="text-right">
													<p className="text-2xl font-bold text-[#00E5FF] tracking-tight">94%</p>
													<p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">Focus</p>
												</div>
											</div>
											<div className="rounded-lg bg-black/40 border border-white/5 p-4 flex gap-4">
												<Activity className="size-5 text-[#00E5FF] shrink-0 mt-0.5" />
												<p className="text-sm text-zinc-300 leading-relaxed">Resolved complex state hydration issues in the SSR pipeline.</p>
											</div>
										</div>
									</div>
									<div className="relative">
										<div className="absolute -left-[35px] top-5 size-2 rounded-full bg-zinc-600 ring-4 ring-[#111111]" />
										<div className="rounded-lg border border-white/5 bg-[#161616] p-4 flex items-center justify-between hover:border-white/10 transition-colors">
											<div className="flex items-center gap-3">
												<GitMerge className="size-4 text-zinc-400" />
												<span className="text-sm text-white font-medium">feat(auth): implement refresh rotation</span>
												<span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-zinc-400 border border-white/5">main</span>
											</div>
											<span className="text-xs text-zinc-500">11:15 AM</span>
										</div>
									</div>
									<div className="relative">
										<div className="absolute -left-[35px] top-6 size-2 rounded-full bg-[#00E5FF] ring-4 ring-[#111111]" />
										<div className="rounded-lg border border-[#00E5FF]/20 bg-[#161616] p-5 hover:border-[#00E5FF]/40 transition-colors">
											<div className="flex justify-between items-center mb-3">
												<div className="flex items-center gap-2 text-[#00E5FF] text-sm font-medium">
													<Lightbulb className="size-4" /> AI Insight
												</div>
												<span className="text-xs text-zinc-500">10:42 AM</span>
											</div>
											<p className="text-sm text-zinc-300 leading-relaxed">You solved a recurring hydration bug by moving the token check strictly into the server-side middleware logic.</p>
										</div>
									</div>
									<div className="relative">
										<div className="absolute -left-[35px] top-5 size-2 rounded-full bg-zinc-600 ring-4 ring-[#111111]" />
										<div className="rounded-lg border border-white/5 bg-[#161616] p-4 hover:border-white/10 transition-colors">
											<p className="text-sm text-zinc-300 mb-3">Files Modified <span className="text-zinc-500 text-xs ml-1">(09:15 AM - 10:30 AM)</span></p>
											<div className="flex gap-2">
												<div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-black/40 border border-white/5 text-xs text-zinc-300">
													<FileText className="size-3.5 text-zinc-400" /> middleware.ts
												</div>
												<div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-black/40 border border-white/5 text-xs text-zinc-300">
													<FileText className="size-3.5 text-zinc-400" /> auth.utils.ts
												</div>
											</div>
										</div>
									</div>
									<div className="relative">
										<div className="absolute -left-[35px] top-1.5 size-2 rounded-full bg-zinc-600 ring-4 ring-[#111111]" />
										<div className="flex items-center gap-2 text-xs text-zinc-500 font-medium py-1">
											<Coffee className="size-3.5" /> 30m Break • 11:30 AM - 12:00 PM
										</div>
									</div>
								</>
							)}

							{events.map((event) => (
								<div key={`${event.type}-${event.id}`} className="relative group">
									<div className={`absolute -left-[35px] top-4 size-2.5 rounded-full ring-4 ring-[#111111] ${
										event.type === "session" ? "bg-[#00E5FF]" :
										event.type === "memory" ? "bg-[#00E5FF]" :
										"bg-zinc-600"
									}`} />

									{event.type === "session" && (
										<div className="rounded-xl border border-white/5 bg-[#161616] p-6 hover:border-white/10 transition-colors">
											<div className="flex justify-between items-start mb-6">
												<div>
													<h2 className="text-xl font-medium text-white mb-1">{event.title}</h2>
													<p className="text-xs text-zinc-500">
														{new Date(event.timestamp).toLocaleDateString()} • {new Date(event.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
														{event.duration ? ` (${event.duration})` : ""}
													</p>
												</div>
												{event.focusScore && (
													<div className="text-right">
														<p className="text-2xl font-bold text-[#00E5FF] tracking-tight">{event.focusScore}%</p>
														<p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">Focus</p>
													</div>
												)}
											</div>
											<div className="rounded-lg bg-black/40 border border-white/5 p-4 flex gap-4">
												<Activity className="size-5 text-[#00E5FF] shrink-0 mt-0.5" />
												<p className="text-sm text-zinc-300 leading-relaxed">{event.description}</p>
											</div>
										</div>
									)}

									{event.type === "activity" && (
										<div className="rounded-lg border border-white/5 bg-[#161616] p-4 flex items-center justify-between hover:border-white/10 transition-colors">
											<div className="flex items-center gap-3">
												{event.title === "Commit" ? <GitMerge className="size-4 text-zinc-400" /> :
												 event.title === "File Edit" ? <FileText className="size-4 text-zinc-400" /> :
												 <Activity className="size-4 text-zinc-400" />}
												<span className="text-sm text-white font-medium">{event.title}</span>
												<span className="text-xs text-zinc-400 ml-2">{event.description}</span>
											</div>
											<span className="text-xs text-zinc-500">{new Date(event.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
										</div>
									)}

									{event.type === "memory" && (
										<div className="rounded-lg border border-[#00E5FF]/20 bg-[#161616] p-5 hover:border-[#00E5FF]/40 transition-colors">
											<div className="flex justify-between items-center mb-3">
												<div className="flex items-center gap-2 text-[#00E5FF] text-sm font-medium">
													<Lightbulb className="size-4" /> {event.title}
												</div>
												<span className="text-xs text-zinc-500">{new Date(event.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
											</div>
											<p className="text-sm text-zinc-300 leading-relaxed">{event.description}</p>
										</div>
									)}
								</div>
							))}
						</div>
					)}
				</main>
			</div>
		</div>
	);
}
