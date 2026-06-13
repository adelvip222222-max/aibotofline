"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import ChatContainer from "@/components/ChatContainer";
import ChatMessage from "@/components/ui/ChatMessage";
import { Message } from "@/types/chat";
import {
  BarChart3,
  Clock3,
  Languages,
  LogOut,
  Menu,
  MessageSquare,
  MessagesSquare,
  Plus,
  RefreshCcw,
  Shield,
  TerminalSquare,
  Trash2,
  X,
} from "lucide-react";

interface ChatSession {
  id: number;
  title: string;
  modelUsed?: string;
  startedAt?: string;
  lastActivityAt?: string;
}

interface HistoryMessage {
  id: number;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
}

interface Analytics {
  totalQuestions: number;
  totalAnswers?: number;
  totalSessions: number;
  mostAskedTopic: string;
  averageSessionLength: number;
}

export default function ChatPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [historyMessages, setHistoryMessages] = useState<HistoryMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const user = useMemo(
    () =>
      session?.user
        ? {
            id: session.user.id || "",
            name: session.user.name || "",
            studentId: session.user.studentId || "",
            role: session.user.role || "student",
          }
        : null,
    [session]
  );

  const fetchSessions = useCallback(async () => {
    try {
      setLoadingSessions(true);
      const response = await fetch("/api/history", { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoadingAnalytics(true);
      const response = await fetch("/api/analytics", { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      setAnalytics(data.stats || null);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  const refreshSidebarData = useCallback(async () => {
    await Promise.all([fetchSessions(), fetchAnalytics()]);
  }, [fetchAnalytics, fetchSessions]);

  const loadSessionMessages = async (sessionId: number) => {
    if (!sessionId || Number.isNaN(sessionId)) return;

    try {
      setLoadingMessages(true);
      setSelectedSessionId(sessionId);
      const response = await fetch(`/api/history/${sessionId}`, { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      setHistoryMessages(data.messages || []);
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleDeleteSession = async (sessionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("هل أنت متأكد من حذف هذه المحادثة؟")) return;

    try {
      const response = await fetch(`/api/history?id=${sessionId}`, { method: "DELETE" });
      if (response.ok) {
        await refreshSidebarData();
        if (selectedSessionId === sessionId) {
          setSelectedSessionId(null);
          setHistoryMessages([]);
        }
      }
    } catch (error) {
      console.error("Failed to delete session:", error);
    }
  };

  const handleNewChat = () => {
    setSelectedSessionId(null);
    setHistoryMessages([]);
  };

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [router, status]);

  useEffect(() => {
    if (status === "authenticated") refreshSidebarData();
  }, [refreshSidebarData, status]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  const formatDate = (dateString?: string) => {
    try {
      if (!dateString) return "---";
      const date = new Date(dateString);
      if (Number.isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString || "---";
    }
  };

  const selectedSession = sessions.find((item) => item.id === selectedSessionId);
  const normalizedHistoryMessages: Message[] = historyMessages.map((msg) => ({
    id: String(msg.id),
    role: msg.role,
    content: msg.content,
    timestamp: msg.timestamp ? new Date(msg.timestamp).getTime() : Date.now(),
  }));

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white" dir="rtl">
      <header className="border-b border-white/10 bg-slate-950/90 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-gray-300 transition hover:bg-white/10 lg:hidden"
              aria-label="فتح القائمة"
            >
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-950/40">
              <MessagesSquare className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold">لوحة المساعد الذكي</h1>
              <p className="text-xs text-gray-400">محادثات، سجل، وتحليلات في شاشة واحدة</p>
            </div>
          </div>

          {user && (
            <div className="hidden text-center sm:block">
              <p className="font-semibold text-white">{user.name}</p>
              <p className="text-xs text-gray-400">الرقم العسكري: {user.studentId}</p>
            </div>
          )}

          <div className="flex items-center gap-2">
            <a
              href="/translator"
              className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300 transition hover:bg-white/10 md:flex"
              title="المترجم"
            >
              <Languages size={17} />
              <span>المترجم</span>
            </a>
            {user && ["admin", "owner", "developer", "super_admin"].includes(user.role) && (
              <>
                <a
                  href="/admin"
                  className="hidden items-center gap-2 rounded-xl border border-blue-400/20 bg-blue-500/10 px-3 py-2 text-sm text-blue-200 transition hover:bg-blue-500/20 md:flex"
                  title="لوحة الإدارة"
                >
                  <Shield size={17} />
                  <span>الإدارة</span>
                </a>
                <a
                  href="/developer"
                  className="hidden items-center gap-2 rounded-xl border border-violet-400/20 bg-violet-500/10 px-3 py-2 text-sm text-violet-200 transition hover:bg-violet-500/20 md:flex"
                  title="لوحة المطور"
                >
                  <TerminalSquare size={17} />
                  <span>المطور</span>
                </a>
              </>
            )}
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-300 transition hover:bg-red-500/20"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </header>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <h2 className="mb-3 text-xl font-bold">تأكيد تسجيل الخروج</h2>
            <p className="mb-6 text-sm leading-7 text-gray-400">هل أنت متأكد من أنك تريد تسجيل الخروج؟</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="rounded-xl bg-white/10 px-4 py-2 text-gray-200 transition hover:bg-white/15"
              >
                إلغاء
              </button>
              <button onClick={handleLogout} className="rounded-xl bg-red-600 px-4 py-2 text-white transition hover:bg-red-500">
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative flex h-[calc(100vh-4.25rem)] overflow-hidden">
        {sidebarOpen && (
          <aside className="absolute inset-y-0 right-0 z-20 w-80 overflow-y-auto border-l border-white/10 bg-slate-950/95 p-4 backdrop-blur-xl lg:static lg:z-auto">
            <button
              onClick={handleNewChat}
              className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500"
            >
              <Plus size={20} />
              محادثة جديدة
            </button>

            <section className="mb-4 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-bold text-white">
                  <BarChart3 size={18} />
                  التحليلات
                </h3>
                <button
                  onClick={refreshSidebarData}
                  className="rounded-lg p-1.5 text-gray-400 transition hover:bg-white/10 hover:text-blue-300"
                  title="تحديث"
                >
                  <RefreshCcw size={16} />
                </button>
              </div>

              {loadingAnalytics ? (
                <p className="py-4 text-center text-sm text-gray-400">جاري التحميل...</p>
              ) : analytics ? (
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-2xl border border-blue-400/20 bg-blue-500/10 p-3">
                    <p className="text-xs text-gray-400">الأسئلة</p>
                    <p className="text-2xl font-bold text-blue-300">{analytics.totalQuestions || 0}</p>
                  </div>
                  <div className="rounded-2xl border border-violet-400/20 bg-violet-500/10 p-3">
                    <p className="text-xs text-gray-400">الجلسات</p>
                    <p className="text-2xl font-bold text-violet-300">{analytics.totalSessions || 0}</p>
                  </div>
                  <div className="col-span-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-3">
                    <p className="text-xs text-gray-400">متوسط الجلسة</p>
                    <p className="text-lg font-bold text-emerald-300">{(analytics.averageSessionLength || 0).toFixed(1)} دقيقة</p>
                  </div>
                  {analytics.mostAskedTopic && (
                    <div className="col-span-2 rounded-2xl border border-orange-400/20 bg-orange-500/10 p-3">
                      <p className="text-xs text-gray-400">أكثر موضوع</p>
                      <p className="line-clamp-2 text-sm font-semibold text-orange-200">{analytics.mostAskedTopic}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="py-4 text-center text-sm text-gray-500">لا توجد إحصائيات متاحة</p>
              )}
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-bold text-white">
                  <MessageSquare size={18} />
                  سجل المحادثات
                </h3>
                {loadingSessions && <Clock3 className="h-4 w-4 animate-spin text-blue-300" />}
              </div>

              <div className="space-y-2">
                {sessions.length > 0 ? (
                  sessions.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => loadSessionMessages(item.id)}
                      className={`group cursor-pointer rounded-2xl border p-3 transition ${
                        selectedSessionId === item.id
                          ? "border-blue-400/40 bg-blue-500/10"
                          : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.06]"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <button
                          onClick={(e) => handleDeleteSession(item.id, e)}
                          className="rounded-lg p-1 text-gray-600 opacity-0 transition hover:bg-red-500/20 hover:text-red-300 group-hover:opacity-100"
                          title="حذف المحادثة"
                        >
                          <Trash2 size={14} />
                        </button>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-gray-100">{item.title || "محادثة بدون عنوان"}</p>
                          <p className="mt-1 text-xs text-gray-500">{formatDate(item.lastActivityAt || item.startedAt)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : loadingSessions ? (
                  <p className="py-5 text-center text-sm text-gray-400">جاري تحميل السجل...</p>
                ) : (
                  <p className="py-5 text-center text-sm text-gray-500">لا توجد محادثات سابقة</p>
                )}
              </div>
            </section>
          </aside>
        )}

        {sidebarOpen && <button className="fixed inset-0 z-10 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="إغلاق القائمة" />}

        <main className="min-w-0 flex-1 overflow-hidden">
          {selectedSessionId ? (
            <div className="flex h-full flex-col bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.12),transparent_38%),#020617]">
              <div className="border-b border-white/10 bg-slate-950/80 px-4 py-3 backdrop-blur-xl">
                <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <button
                      onClick={handleNewChat}
                      className="rounded-xl border border-white/10 bg-white/5 p-2 text-gray-300 transition hover:bg-white/10"
                      title="رجوع للمحادثة الحالية"
                    >
                      <X size={18} />
                    </button>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-white">{selectedSession?.title || "محادثة محفوظة"}</p>
                      <p className="text-xs text-gray-500">عرض محفوظ — {historyMessages.length} رسالة</p>
                    </div>
                  </div>
                  <button
                    onClick={refreshSidebarData}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300 transition hover:bg-white/10"
                  >
                    تحديث
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-6">
                <div className="mx-auto max-w-4xl divide-y divide-white/[0.04]">
                  {loadingMessages ? (
                    <div className="flex justify-center py-12">
                      <div className="h-9 w-9 animate-spin rounded-full border-b-2 border-t-2 border-blue-500" />
                    </div>
                  ) : normalizedHistoryMessages.length > 0 ? (
                    normalizedHistoryMessages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
                  ) : (
                    <p className="py-12 text-center text-gray-500">لا توجد رسائل في هذه المحادثة</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <ChatContainer onResponseComplete={refreshSidebarData} />
          )}
        </main>
      </div>
    </div>
  );
}
