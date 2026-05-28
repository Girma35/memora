"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Bell,
  Settings,
  LayoutGrid,
  History,
  MessageSquare,
  Code2,
  Globe,
  Terminal,
  Github,
  MessageCircle,
  X,
  Check,
  ChevronRight,
  Wifi,
  WifiOff,
  RefreshCw,
  Zap,
  Shield,
  Clock,
  Plug,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavBar } from "@/components/nav-bar";

type IntegrationStatus = "connected" | "active" | "disconnected";

interface Integration {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  status: IntegrationStatus;
  statusLabel: string;
  actionLabel: string;
  actionVariant: "primary" | "outline" | "install";
  lastSync?: string;
  version?: string;
  requiresAuth?: boolean;
  requiresCli?: boolean;
  icon: React.ReactNode;
  configFields?: { label: string; placeholder: string; value: string }[];
}

const initialIntegrations: Integration[] = [
  {
    id: "ide",
    name: "IDE Workspace",
    subtitle: "VS Code, JetBrains",
    description: "Monitoring active workspace, syntax state, and local file changes.",
    status: "connected",
    statusLabel: "Connected",
    actionLabel: "Configure",
    actionVariant: "outline",
    lastSync: "Just now",
    icon: <Code2 className="size-5 text-zinc-300" />,
    configFields: [
      { label: "Workspace Path", placeholder: "/home/user/projects", value: "/home/ake/Desktop/project" },
      { label: "Sync Interval (seconds)", placeholder: "30", value: "30" },
      { label: "File Extensions", placeholder: "ts, tsx, js, jsx", value: "ts, tsx, js, jsx, css" },
    ],
  },
  {
    id: "github",
    name: "GitHub",
    subtitle: "Repositories & PRs",
    description: "Track commits, pull requests, and branch activity automatically.",
    status: "disconnected",
    statusLabel: "Disconnected",
    actionLabel: "Connect",
    actionVariant: "primary",
    requiresAuth: true,
    icon: <Github className="size-5 text-zinc-300" />,
    configFields: [
      { label: "GitHub Username", placeholder: "your-username", value: "" },
      { label: "Personal Access Token", placeholder: "ghp_xxxxxxxxxxxx", value: "" },
      { label: "Default Repository", placeholder: "username/repo", value: "" },
    ],
  },
  {
    id: "browser",
    name: "Browser",
    subtitle: "Chrome, Arc",
    description: "Captures web research, active tabs, and reading list contexts.",
    status: "active",
    statusLabel: "Active",
    actionLabel: "Configure",
    actionVariant: "outline",
    version: "v2.1.4 running",
    icon: <Globe className="size-5 text-zinc-300" />,
    configFields: [
      { label: "Capture Mode", placeholder: "tabs, history, bookmarks", value: "tabs, history" },
      { label: "Excluded Domains", placeholder: "mail.google.com, ...", value: "mail.google.com, bank.com" },
      { label: "Max Tabs Tracked", placeholder: "20", value: "20" },
    ],
  },
  {
    id: "terminal",
    name: "Terminal",
    subtitle: "Zsh, Bash",
    description: "Track shell history, executed commands, and environment state.",
    status: "disconnected",
    statusLabel: "Disconnected",
    actionLabel: "Install",
    actionVariant: "install",
    requiresCli: true,
    icon: <Terminal className="size-5 text-zinc-300" />,
    configFields: [
      { label: "Shell Type", placeholder: "zsh / bash", value: "" },
      { label: "History File Path", placeholder: "~/.zsh_history", value: "" },
      { label: "Capture Environment Vars", placeholder: "true / false", value: "false" },
    ],
  },
];

function StatusBadge({ status, label }: { status: IntegrationStatus; label: string }) {
  const styles = {
    connected: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    active: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    disconnected: "bg-zinc-700/30 text-zinc-400 border-zinc-700/40",
  };
  const dots = {
    connected: "bg-emerald-400",
    active: "bg-sky-400 animate-pulse",
    disconnected: "bg-zinc-600",
  };
  return (
    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${styles[status]}`}>
      <span className={`size-1.5 rounded-full ${dots[status]}`} />
      {label}
    </span>
  );
}

interface ConfigModalProps {
  integration: Integration;
  onClose: () => void;
  onSave: (id: string, fields: { label: string; placeholder: string; value: string }[]) => void;
}

function ConfigModal({ integration, onClose, onSave }: ConfigModalProps) {
  const [fields, setFields] = useState(integration.configFields ?? []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-[#181818] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              {integration.icon}
            </div>
            <div>
              <h2 className="text-white font-semibold">{integration.name}</h2>
              <p className="text-xs text-zinc-500">{integration.subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition p-1 rounded-lg hover:bg-white/5">
            <X className="size-4" />
          </button>
        </div>

        <div className="flex flex-col gap-4 mb-6">
          {fields.map((field, i) => (
            <div key={field.label}>
              <label className="block text-xs text-zinc-400 mb-1.5 font-medium">{field.label}</label>
              <input
                type={field.label.toLowerCase().includes("token") ? "password" : "text"}
                value={field.value}
                placeholder={field.placeholder}
                onChange={(e) => {
                  const updated = [...fields];
                  updated[i] = { ...updated[i], value: e.target.value };
                  setFields(updated);
                }}
                className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-zinc-300 placeholder:text-zinc-600 outline-none focus:border-[#00E5FF]/50 focus:ring-1 focus:ring-[#00E5FF]/20 transition"
              />
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 border-white/10 bg-transparent hover:bg-white/5 text-zinc-300"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-black font-semibold"
            onClick={() => {
              onSave(integration.id, fields);
              onClose();
            }}
          >
            <Check className="size-4 mr-1.5" /> Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [integrations, setIntegrations] = useState(initialIntegrations);
  const [configuring, setConfiguring] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAction = (id: string) => {
    const integration = integrations.find((i) => i.id === id);
    if (!integration) return;

    if (integration.status === "disconnected") {
      if (integration.configFields?.some((f) => f.value === "")) {
        setConfiguring(id);
        return;
      }
      setIntegrations((prev) =>
        prev.map((i) =>
          i.id === id
            ? { ...i, status: "connected" as IntegrationStatus, statusLabel: "Connected", actionLabel: "Configure", actionVariant: "outline", lastSync: "Just now", requiresAuth: false, requiresCli: false }
            : i
        )
      );
      showToast(`${integration.name} connected successfully`);
    } else {
      setConfiguring(id);
    }
  };

  const handleDisconnect = (id: string) => {
    const integration = integrations.find((i) => i.id === id);
    if (!integration) return;
    setIntegrations((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, status: "disconnected" as IntegrationStatus, statusLabel: "Disconnected", actionLabel: i.requiresCli ? "Install" : "Connect", actionVariant: i.requiresCli ? "install" : "primary", lastSync: undefined }
          : i
      )
    );
    showToast(`${integration.name} disconnected`);
  };

  const handleSync = (id: string) => {
    setSyncing(id);
    setTimeout(() => {
      setSyncing(null);
      setIntegrations((prev) =>
        prev.map((i) => (i.id === id ? { ...i, lastSync: "Just now" } : i))
      );
      showToast("Sync complete");
    }, 1500);
  };

  const handleSaveConfig = (id: string, fields: { label: string; placeholder: string; value: string }[]) => {
    setIntegrations((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const isConnecting = i.status === "disconnected";
        return {
          ...i,
          configFields: fields,
          ...(isConnecting && {
            status: "connected" as IntegrationStatus,
            statusLabel: "Connected",
            actionLabel: "Configure",
            actionVariant: "outline" as const,
            lastSync: "Just now",
            requiresAuth: false,
            requiresCli: false,
          }),
        };
      })
    );
    showToast("Configuration saved");
  };

  const configuringIntegration = integrations.find((i) => i.id === configuring);

  return (
    <div className="flex flex-col min-h-screen bg-[#111111] text-zinc-300 font-sans">
      <NavBar />

      <div className="flex flex-1 w-full max-w-6xl mx-auto mt-8 px-6 gap-12 pb-16">
        {/* Sidebar */}
        <aside className="w-48 shrink-0 flex flex-col gap-1">
          <Button variant="ghost" asChild className="w-full justify-start gap-3 px-4 py-6 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/5">
            <Link href="/workspace">
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
          <Button variant="ghost" asChild className="w-full justify-start gap-3 px-4 py-6 rounded-lg text-sm text-[#00E5FF] bg-white/5 hover:bg-white/10 relative font-medium">
            <Link href="/settings">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-[#00E5FF] rounded-r-full" />
              <Settings className="size-4" /> Settings
            </Link>
          </Button>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-[#00E5FF] text-xs font-bold tracking-widest uppercase mb-2">
              <Plug className="size-4" /> Integrations
            </div>
            <h1 className="text-3xl font-semibold text-white tracking-tight mb-1">
              Settings & Integrations
            </h1>
            <p className="text-zinc-500 text-sm">
              Connect your tools to power Memora&apos;s memory engine.
            </p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Connected", value: integrations.filter((i) => i.status !== "disconnected").length, icon: <Wifi className="size-4 text-emerald-400" />, color: "text-emerald-400" },
              { label: "Disconnected", value: integrations.filter((i) => i.status === "disconnected").length, icon: <WifiOff className="size-4 text-zinc-500" />, color: "text-zinc-400" },
              { label: "Total Sources", value: integrations.length + 1, icon: <Zap className="size-4 text-[#00E5FF]" />, color: "text-[#00E5FF]" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-white/5 bg-[#141414] p-4 flex items-center gap-4">
                <div className="size-10 rounded-lg bg-white/5 flex items-center justify-center">{stat.icon}</div>
                <div>
                  <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-zinc-500">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Integration Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {integrations.map((integration) => (
              <div
                key={integration.id}
                className="rounded-2xl border border-white/5 bg-[#141414] p-6 flex flex-col gap-4 hover:border-white/10 transition-colors group"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-11 rounded-xl bg-[#1C1C1C] border border-white/5 flex items-center justify-center group-hover:border-white/10 transition-colors">
                      {integration.icon}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-sm">{integration.name}</h3>
                      <p className="text-xs text-zinc-500">{integration.subtitle}</p>
                    </div>
                  </div>
                  <StatusBadge status={integration.status} label={integration.statusLabel} />
                </div>

                {/* Description */}
                <p className="text-zinc-400 text-sm leading-relaxed">{integration.description}</p>

                {/* Footer */}
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
                  <div className="text-xs text-zinc-600">
                    {integration.lastSync && (
                      <span className="flex items-center gap-1.5">
                        <Clock className="size-3" /> Last sync: {integration.lastSync}
                      </span>
                    )}
                    {integration.version && (
                      <span className="flex items-center gap-1.5">
                        <Shield className="size-3" /> {integration.version}
                      </span>
                    )}
                    {integration.requiresAuth && <span className="text-amber-500/80">Requires Auth</span>}
                    {integration.requiresCli && <span className="text-amber-500/80">CLI Tool required</span>}
                    {!integration.lastSync && !integration.version && !integration.requiresAuth && !integration.requiresCli && (
                      <span className="text-zinc-700">—</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Sync button for connected */}
                    {integration.status !== "disconnected" && (
                      <button
                        onClick={() => handleSync(integration.id)}
                        className="size-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition"
                        title="Sync now"
                      >
                        <RefreshCw className={`size-3.5 ${syncing === integration.id ? "animate-spin text-[#00E5FF]" : ""}`} />
                      </button>
                    )}
                    {/* Disconnect for connected */}
                    {integration.status !== "disconnected" && (
                      <button
                        onClick={() => handleDisconnect(integration.id)}
                        className="size-8 rounded-lg bg-white/5 hover:bg-red-500/10 hover:border-red-500/20 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-red-400 transition"
                        title="Disconnect"
                      >
                        <X className="size-3.5" />
                      </button>
                    )}
                    {/* Main action button */}
                    <Button
                      size="sm"
                      onClick={() => handleAction(integration.id)}
                      className={
                        integration.actionVariant === "primary"
                          ? "bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-black font-semibold px-4"
                          : integration.actionVariant === "install"
                          ? "bg-transparent border border-white/10 hover:bg-white/5 text-zinc-300 px-4"
                          : "bg-transparent border border-white/10 hover:bg-white/5 text-zinc-300 px-4"
                      }
                      variant={integration.actionVariant === "primary" ? "default" : "outline"}
                    >
                      {integration.actionLabel}
                      <ChevronRight className="size-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Coming Soon — Slack */}
          <div className="rounded-2xl border border-dashed border-white/10 bg-[#141414]/50 p-10 flex flex-col items-center justify-center text-center">
            <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
              <MessageCircle className="size-6 text-zinc-500" />
            </div>
            <h3 className="text-white font-semibold mb-1">Slack & Communication</h3>
            <p className="text-zinc-500 text-sm max-w-sm mb-5">
              Upcoming integration to index conversations and track async decisions across your team&apos;s channels.
            </p>
            <span className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-zinc-500 font-medium">
              Coming Soon
            </span>
          </div>
        </main>
      </div>

      {/* Configure Modal */}
      {configuringIntegration && (
        <ConfigModal
          integration={configuringIntegration}
          onClose={() => setConfiguring(null)}
          onSave={handleSaveConfig}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#1A1A1A] border border-white/10 text-white text-sm px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Check className="size-4 text-[#00E5FF]" />
          {toast}
        </div>
      )}
    </div>
  );
}
