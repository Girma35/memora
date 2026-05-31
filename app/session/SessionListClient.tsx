"use client";

import { Activity, GitMerge, Lightbulb, FileText } from "lucide-react";

export interface TimelineEvent {
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

interface SessionListClientProps {
	initialEvents: TimelineEvent[];
}

export function SessionListClient({ initialEvents }: SessionListClientProps) {
	const events = initialEvents ?? [];

	return (
		<div className="relative border-l border-white/5 ml-3 pl-8 flex flex-col gap-8">
			{events.length === 0 ? (
				<div className="rounded-lg border border-white/5 bg-[#161616] p-4 text-sm text-zinc-500">
					No session activity yet.
				</div>
			) : (
				events.map((event) => (
					<div key={`${event.type}-${event.id}`} className="relative group">
						<div
							className={`absolute -left-[35px] top-4 size-2.5 rounded-full ring-4 ring-[#111111] ${
								event.type === "session"
									? "bg-[#00E5FF]"
									: event.type === "memory"
										? "bg-[#00E5FF]"
										: "bg-zinc-600"
							}`}
						/>

						{event.type === "session" && (
							<div className="rounded-xl border border-white/5 bg-[#161616] p-6 hover:border-white/10 transition-colors">
								<div className="flex justify-between items-start mb-6">
									<div>
										<h2 className="text-xl font-medium text-white mb-1">{event.title}</h2>
										<p className="text-xs text-zinc-500">
											{new Date(event.timestamp).toLocaleDateString()} •{" "}
											{new Date(event.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
											{event.duration ? ` (${event.duration})` : ""}
										</p>
									</div>
									{event.focusScore !== undefined && event.focusScore !== null && (
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
									{event.title === "Commit" ? (
										<GitMerge className="size-4 text-zinc-400" />
									) : event.title === "File Edit" ? (
										<FileText className="size-4 text-zinc-400" />
									) : (
										<Activity className="size-4 text-zinc-400" />
									)}
									<span className="text-sm text-white font-medium">{event.title}</span>
									<span className="text-xs text-zinc-400 ml-2">{event.description}</span>
								</div>
								<span className="text-xs text-zinc-500">
									{new Date(event.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
								</span>
							</div>
						)}

						{event.type === "memory" && (
							<div className="rounded-lg border border-[#00E5FF]/20 bg-[#161616] p-5 hover:border-[#00E5FF]/40 transition-colors">
								<div className="flex justify-between items-center mb-3">
									<div className="flex items-center gap-2 text-[#00E5FF] text-sm font-medium">
										<Lightbulb className="size-4" /> {event.title}
									</div>
									<span className="text-xs text-zinc-500">
										{new Date(event.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
									</span>
								</div>
								<p className="text-sm text-zinc-300 leading-relaxed">{event.description}</p>
							</div>
						)}
					</div>
				))
			)}
		</div>
	);
}
