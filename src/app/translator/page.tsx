"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftRight, Copy, Languages, Loader2, RotateCcw, SendHorizonal } from "lucide-react";

type Lang = "ar" | "en";
type Direction = "en-to-ar" | "ar-to-en" | "auto";

const dict = {
  ar: {
    title: "مترجم الطلاب Offline",
    subtitle: "ترجمة إنجليزي ↔ عربي باستخدام Ollama المحلي بدون إنترنت خارجي",
    input: "النص الأصلي",
    output: "الترجمة",
    placeholder: "اكتب النص هنا...",
    translate: "ترجم",
    clear: "مسح",
    copy: "نسخ",
    copied: "تم النسخ",
    direction: "اتجاه الترجمة",
    auto: "تلقائي",
    enToAr: "إنجليزي إلى عربي",
    arToEn: "عربي إلى إنجليزي",
    chat: "الشات",
    admin: "الإدارة",
    note: "الصفحة عامة للطلبة وتعمل محليًا عبر qwen2.5:14b.",
    error: "فشل الترجمة. تأكد من تشغيل Ollama والموديل.",
  },
  en: {
    title: "Offline Student Translator",
    subtitle: "Arabic ↔ English translation using local Ollama without external internet",
    input: "Source text",
    output: "Translation",
    placeholder: "Type text here...",
    translate: "Translate",
    clear: "Clear",
    copy: "Copy",
    copied: "Copied",
    direction: "Translation direction",
    auto: "Auto",
    enToAr: "English to Arabic",
    arToEn: "Arabic to English",
    chat: "Chat",
    admin: "Admin",
    note: "Public student page powered locally by qwen2.5:14b.",
    error: "Translation failed. Make sure Ollama and the model are running.",
  },
};

export default function TranslatorPage() {
  const [lang, setLang] = useState<Lang>(() => (typeof window !== "undefined" && localStorage.getItem("ui_lang") === "en" ? "en" : "ar"));
  const [direction, setDirection] = useState<Direction>("en-to-ar");
  const [source, setSource] = useState("");
  const [translation, setTranslation] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");

  const tr = dict[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";

  const setLanguage = (value: Lang) => {
    setLang(value);
    localStorage.setItem("ui_lang", value);
    document.documentElement.lang = value;
    document.documentElement.dir = value === "ar" ? "rtl" : "ltr";
  };

  const translate = async () => {
    if (!source.trim() || loading) return;
    setLoading(true);
    setNotice("");
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: source, direction }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || tr.error);
      setTranslation(data.translation || "");
    } catch {
      setNotice(tr.error);
    } finally {
      setLoading(false);
    }
  };

  const swap = () => {
    setSource(translation);
    setTranslation(source);
    setDirection(direction === "en-to-ar" ? "ar-to-en" : direction === "ar-to-en" ? "en-to-ar" : "auto");
  };

  const copyTranslation = async () => {
    if (!translation) return;
    await navigator.clipboard.writeText(translation);
    setNotice(tr.copied);
    setTimeout(() => setNotice(""), 1500);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.18),transparent_35%),#020617] text-white" dir={dir}>
      <header className="border-b border-white/10 bg-slate-950/80 p-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold"><Languages className="text-blue-300" /> {tr.title}</h1>
            <p className="mt-1 text-sm text-slate-400">{tr.subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => setLanguage(lang === "ar" ? "en" : "ar")} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10">{lang === "ar" ? "English" : "العربية"}</button>
            <Link href="/chat" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10">{tr.chat}</Link>
            <Link href="/admin" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10">{tr.admin}</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-5 p-4">
        <div className="rounded-3xl border border-blue-400/20 bg-blue-500/10 p-4 text-sm text-blue-100">{tr.note}</div>

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <label className="text-sm font-semibold text-slate-200">{tr.direction}</label>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setDirection("en-to-ar")} className={`rounded-xl px-3 py-2 text-sm ${direction === "en-to-ar" ? "bg-blue-600" : "bg-white/5 hover:bg-white/10"}`}>{tr.enToAr}</button>
              <button onClick={() => setDirection("ar-to-en")} className={`rounded-xl px-3 py-2 text-sm ${direction === "ar-to-en" ? "bg-blue-600" : "bg-white/5 hover:bg-white/10"}`}>{tr.arToEn}</button>
              <button onClick={() => setDirection("auto")} className={`rounded-xl px-3 py-2 text-sm ${direction === "auto" ? "bg-blue-600" : "bg-white/5 hover:bg-white/10"}`}>{tr.auto}</button>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr]">
            <div>
              <div className="mb-2 flex items-center justify-between"><h2 className="font-bold">{tr.input}</h2><button onClick={() => { setSource(""); setTranslation(""); }} className="text-xs text-slate-400 hover:text-white"><RotateCcw className="inline h-3.5 w-3.5" /> {tr.clear}</button></div>
              <textarea value={source} onChange={(e) => setSource(e.target.value)} placeholder={tr.placeholder} className="min-h-[360px] w-full resize-y rounded-3xl border border-white/10 bg-slate-950/80 p-4 leading-8 text-white outline-none focus:border-blue-400/50" />
            </div>

            <div className="flex items-center justify-center">
              <button onClick={swap} disabled={!translation && !source} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-slate-300 transition hover:bg-white/10 disabled:opacity-40" title="Swap"><ArrowLeftRight className="h-5 w-5" /></button>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between"><h2 className="font-bold">{tr.output}</h2><button onClick={copyTranslation} className="text-xs text-slate-400 hover:text-white"><Copy className="inline h-3.5 w-3.5" /> {tr.copy}</button></div>
              <textarea value={translation} readOnly placeholder={tr.output} className="min-h-[360px] w-full resize-y rounded-3xl border border-white/10 bg-slate-950/80 p-4 leading-8 text-white outline-none" />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <button onClick={translate} disabled={loading || !source.trim()} className="rounded-2xl bg-blue-600 px-6 py-3 font-semibold shadow-lg shadow-blue-950/30 transition hover:bg-blue-500 disabled:opacity-50">
              {loading ? <Loader2 className="inline h-5 w-5 animate-spin" /> : <SendHorizonal className="inline h-5 w-5" />} {tr.translate}
            </button>
            {notice && <p className="text-sm text-slate-300">{notice}</p>}
          </div>
        </section>
      </main>
    </div>
  );
}
