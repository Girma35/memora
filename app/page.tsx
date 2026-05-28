import Link from "next/link";
import { 
  Bell, 
  Settings, 
  LayoutGrid, 
  History, 
  MessageSquare,
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
  Command
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WorkspacePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#111111] text-zinc-300 font-sans">
      {/* Top Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#121212]">
        <div className="flex items-center gap-2">
          <Link href="/" className="font-bold text-2xl tracking-tight text-white hover:opacity-80 transition">
            Memora
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <Button className="bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-black font-semibold rounded-full px-5">
            Quick Capture
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 text-zinc-400 hover:text-white">
            <Bell />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 text-zinc-400 hover:text-white">
            <Settings />
          </Button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 w-full max-w-6xl mx-auto mt-8 px-6 gap-12">
        
        {/* Sidebar */}
        <aside className="w-48 shrink-0 flex flex-col gap-1">
          <Button variant="ghost" asChild className="w-full justify-start gap-3 px-4 py-6 rounded-lg text-sm text-[#00E5FF] bg-white/5 hover:bg-white/10 relative font-medium">
            <Link href="/">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-[#00E5FF] rounded-r-full" />
              <LayoutGrid className="size-4" /> Workspace
            </Link>
          </Button>
          <Button variant="ghost" asChild className="w-full justify-start gap-3 px-4 py-6 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/5">
            <Link href="/session">
              <History className="size-4" /> Memory
            </Link>
          </Button>
          <Button variant="ghost" asChild className="w-full justify-start gap-3 px-4 py-6 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/5">
            <Link href="/ai-chat">
              <MessageSquare className="size-4" /> AI Chat
            </Link>
          </Button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 pb-24">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3 text-[#00E5FF] font-bold tracking-widest text-xs uppercase">
              <Target className="size-5" /> DEEP WORK SESSION
            </div>
            <Button variant="outline" className="rounded-full border-white/10 bg-transparent hover:bg-white/5 text-zinc-300 px-5">
              <Pause className="size-4 mr-2" /> Pause Session
            </Button>
          </div>

          {/* Large Timer Card */}
          <div className="rounded-2xl border border-white/5 bg-[#141414] p-12 flex flex-col items-center justify-center mb-6 relative overflow-hidden">
            {/* Subtle glow effect behind timer */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#00E5FF]/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8 z-10">
              <div className="size-2 rounded-full bg-[#00E5FF]" />
              <span className="text-xs text-zinc-400 font-medium tracking-wide">Memora • feat/auth-refresh</span>
            </div>

            <h1 className="text-4xl font-bold text-white mb-6 z-10 tracking-tight">Authentication Refactor</h1>
            
            <div className="text-[120px] font-bold text-white leading-none tracking-tighter mb-4 z-10" style={{ fontVariantNumeric: 'tabular-nums' }}>
              52:14
            </div>
            
            <p className="text-zinc-500 font-medium z-10">Focused Time</p>
          </div>

          {/* Middle Grid */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Identified Blocker */}
            <div className="rounded-2xl border border-red-500/20 bg-[#161212] p-6 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500/50" />
              <div className="flex items-center gap-2 text-red-400 font-bold tracking-widest text-[10px] uppercase mb-4">
                <AlertTriangle className="size-4" /> IDENTIFIED BLOCKER
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed">
                Session persistence failing on mobile browser instances.
              </p>
            </div>

            {/* Memory Tabs & Context */}
            <div className="rounded-2xl border border-white/5 bg-[#141414] p-6">
              <div className="flex items-center gap-2 text-zinc-400 font-bold tracking-widest text-[10px] uppercase mb-5">
                <Clock className="size-4" /> MEMORY TABS & CONTEXT
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="bg-[#1A1A1A] border-white/5 hover:bg-white/10 hover:border-white/10 text-zinc-300 text-xs font-normal h-8">
                  <Code2 className="size-3.5 mr-2 text-[#00E5FF]" /> auth.ts
                </Button>
                <Button variant="outline" size="sm" className="bg-[#1A1A1A] border-white/5 hover:bg-white/10 hover:border-white/10 text-zinc-300 text-xs font-normal h-8">
                  <Code2 className="size-3.5 mr-2 text-[#00E5FF]" /> middleware.ts
                </Button>
                <Button variant="outline" size="sm" className="bg-[#1A1A1A] border-white/5 hover:bg-white/10 hover:border-white/10 text-zinc-300 text-xs font-normal h-8">
                  <FileText className="size-3.5 mr-2 text-zinc-400" /> Next.js Middleware Docs
                </Button>
                <Button variant="outline" size="sm" className="bg-[#1A1A1A] border-white/5 hover:bg-white/10 hover:border-white/10 text-zinc-300 text-xs font-normal h-8">
                  <Search className="size-3.5 mr-2 text-zinc-400" /> JWT vs Session cookie research
                </Button>
              </div>
            </div>
          </div>

          {/* AI Suggested Next Steps */}
          <div className="rounded-2xl border border-white/5 bg-gradient-to-b from-[#141414] to-[#111111] p-6 pb-12 relative">
            <div className="flex items-center gap-2 text-zinc-400 font-bold tracking-widest text-[10px] uppercase mb-6">
              <Bot className="size-4 text-[#00E5FF]" /> AI SUGGESTED NEXT STEPS
            </div>
            
            <div className="flex flex-col gap-3 mb-4">
              <div className="flex items-center gap-4 bg-[#1A1A1A] border border-white/5 rounded-xl p-4 cursor-pointer hover:border-white/10 transition-colors">
                <Circle className="size-5 text-zinc-500" />
                <span className="text-zinc-300 text-sm">Verify token refresh logic in production</span>
              </div>
              <div className="flex items-center gap-4 bg-[#1A1A1A] border border-white/5 rounded-xl p-4 cursor-pointer hover:border-white/10 transition-colors">
                <Circle className="size-5 text-zinc-500" />
                <span className="text-zinc-300 text-sm">Test cookie expiration on localhost:3000</span>
              </div>
            </div>

            {/* Floating Command Bar inside the card */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-[-20px] w-full max-w-lg">
              <div className="absolute inset-0 bg-[#00E5FF]/5 blur-xl rounded-full" />
              <div className="relative flex items-center bg-[#1A1A1A] rounded-2xl border border-white/10 p-2 shadow-2xl h-14">
                <div className="size-10 flex items-center justify-center shrink-0">
                  <Zap className="size-5 text-[#00E5FF]" />
                </div>
                <input 
                  type="text" 
                  placeholder="Ask Memora or press '/' for commands..." 
                  className="flex-1 bg-transparent border-none outline-none text-sm text-zinc-300 px-2 placeholder:text-zinc-600 h-full"
                />
                <div className="flex items-center gap-2 px-3">
                  <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-md px-2 py-1">
                    <Command className="size-3 text-zinc-500" />
                    <span className="text-[10px] font-mono text-zinc-500">K</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
