"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Activity, Ban, CheckCircle2, KeyRound, Languages, RefreshCw, Search, Shield, UsersRound } from "lucide-react";

type Lang = "ar" | "en";

type AdminUser = {
  id: number;
  studentCode: string;
  fullName: string;
  email: string;
  group: string;
  role: string;
  isActive: boolean;
  createdAt?: string;
  lastLogin?: string;
  lockedUntil?: string;
  totalMessages: number;
  totalSessions: number;
  lastMessageAt?: string;
};

const t = {
  ar: {
    title: "لوحة الإدارة",
    subtitle: "إدارة المستخدمين، الصلاحيات، وتعطيل أو تفعيل الحسابات",
    users: "المستخدمون",
    active: "النشطون",
    disabled: "المعطلون",
    messages24h: "رسائل آخر 24 ساعة",
    search: "ابحث بالاسم أو الرقم أو السرب",
    refresh: "تحديث",
    chat: "الشات",
    developer: "المطور",
    translator: "المترجم",
    code: "الرقم",
    name: "الاسم",
    group: "السرب/المجموعة",
    role: "الدور",
    status: "الحالة",
    usage: "الاستخدام",
    actions: "الإجراءات",
    online: "مفعل",
    offline: "معطل",
    reset: "تغيير كلمة المرور",
    deactivate: "إلغاء التفعيل",
    activate: "تفعيل",
    passwordPrompt: "اكتب كلمة المرور الجديدة لهذا المستخدم",
    minPassword: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
    done: "تم التنفيذ بنجاح",
    failed: "فشل التنفيذ",
    noUsers: "لا توجد بيانات مستخدمين",
    sessions: "جلسات",
    messages: "رسائل",
  },
  en: {
    title: "Admin Panel",
    subtitle: "Manage users, roles, activation, and password resets",
    users: "Users",
    active: "Active",
    disabled: "Disabled",
    messages24h: "Messages 24h",
    search: "Search by name, code, or group",
    refresh: "Refresh",
    chat: "Chat",
    developer: "Developer",
    translator: "Translator",
    code: "Code",
    name: "Name",
    group: "Group",
    role: "Role",
    status: "Status",
    usage: "Usage",
    actions: "Actions",
    online: "Active",
    offline: "Disabled",
    reset: "Reset password",
    deactivate: "Deactivate",
    activate: "Activate",
    passwordPrompt: "Enter the new password for this user",
    minPassword: "Password must be at least 6 characters",
    done: "Action completed successfully",
    failed: "Action failed",
    noUsers: "No users found",
    sessions: "sessions",
    messages: "messages",
  },
};

function formatDate(value?: string, lang: Lang = "ar") {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(lang === "ar" ? "ar-EG" : "en-US", { dateStyle: "medium", timeStyle: "short" });
}

export default function AdminPage() {
  const [lang, setLang] = useState<Lang>(() => (typeof window !== "undefined" && localStorage.getItem("ui_lang") === "en" ? "en" : "ar"));
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<any>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");

  const tr = t[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";

  const cards = useMemo(
    () => [
      { label: tr.users, value: stats.TotalUsers || 0, icon: UsersRound },
      { label: tr.active, value: stats.ActiveUsers || 0, icon: CheckCircle2 },
      { label: tr.disabled, value: stats.DisabledUsers || 0, icon: Ban },
      { label: tr.messages24h, value: stats.Messages24h || 0, icon: Activity },
    ],
    [stats, tr]
  );

  const setLanguage = (value: Lang) => {
    setLang(value);
    localStorage.setItem("ui_lang", value);
    document.documentElement.lang = value;
    document.documentElement.dir = value === "ar" ? "rtl" : "ltr";
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [overviewRes, usersRes] = await Promise.all([
        fetch("/api/admin/overview", { cache: "no-store" }),
        fetch(`/api/admin/users?search=${encodeURIComponent(search)}`, { cache: "no-store" }),
      ]);
      const overview = await overviewRes.json();
      const usersData = await usersRes.json();
      if (overviewRes.ok) setStats(overview.stats || {});
      if (usersRes.ok) setUsers(usersData.users || []);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(loadData, 250);
    return () => clearTimeout(timer);
  }, [loadData]);

  const updateUser = async (studentCode: string, body: any) => {
    setNotice("");
    const res = await fetch(`/api/admin/users/${encodeURIComponent(studentCode)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      setNotice(tr.failed);
      return;
    }
    setNotice(tr.done);
    await loadData();
  };

  const resetPassword = async (user: AdminUser) => {
    const password = prompt(`${tr.passwordPrompt}: ${user.fullName}`);
    if (!password) return;
    if (password.length < 6) {
      alert(tr.minPassword);
      return;
    }
    await updateUser(user.studentCode, { action: "reset-password", password });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white" dir={dir}>
      <header className="border-b border-white/10 bg-slate-950/90 p-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold"><Shield className="text-blue-300" /> {tr.title}</h1>
            <p className="mt-1 text-sm text-slate-400">{tr.subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => setLanguage(lang === "ar" ? "en" : "ar")} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10">
              <Languages className="inline h-4 w-4" /> {lang === "ar" ? "English" : "العربية"}
            </button>
            <Link href="/chat" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10">{tr.chat}</Link>
            <Link href="/developer" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10">{tr.developer}</Link>
            <Link href="/translator" className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold hover:bg-blue-500">{tr.translator}</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-5 p-4">
        <div className="grid gap-3 md:grid-cols-4">
          {cards.map((card) => (
            <div key={card.label} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <card.icon className="mb-4 h-6 w-6 text-blue-300" />
              <p className="text-sm text-slate-400">{card.label}</p>
              <p className="mt-1 text-3xl font-bold">{card.value}</p>
            </div>
          ))}
        </div>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="relative min-w-64 flex-1">
              <Search className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 ${dir === "rtl" ? "right-3" : "left-3"}`} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={tr.search} className={`w-full rounded-2xl border border-white/10 bg-slate-950 px-10 py-3 text-sm outline-none focus:border-blue-400/50`} />
            </div>
            <button onClick={loadData} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm hover:bg-white/10">
              <RefreshCw className={`inline h-4 w-4 ${loading ? "animate-spin" : ""}`} /> {tr.refresh}
            </button>
          </div>

          {notice && <div className="mb-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{notice}</div>}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-sm">
              <thead className="text-slate-400">
                <tr className="border-b border-white/10">
                  <th className="px-3 py-3 text-start">{tr.code}</th>
                  <th className="px-3 py-3 text-start">{tr.name}</th>
                  <th className="px-3 py-3 text-start">{tr.group}</th>
                  <th className="px-3 py-3 text-start">{tr.role}</th>
                  <th className="px-3 py-3 text-start">{tr.status}</th>
                  <th className="px-3 py-3 text-start">{tr.usage}</th>
                  <th className="px-3 py-3 text-start">Last login</th>
                  <th className="px-3 py-3 text-start">{tr.actions}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.studentCode} className="border-b border-white/[0.06] hover:bg-white/[0.03]">
                    <td className="px-3 py-4 font-mono text-blue-200">{user.studentCode}</td>
                    <td className="px-3 py-4"><div className="font-semibold">{user.fullName}</div><div className="text-xs text-slate-500">{user.email || "—"}</div></td>
                    <td className="px-3 py-4 text-slate-300">{user.group || "—"}</td>
                    <td className="px-3 py-4">
                      <select value={user.role} onChange={(e) => updateUser(user.studentCode, { action: "set-role", role: e.target.value })} className="rounded-xl border border-white/10 bg-slate-900 px-2 py-2 text-xs outline-none">
                        <option value="student">student</option>
                        <option value="admin">admin</option>
                        <option value="developer">developer</option>
                        <option value="owner">owner</option>
                      </select>
                    </td>
                    <td className="px-3 py-4"><span className={`rounded-full px-3 py-1 text-xs ${user.isActive ? "bg-emerald-500/10 text-emerald-300" : "bg-red-500/10 text-red-300"}`}>{user.isActive ? tr.online : tr.offline}</span></td>
                    <td className="px-3 py-4 text-slate-300">{user.totalSessions} {tr.sessions} / {user.totalMessages} {tr.messages}</td>
                    <td className="px-3 py-4 text-xs text-slate-400">{formatDate(user.lastLogin, lang)}</td>
                    <td className="px-3 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => resetPassword(user)} className="rounded-xl border border-blue-400/20 bg-blue-500/10 px-3 py-2 text-xs text-blue-200 hover:bg-blue-500/20"><KeyRound className="inline h-3.5 w-3.5" /> {tr.reset}</button>
                        <button onClick={() => updateUser(user.studentCode, { action: "set-active", isActive: !user.isActive })} className={`rounded-xl border px-3 py-2 text-xs ${user.isActive ? "border-red-400/20 bg-red-500/10 text-red-200 hover:bg-red-500/20" : "border-emerald-400/20 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20"}`}>
                          {user.isActive ? tr.deactivate : tr.activate}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!users.length && <p className="py-10 text-center text-slate-500">{tr.noUsers}</p>}
          </div>
        </section>
      </main>
    </div>
  );
}
