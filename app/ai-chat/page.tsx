"use client";

import { useEffect, useState, useRef } from "react";
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
	Loader2,
	Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavBar } from "@/components/nav-bar";
import { AppSidebar } from "@/components/app-sidebar";

interface MemoryResult {
	id: number;
	type: string;
	title: string;
	content: string;
	relevance: number;
	timestamp: string;
	sessionId?: number;
	metadata?: Record<string, unknown>;
}

interface ChatMessage {
	role: "user" | "assistant";
	content: string;
	timestamp: Date;
	memories?: MemoryResult[];
}

export default function AIChatPage() {
	const [messages, setMessages] = useState<ChatMessage[]>([
		{
			role: "assistant",
			content: "I have access to your complete work history. Ask me anything about your sessions, decisions, bugs, or projects.",
			timestamp: new Date(),
		},
	]);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const [searching, setSearching] = useState(false);
	const [searchResults, setSearchResults] = useState<MemoryResult[]>([]);
	const [contextMemories, setContextMemories] = useState<
		Array<{ id: number; type: string; content: string; sessionTitle: string | null }>
	>([]);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		fetch("/api/memory")
			.then((res) => res.ok ? res.json() : [])
			.then((data) => setContextMemories(data.slice(0, 5)))
			.catch(() => {});
	}, []);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, searchResults]);

	async function handleSearch(query: string) {
		if (!query.trim()) return;
		setSearching(true);
		setInput("");

		setMessages((prev) => [...prev, { role: "user", content: query, timestamp: new Date() }]);

		try {
			const res = await fetch(`/api/memory/search?q=${encodeURIComponent(query)}`);
			if (res.ok) {
				const results: MemoryResult[] = await res.json();
				setSearchResults(results);

				let response = "";
				if (results.length === 0) {
					response = "I couldn't find anything specific matching that query in your memory. Try rephrasing or asking about a different topic.";
				} else {
					response = `I found ${results.length} relevant memory items:\n\n${results.slice(0, 3).map((r) => `**${r.title}**\n${r.content.slice(0, 200)}`).join("\n\n")}`;
				}

				setMessages((prev) => [...prev, { role: "assistant", content: response, timestamp: new Date(), memories: results.slice(0, 3) }]);
			}
		} catch {
			setMessages((prev) => [...prev, { role: "assistant", content: "Search failed. Please try again.", timestamp: new Date() }]);
		} finally {
			setSearching(false);
		}
	}

	function handleKeyDown(e: React.KeyboardEvent) {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSearch(input);
		}
	}

	return (
		<div className="flex flex-col min-h-screen bg-[#111111] text-zinc-300 font-sans overflow-hidden">
			<NavBar />

			<div className="flex flex-1 w-full max-w-[1400px] mx-auto mt-8 px-6 gap-8 h-[calc(100vh-80px)]">
				<AppSidebar />

				<main className="flex-1 flex flex-col relative max-w-3xl border-r border-white/5 pr-8 h-full">
					<div className="flex items-center text-sm text-zinc-400 mb-8 shrink-0">
						<Link href="/" className="hover:text-white transition">Memora</Link>
						<ChevronRight className="size-4 mx-2 text-zinc-600" />
						<span className="text-[#00E5FF]">AI Chat</span>
					</div>

					<div className="flex flex-col gap-6 flex-1 overflow-y-auto pb-40 no-scrollbar">
						{messages.map((msg, i) => (
							<div key={i}>
								{msg.role === "user" ? (
									<div className="flex flex-col items-end">
										<div className="bg-[#2A2A2A] text-white px-6 py-4 rounded-2xl rounded-tr-sm max-w-[80%] border border-white/5">
											<p className="text-sm whitespace-pre-wrap">{msg.content}</p>
										</div>
										<span className="text-[10px] text-zinc-500 mt-2 mr-2">
											{msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
										</span>
									</div>
								) : (
									<div className="flex gap-4 max-w-[85%]">
										<div className="size-8 rounded-full border border-teal-500/30 flex items-center justify-center shrink-0 mt-1 relative">
											<div className="absolute inset-0 bg-[#00E5FF]/10 rounded-full" />
											<MessageSquare className="size-4 text-[#00E5FF]" />
										</div>
										<div className="flex flex-col gap-3 w-full">
											<p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{msg.content}</p>

											{msg.memories && msg.memories.length > 0 && (
												<div className="rounded-xl bg-black/40 border border-white/5 overflow-hidden mt-2">
													<div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
														<History className="size-4 text-[#00E5FF]" />
														<span className="text-sm text-white font-medium">Memory References</span>
													</div>
													{msg.memories.map((mem) => (
														<div key={mem.id} className="px-4 py-3 border-b border-white/5 last:border-b-0">
															<p className="text-sm text-white mb-1">{mem.title}</p>
															<div className="flex gap-4 text-xs text-zinc-500">
																<span className="flex items-center gap-1.5">
																	<Clock className="size-3" />
																	{new Date(mem.timestamp).toLocaleDateString()}
																</span>
															</div>
														</div>
													))}
												</div>
											)}
										</div>
									</div>
								)}
							</div>
						))}

						{searching && (
							<div className="flex items-center gap-3 text-zinc-400 text-sm ml-12">
								<Loader2 className="size-4 animate-spin" />
								Searching memory...
							</div>
						)}

						<div ref={messagesEndRef} />
					</div>

					{/* Input Area */}
					<div className="absolute bottom-0 left-0 right-8 pb-8 pt-6 bg-gradient-to-t from-[#111111] via-[#111111] to-transparent">
						<div className="relative flex items-center bg-[#1A1A1A] rounded-full border border-white/10 p-2 shadow-2xl">
							<Button variant="ghost" size="icon" className="size-10 rounded-full text-zinc-400 hover:text-white hover:bg-white/5">
								<Paperclip className="size-5" />
							</Button>
							<input
								type="text"
								value={input}
								onChange={(e) => setInput(e.target.value)}
								onKeyDown={handleKeyDown}
								placeholder="Ask Memora about your memory..."
								className="flex-1 bg-transparent border-none outline-none text-sm text-white px-2 placeholder:text-zinc-500"
								disabled={searching}
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
									onClick={() => handleSearch(input)}
									disabled={searching || !input.trim()}
									className="size-10 rounded-full bg-[#1A2629] hover:bg-[#1A2629]/80 text-[#00E5FF] disabled:opacity-50"
								>
									{searching ? <Loader2 className="size-5 animate-spin" /> : <ArrowUp className="size-5" />}
								</Button>
							</div>
						</div>
						<p className="text-center text-[10px] text-zinc-600 mt-3">
							Memora can make mistakes. Consider verifying critical memory points.
						</p>
					</div>
				</main>

				{/* Right Sidebar - Contextual Memory */}
				<aside className="w-80 shrink-0 flex flex-col gap-8 h-full overflow-y-auto pb-8">
					<div className="flex items-center gap-2 text-white font-medium">
						<Cpu className="size-4 text-zinc-400" /> Contextual Memory
					</div>

					<div className="flex flex-col gap-3">
						<p className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">Recent Memories</p>
						<div className="flex flex-col gap-2">
							{contextMemories.length > 0 ? (
								contextMemories.map((mem) => (
									<div key={mem.id} className="rounded-lg bg-[#161616] border border-white/5 p-4 hover:border-white/10 transition-colors cursor-pointer">
										<p className="text-sm text-zinc-300 mb-1 font-medium">{mem.type}</p>
										<p className="text-xs text-zinc-500 line-clamp-2">{mem.content.slice(0, 100)}</p>
									</div>
								))
							) : (
								<>
								<div className="rounded-lg bg-[#161616] border border-white/5 p-4 hover:border-white/10 transition-colors cursor-pointer">
									<p className="text-sm text-zinc-300 mb-1">Memory Item</p>
									<p className="text-xs text-zinc-500">Your work memories will appear here as you use the app.</p>
								</div>
								</>
							)}
						</div>
					</div>

					{searchResults.length > 0 && (
						<div className="flex flex-col gap-3">
							<p className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">Search Results</p>
							<div className="flex flex-col gap-2">
								{searchResults.slice(0, 3).map((r) => (
									<div key={r.id} className="rounded-lg bg-[#161616] border border-[#00E5FF]/20 p-4">
										<p className="text-sm text-zinc-300 mb-1">{r.title}</p>
										<p className="text-xs text-zinc-500 line-clamp-2">{r.content.slice(0, 80)}</p>
									</div>
								))}
							</div>
						</div>
					)}
				</aside>
			</div>
		</div>
	);
}
