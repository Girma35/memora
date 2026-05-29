import { NavBar } from "@/components/nav-bar";
import {
	Lightbulb,
	ExternalLink,
	FileText,
	AlertCircle,
	Play,
	CheckCircle,
	Cloud,
	Terminal,
	AlignLeft,
	Link as LinkIcon,
	Search,
	GitBranch,
	Info,
	MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
	return (
		<div className="flex flex-col min-h-screen bg-[#0E0E0E] text-zinc-300 font-sans">
			<NavBar />

			<main className="flex-1 w-full max-w-4xl mx-auto px-6 py-10 flex flex-col gap-6">
				{/* 1. Hero Stats Card */}
				<div className="rounded-xl border border-white/5 bg-[#141414] p-8 flex flex-col relative overflow-hidden">
					<div className="flex justify-between items-start mb-4">
						<h1 className="text-3xl font-semibold text-white tracking-tight">
							You worked 4.2h yesterday on{" "}
							<span className="text-[#00E5FF]">Memora</span>
						</h1>
						<div className="flex items-center gap-2 px-3 py-1 bg-[#00E5FF]/10 rounded-full border border-[#00E5FF]/20 text-[#00E5FF] text-[10px] font-bold tracking-wider">
							<div className="size-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
							AI AWARENESS ACTIVE
						</div>
					</div>
					<p className="text-zinc-400 text-sm mb-8">
						Paused while debugging middleware. Your productivity streak is at 12
						days.
					</p>

					{/* Inner suggested step */}
					<div className="bg-[#1C1C1C] rounded-lg border border-white/5 p-4 flex items-center justify-between">
						<div className="flex items-center gap-4">
							<div className="size-10 rounded-full bg-white/5 flex items-center justify-center">
								<Lightbulb className="size-5 text-[#00E5FF]" />
							</div>
							<div>
								<p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-0.5">
									Suggested Next Step
								</p>
								<p className="text-white text-sm">
									Verify token refresh logic in auth.ts
								</p>
							</div>
						</div>
						<Button className="bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-black px-5 font-semibold">
							Quick continue
						</Button>
					</div>
				</div>

				{/* 2. Ongoing Task */}
				<div className="rounded-xl border border-white/5 bg-[#141414] p-6 flex flex-col">
					<div className="flex items-center justify-between mb-4">
						<p className="text-[11px] font-bold text-[#00E5FF] tracking-widest uppercase">
							Ongoing Task
						</p>
						<Button
							variant="ghost"
							size="icon"
							className="size-8 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
						>
							<ExternalLink className="size-4" />
						</Button>
					</div>

					<h2 className="text-lg text-white font-medium mb-3">
						Authentication Refactor
					</h2>

					<div className="flex gap-2 mb-6">
						<div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 border border-white/5 text-xs text-zinc-300">
							<FileText className="size-3.5 text-[#00E5FF]" /> auth.ts
						</div>
						<div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 border border-white/5 text-xs text-zinc-300">
							<FileText className="size-3.5 text-[#00E5FF]" /> middleware.ts
						</div>
					</div>

					<div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
						<div className="flex items-center gap-2 mb-1 text-red-400 font-medium text-sm">
							<AlertCircle className="size-4" /> Blocker identified
						</div>
						<p className="text-xs text-red-200/70 ml-6">
							Session persistence failing on mobile browser instances.
						</p>
					</div>

					<Button
						variant="outline"
						className="w-full bg-white/5 hover:bg-white/10 border-white/10 text-white h-12"
					>
						<Play className="size-4" /> Quick Continue
					</Button>
				</div>

				{/* 3. AI Daily Summary */}
				<div className="rounded-xl border border-white/5 bg-[#141414] p-6 relative pb-16">
					<p className="text-sm text-white mb-6">AI Daily Summary</p>

					<div className="flex gap-4 mb-6">
						<div className="size-10 rounded-full bg-teal-900/40 flex items-center justify-center shrink-0 border border-teal-500/20">
							<CheckCircle className="size-5 text-[#00E5FF]" />
						</div>
						<div>
							<h3 className="text-sm font-medium text-white mb-1">
								Hydration issue fixed
							</h3>
							<p className="text-xs text-zinc-500">
								Resolved the SSR mismatch in the navigation component.
							</p>
						</div>
					</div>

					<div className="flex gap-4 mb-2">
						<div className="size-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
							<Cloud className="size-5 text-[#00E5FF]" />
						</div>
						<div>
							<h3 className="text-sm font-medium text-white mb-1">
								Background synchronization
							</h3>
							<p className="text-xs text-zinc-500">
								Staging branch deployed to testing environment.
							</p>
						</div>
					</div>

					{/* Command Bar Overlay */}
					<div className="absolute bottom-[-18px] left-1/2 -translate-x-1/2 w-[85%] max-w-lg bg-[#1A1A1A] border border-white/10 rounded-full py-2.5 px-4 flex items-center shadow-2xl">
						<div className="size-7 rounded-full bg-[#00E5FF]/20 flex items-center justify-center mr-3">
							<Terminal className="size-3.5 text-[#00E5FF]" />
						</div>
						<input
							type="text"
							placeholder="Ask Memora OS anything..."
							className="bg-transparent border-none outline-none text-sm text-white flex-1 placeholder:text-zinc-600"
						/>
						<div className="flex items-center gap-2">
							<div className="size-7 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 text-xs font-mono">
								⌘K
							</div>
							<div className="size-7 rounded-full bg-[#00E5FF] flex items-center justify-center text-black cursor-pointer hover:bg-[#00E5FF]/90 transition">
								<svg
									width="14"
									height="14"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
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
						<p className="text-[11px] font-bold text-zinc-500 tracking-widest uppercase mb-4">
							Context Stack
						</p>

						<div className="flex flex-col gap-2 mb-6">
							<div className="bg-[#1C1C1C] border border-white/5 rounded-md px-4 py-2.5 flex items-center gap-3">
								<AlignLeft className="size-4 text-zinc-500" />
								<span className="text-sm text-zinc-300">
									Auth flow diagram...
								</span>
							</div>
							<div className="bg-[#1C1C1C] border border-white/5 rounded-md px-4 py-2.5 flex items-center gap-3">
								<LinkIcon className="size-4 text-zinc-500" />
								<span className="text-sm text-zinc-300">
									Next.js middleware docs
								</span>
							</div>
							<div className="bg-[#1C1C1C] border border-white/5 rounded-md px-4 py-2.5 flex items-center gap-3">
								<Search className="size-4 text-zinc-500" />
								<span className="text-sm text-zinc-300">
									JWT vs Session cookie
								</span>
							</div>
						</div>

						<div className="mt-auto bg-[#1C1C1C] border border-white/5 rounded-md p-4 flex flex-col gap-1">
							<div className="flex items-center gap-2 text-xs text-white">
								<GitBranch className="size-3.5 text-[#00E5FF]" /> Branch: main
							</div>
							<div className="text-[11px] text-zinc-500 pl-5">
								Task: refactor-auth
							</div>
						</div>
					</div>

					{/* 5. AI Insights */}
					<div className="rounded-xl border border-white/5 bg-[#141414] p-6 flex flex-col">
						<p className="text-[11px] font-bold text-zinc-500 tracking-widest uppercase mb-4">
							AI Insights
						</p>

						<div className="bg-[#1A2326] border border-[#00E5FF]/10 rounded-md p-4 mb-6">
							<p className="text-sm text-[#00E5FF] font-medium">
								Memory recall high on "hydration" related files today.
							</p>
						</div>

						<div className="bg-[#1C1C1C] border border-white/5 rounded-md p-4 mb-6">
							<div className="flex justify-between items-end mb-2 text-xs">
								<span className="text-zinc-400">Context usage</span>
								<span className="text-[#00E5FF] font-semibold">84%</span>
							</div>
							<div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
								<div
									className="h-full bg-[#00E5FF] rounded-full"
									style={{ width: "84%" }}
								></div>
							</div>
						</div>

						<div className="mt-auto flex items-center gap-2 text-[10px] text-zinc-500">
							<Info className="size-3" /> Updated 5m ago based on your last 200
							commits.
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* 6. Timeline Preview */}
					<div className="rounded-xl border border-white/5 bg-[#141414] p-6 flex flex-col">
						<div className="flex justify-between items-center mb-6">
							<p className="text-[11px] font-bold text-zinc-500 tracking-widest uppercase">
								Timeline Preview
							</p>
							<MoreHorizontal className="size-4 text-zinc-600" />
						</div>

						<div className="flex flex-col gap-6 relative before:absolute before:inset-y-2 before:left-[3px] before:w-px before:bg-white/10">
							<div className="relative pl-6">
								<div className="absolute left-0 top-1.5 size-2 rounded-full bg-[#00E5FF]" />
								<p className="text-[10px] text-zinc-500 mb-0.5">09:30 AM</p>
								<p className="text-sm text-white">Brainstorming Session</p>
							</div>
							<div className="relative pl-6">
								<div className="absolute left-0 top-1.5 size-2 rounded-full bg-zinc-600" />
								<p className="text-[10px] text-zinc-500 mb-0.5">11:00 AM</p>
								<p className="text-sm text-zinc-400">Code Review: PR #42</p>
							</div>
							<div className="relative pl-6">
								<div className="absolute left-0 top-1.5 size-2 rounded-full bg-zinc-600" />
								<p className="text-[10px] text-zinc-500 mb-0.5">02:30 PM</p>
								<p className="text-sm text-zinc-400">Deep Work Session</p>
							</div>
						</div>
					</div>

					{/* 7. Focus Analytics */}
					<div className="rounded-xl border border-white/5 bg-[#141414] p-6 flex flex-col">
						<div className="flex justify-between items-center mb-6">
							<p className="text-[11px] font-bold text-zinc-500 tracking-widest uppercase">
								Focus Analytics
							</p>
							<span className="text-[10px] font-semibold text-[#00E5FF]">
								+12% vs last week
							</span>
						</div>

						<div className="h-20 flex items-end justify-between gap-1.5 mb-4">
							<div className="w-full bg-white/10 rounded-sm h-[30%]"></div>
							<div className="w-full bg-white/20 rounded-sm h-[40%]"></div>
							<div className="w-full bg-white/10 rounded-sm h-[20%]"></div>
							<div className="w-full bg-[#00E5FF] rounded-sm h-[80%] opacity-80"></div>
							<div className="w-full bg-[#00E5FF]/60 rounded-sm h-[60%]"></div>
							<div className="w-full bg-white/10 rounded-sm h-[35%]"></div>
							<div className="w-full bg-[#00E5FF]/80 rounded-sm h-[70%]"></div>
							<div className="w-full bg-white/20 rounded-sm h-[45%]"></div>
							<div className="w-full bg-[#00E5FF] rounded-sm h-[65%]"></div>
						</div>

						<div className="flex justify-between mt-auto">
							<div>
								<p className="text-[10px] text-zinc-500 mb-0.5">Peak Focus</p>
								<p className="text-sm text-white font-semibold">10:15 AM</p>
							</div>
							<div className="text-right">
								<p className="text-[10px] text-zinc-500 mb-0.5">Deep Work</p>
								<p className="text-sm text-white font-semibold">3.5h</p>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
