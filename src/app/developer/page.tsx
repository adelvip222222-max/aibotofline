"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Cpu, Database, HardDrive, Languages, RefreshCw, Server, TerminalSquare, Zap } from "lucide-react";

type Lang = "ar" | "en";

const dict = {
  ar: {
    title: "لوحة المطور",
    subtitle: "مراقبة الخادم، Node.js، قاعدة البيانات، وOllama",
    admin: "الإدارة",
    chat: "الشات",
    translator: "المترجم",
    refresh: "تحديث",
    server: "الخادم",
    node: "Node.js / PM2",
    database: "قاعدة البيانات",
    ollama: "Ollama",
    models: "الموديلات",
    ok: "يعمل",
    fail: "متعطل",
    uptime: "مدة التشغيل",
    memory: "الذاكرة",
    load: "الحمل",
    processMemory: "ذاكرة العملية",
    latency: "زمن الاستجابة",
  },
  en: {
    title: "Developer Panel",
    subtitle: "Monitor server, Node.js, database, and Ollama services",
    admin: "Admin",
    chat: "Chat",
    translator: "Translator",
    refresh: "Refresh",
    server: "Server",
    node: "Node.js / PM2",
    database: "Database",
    ollama: "Ollama",
    models: "Models",
    ok: "Online",
    fail: "Down",
    uptime: "Uptime",
    memory: "Memory",
    load: "Load",
    processMemory: "Process memory",
    latency: "Latency",
  },
};

function formatBytes(value?: number) {
  if (!value) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = value;
  let index = 0;
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index += 1;
  }
  return `${size.toFixed(index ? 1 : 0)} ${units[index]}`;
}

function formatDuration(seconds?: number, lang: Lang = "ar") {
  const total = Math.max(0, Math.floor(seconds || 0));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  return lang === "ar" ? `${days} يوم ${hours} ساعة ${minutes} دقيقة` : `${days}d ${hours}h ${minutes}m`;
}

function StatusBadge({ ok, lang }: { ok?: boolean; lang: Lang }) {
  const tr = dict[lang];
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ok ? "bg-emerald-500/10 text-emerald-300" : "bg-red-500/10 text-red-300"}`}>{ok ? tr.ok : tr.fail}</span>;
}

export default function DeveloperPage() {
  const [lang, setLang] = useState<Lang>(() => (typeof window !== "undefined" && localStorage.getItem("ui_lang") === "en" ? "en" : "ar"));
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const tr = dict[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";

  const setLanguage = (value: Lang) => {
    setLang(value);
    localStorage.setItem("ui_lang", value);
    document.documentElement.lang = value;
    document.documentElement.dir = value === "ar" ? "rtl" : "ltr";
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/developer/status", { cache: "no-store" });
      const json = await res.json();
      if (res.ok) setData(json);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, [load]);

  const server = data?.server || {};
  const node = data?.node || {};
  const database = data?.services?.database || {};
  const ollama = data?.services?.ollama || {};

  return (
    <div className="min-h-screen bg-slate-950 text-white" dir={dir}>
      <header className="border-b border-white/10 bg-slate-950/90 p-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold"><TerminalSquare className="text-violet-300" /> {tr.title}</h1>
            <p className="mt-1 text-sm text-slate-400">{tr.subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => setLanguage(lang === "ar" ? "en" : "ar")} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"><Languages className="inline h-4 w-4" /> {lang === "ar" ? "English" : "العربية"}</button>
            <button onClick={load} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"><RefreshCw className={`inline h-4 w-4 ${loading ? "animate-spin" : ""}`} /> {tr.refresh}</button>
            <Link href="/admin" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10">{tr.admin}</Link>
            <Link href="/chat" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10">{tr.chat}</Link>
            <Link href="/translator" className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold hover:bg-blue-500">{tr.translator}</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-5 p-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><Server className="text-blue-300" /> {tr.server}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-950/70 p-4"><p className="text-xs text-slate-400">Hostname</p><p className="mt-1 font-semibold">{server.hostname || "—"}</p></div>
              <div className="rounded-2xl bg-slate-950/70 p-4"><p className="text-xs text-slate-400">Platform</p><p className="mt-1 font-semibold">{server.platform || "—"} / {server.arch || "—"}</p></div>
              <div className="rounded-2xl bg-slate-950/70 p-4"><p className="text-xs text-slate-400">{tr.uptime}</p><p className="mt-1 font-semibold">{formatDuration(server.uptimeSeconds, lang)}</p></div>
              <div className="rounded-2xl bg-slate-950/70 p-4"><p className="text-xs text-slate-400">CPU</p><p className="mt-1 font-semibold">{server.cpuCount || 0} cores</p></div>
              <div className="rounded-2xl bg-slate-950/70 p-4"><p className="text-xs text-slate-400">{tr.memory}</p><p className="mt-1 font-semibold">{formatBytes(server.totalMemory - server.freeMemory)} / {formatBytes(server.totalMemory)} ({server.usedMemoryPercent || 0}%)</p></div>
              <div className="rounded-2xl bg-slate-950/70 p-4"><p className="text-xs text-slate-400">{tr.load}</p><p className="mt-1 font-semibold">{(server.loadAverage || []).map((n: number) => n.toFixed(2)).join(" / ") || "—"}</p></div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><Cpu className="text-emerald-300" /> {tr.node}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-950/70 p-4"><p className="text-xs text-slate-400">Version</p><p className="mt-1 font-semibold">{node.version || "—"}</p></div>
              <div className="rounded-2xl bg-slate-950/70 p-4"><p className="text-xs text-slate-400">PID</p><p className="mt-1 font-semibold">{node.pid || "—"}</p></div>
              <div className="rounded-2xl bg-slate-950/70 p-4"><p className="text-xs text-slate-400">{tr.uptime}</p><p className="mt-1 font-semibold">{formatDuration(node.uptimeSeconds, lang)}</p></div>
              <div className="rounded-2xl bg-slate-950/70 p-4"><p className="text-xs text-slate-400">{tr.processMemory}</p><p className="mt-1 font-semibold">RSS {formatBytes(node.memory?.rss)} / Heap {formatBytes(node.memory?.heapUsed)}</p></div>
            </div>
          </section>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <h2 className="mb-4 flex items-center justify-between gap-2 text-lg font-bold"><span className="flex items-center gap-2"><Database className="text-cyan-300" /> {tr.database}</span><StatusBadge ok={database.ok} lang={lang} /></h2>
            <p className="text-sm text-slate-400">{tr.latency}: <span className="font-semibold text-white">{database.latencyMs ?? "—"} ms</span></p>
            {database.error && <p className="mt-3 rounded-2xl bg-red-500/10 p-3 text-sm text-red-200">{database.error}</p>}
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <h2 className="mb-4 flex items-center justify-between gap-2 text-lg font-bold"><span className="flex items-center gap-2"><Zap className="text-yellow-300" /> {tr.ollama}</span><StatusBadge ok={ollama.ok} lang={lang} /></h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-950/70 p-4"><p className="text-xs text-slate-400">Base URL</p><p className="mt-1 break-all font-semibold">{ollama.baseUrl || "—"}</p></div>
              <div className="rounded-2xl bg-slate-950/70 p-4"><p className="text-xs text-slate-400">{tr.latency}</p><p className="mt-1 font-semibold">{ollama.latencyMs ?? "—"} ms</p></div>
              <div className="rounded-2xl bg-slate-950/70 p-4"><p className="text-xs text-slate-400">Text model</p><p className="mt-1 font-semibold">{ollama.textModel || "—"}</p></div>
              <div className="rounded-2xl bg-slate-950/70 p-4"><p className="text-xs text-slate-400">Vision model</p><p className="mt-1 font-semibold">{ollama.visionModel || "—"}</p></div>
            </div>
            {ollama.error && <p className="mt-3 rounded-2xl bg-red-500/10 p-3 text-sm text-red-200">{ollama.error}</p>}
          </section>
        </div>

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><HardDrive className="text-blue-300" /> {tr.models}</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {(ollama.models || []).map((model: any) => (
              <div key={model.name} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                <p className="font-mono font-semibold text-blue-200">{model.name}</p>
                <p className="mt-1 text-xs text-slate-500">{formatBytes(model.size)} · {model.modifiedAt ? new Date(model.modifiedAt).toLocaleString(lang === "ar" ? "ar-EG" : "en-US") : "—"}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
