import Link from "next/link";
import {
	MessageSquare,
	Paperclip,
	Mic,
	ArrowUp,
	Cpu,
	FileText,
	Clock,
	ExternalLink,
	ChevronRight,
	History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavBar } from "@/components/nav-bar";
import { AppSidebar } from "@/components/app-sidebar";

export default function AIChatPage() {
	return (
		<div className="flex flex-col min-h-screen bg-[#111111] text-zinc-300 font-sans overflow-hidden">
			<NavBar />

			{/* Main Layout */}
			<div className="flex flex-1 w-full max-w-[1400px] mx-auto mt-8 px-6 gap-8 h-[calc(100vh-80px)]">
				<AppSidebar />

				{/* Chat Content */}
				<main className="flex-1 flex flex-col relative max-w-3xl border-r border-white/5 pr-8 h-full">
					<div className="flex items-center text-sm text-zinc-400 mb-8 shrink-0">
						<Link href="/" className="hover:text-white transition">
							Memora
						</Link>
						<ChevronRight className="size-4 mx-2 text-zinc-600" />
						<span className="text-[#00E5FF]">AI Chat</span>
					</div>

					<div className="flex flex-col gap-8 flex-1 overflow-y-auto pb-32 no-scrollbar">
						{/* Today Badge */}
						<div className="flex justify-center mb-2">
							<span className="bg-white/5 text-zinc-400 text-xs px-4 py-1.5 rounded-full border border-white/5">
								Today
							</span>
						</div>

						{/* User Message */}
						<div className="flex flex-col items-end">
							<div className="bg-[#2A2A2A] text-white px-6 py-4 rounded-2xl rounded-tr-sm max-w-[80%] border border-white/5">
								<p className="text-sm">
									What deployment bug did I solve last week?
								</p>
							</div>
							<span className="text-[10px] text-zinc-500 mt-2 mr-2">
								10:42 AM
							</span>
						</div>

						{/* AI Response */}
						<div className="flex gap-4 max-w-[85%]">
							<div className="size-8 rounded-full border border-teal-500/30 flex items-center justify-center shrink-0 mt-1 relative">
								<div className="absolute inset-0 bg-[#00E5FF]/10 rounded-full" />
								<MessageSquare className="size-4 text-[#00E5FF]" />
							</div>
							<div className="flex flex-col gap-4 w-full">
								<p className="text-sm text-zinc-300 leading-relaxed">
									Based on your Session Timeline, you resolved a critical
									hydration mismatch in{" "}
									<code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">
										auth.ts
									</code>{" "}
									last Thursday.
								</p>
								<p className="text-sm text-zinc-300 leading-relaxed">
									The issue occurred during the initial server-side render where
									the authentication token state did not match the client's
									local storage state, causing a flash of unauthenticated
									content.
								</p>

								{/* AI Nested Card */}
								<div className="rounded-xl bg-black/40 border border-white/5 overflow-hidden mt-2">
									<div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
										<div className="flex items-center gap-2 text-sm text-white font-medium">
											<History className="size-4 text-[#00E5FF]" /> Session
											Timeline Reference
										</div>
										<Button
											variant="ghost"
											size="icon"
											className="size-6 text-zinc-400 hover:text-white"
										>
											<ExternalLink className="size-3" />
										</Button>
									</div>
									<div className="p-4">
										<p className="text-sm text-white mb-2">
											Deployment Hotfix #892
										</p>
										<div className="flex gap-4 text-xs text-zinc-500">
											<span className="flex items-center gap-1.5">
												<Clock className="size-3" /> Oct 12, 14:30
											</span>
											<span className="flex items-center gap-1.5 font-mono">
												{"<>"} auth.ts, _app.tsx
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Input Area */}
					<div className="absolute bottom-0 left-0 right-8 pb-8 pt-6 bg-gradient-to-t from-[#111111] via-[#111111] to-transparent">
						<div className="relative flex items-center bg-[#1A1A1A] rounded-full border border-white/10 p-2 shadow-2xl">
							<Button
								variant="ghost"
								size="icon"
								className="size-10 rounded-full text-zinc-400 hover:text-white hover:bg-white/5"
							>
								<Paperclip className="size-5" />
							</Button>
							<input
								type="text"
								placeholder="Ask Memora about your memory..."
								className="flex-1 bg-transparent border-none outline-none text-sm text-white px-2 placeholder:text-zinc-500"
							/>
							<div className="flex items-center gap-1 pr-1">
								<Button
									variant="ghost"
									size="icon"
									className="size-10 rounded-full text-zinc-400 hover:text-white hover:bg-white/5"
								>
									<Mic className="size-5" />
								</Button>
								<Button
									size="icon"
									className="size-10 rounded-full bg-[#1A2629] hover:bg-[#1A2629]/80 text-[#00E5FF]"
								>
									<ArrowUp className="size-5" />
								</Button>
							</div>
						</div>
						<p className="text-center text-[10px] text-zinc-600 mt-3">
							Memora can make mistakes. Consider verifying critical memory
							points.
						</p>
					</div>
				</main>

				{/* Right Sidebar - Contextual Memory */}
				<aside className="w-80 shrink-0 flex flex-col gap-8 h-full overflow-y-auto pb-8">
					<div className="flex items-center gap-2 text-white font-medium">
						<Cpu className="size-4 text-zinc-400" /> Contextual Memory
					</div>

					<div className="flex flex-col gap-3">
						<p className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">
							Relevant Files
						</p>
						<div className="flex flex-col gap-2">
							<Button
								variant="outline"
								className="w-full justify-start h-auto py-3 bg-[#161616] border-white/5 hover:bg-white/5 hover:border-white/10 text-zinc-300 font-normal"
							>
								<FileText className="size-4 mr-2 text-zinc-500" /> auth.ts
							</Button>
							<Button
								variant="outline"
								className="w-full justify-start h-auto py-3 bg-[#161616] border-white/5 hover:bg-white/5 hover:border-white/10 text-zinc-300 font-normal"
							>
								<FileText className="size-4 mr-2 text-zinc-500" />{" "}
								session_provider.tsx
							</Button>
						</div>
					</div>

					<div className="flex flex-col gap-3">
						<p className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">
							Related Sessions
						</p>
						<div className="flex flex-col gap-2">
							<div className="rounded-lg bg-[#161616] border border-white/5 p-4 hover:border-white/10 transition-colors cursor-pointer">
								<p className="text-sm text-zinc-300 mb-1">
									Auth Hydration Debugging
								</p>
								<p className="text-xs text-zinc-500">Oct 11 • 2.5 hrs</p>
							</div>
							<div className="rounded-lg bg-[#161616] border border-white/5 p-4 hover:border-white/10 transition-colors cursor-pointer">
								<p className="text-sm text-zinc-300 mb-1">
									NextJS Middleware Setup
								</p>
								<p className="text-xs text-zinc-500">Oct 05 • 4 hrs</p>
							</div>
						</div>
					</div>
				</aside>
			</div>
		</div>
	);
}
