'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import ChatContainer from '@/components/ChatContainer';
import { Menu, X, LogOut, BarChart3, Plus, MessageSquare, Trash2 } from 'lucide-react';

interface Session {
  id: number;
  title: string;
  startedAt: string;
}

interface Message {
  id: number;
  role: string;
  content: string;
  timestamp: string;
}

interface Analytics {
  totalQuestions: number;
  totalSessions: number;
  mostAskedTopic: string;
  averageSessionLength: number;
}

export default function ChatPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // ✅ جديد: حالة تحميل المحادثة المحددة
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // تحميل بيانات المستخدم من جلسة NextAuth
  const user = session?.user ? {
    id: session.user.id || '',
    name: session.user.name || '',
    studentId: session.user.studentId || '',
    department: session.user.department || '',
    role: session.user.role || 'student'
  } : null;

  // جلب الجلسات
  const fetchSessions = useCallback(async () => {
    try {
      setLoadingSessions(true);
      const response = await fetch('/api/history');
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  // جلب الإحصائيات
  const fetchAnalytics = useCallback(async () => {
    try {
      setLoadingAnalytics(true);
      const response = await fetch('/api/analytics');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  // ✅ جديد: جلب رسايل محادثة محددة
// ✅ نسخة جديدة من loadSessionMessages
const loadSessionMessages = async (sessionId: number) => {
  try {
    setLoadingMessages(true);
    setSelectedSessionId(sessionId);
    
    // تأكد من إن id مش undefined
    if (!sessionId || isNaN(sessionId)) {
      console.error('Invalid session ID:', sessionId);
      return;
    }
    
    const response = await fetch(`/api/history/${sessionId}`);
    if (response.ok) {
      const data = await response.json();
      setChatMessages(data.messages || []);
    }
  } catch (error) {
    console.error('Failed to load messages:', error);
  } finally {
    setLoadingMessages(false);
  }
};

  // ✅ جديد: حذف محادثة
const handleDeleteSession = async (sessionId: number, e: React.MouseEvent) => {
  e.stopPropagation();
  
  if (!confirm('هل أنت متأكد من حذف هذه المحادثة؟')) return;
  
  try {
    const response = await fetch(`/api/history?id=${sessionId}`, {
      method: 'DELETE',
    });
    
    if (response.ok) {
      fetchSessions();
      if (selectedSessionId === sessionId) {
        setSelectedSessionId(null);
        setChatMessages([]);
      }
    }
  } catch (error) {
    console.error('Failed to delete session:', error);
  }
};

  // ✅ جديد: بدء محادثة جديدة
  const handleNewChat = () => {
    setSelectedSessionId(null);
    setChatMessages([]);
  };

  // إعادة التوجيه إذا لم يكن المستخدم مسجل الدخول
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  // جلب البيانات عند تحميل الصفحة
  useEffect(() => {
    if (status === 'authenticated') {
      fetchSessions();
      fetchAnalytics();
    }
  }, [status, fetchSessions, fetchAnalytics]);

  // معالج تسجيل الخروج
  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // تنسيق التاريخ
const formatDate = (dateString: string) => {
  try {
    if (!dateString) return '---';
    
    const date = new Date(dateString);
    
    // تأكد من إن التاريخ صالح
    if (isNaN(date.getTime())) {
      return dateString; // لو مش تاريخ، رجعه كما هو
    }
    
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString || '---';
  }
};
  // عرض شاشة تحميل أثناء التحقق من الجلسة
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950" dir="rtl">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
          {/* Left side - Menu button and branding */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">المساعد الذكي</h1>
                <p className="text-xs text-gray-400">نظام المحادثة الذكي</p>
              </div>
            </div>
          </div>

          {/* Center - User info */}
          {user && (
            <div className="hidden sm:flex flex-col items-center">
              <p className="font-semibold text-white">{user.name}</p>
              <p className="text-xs text-gray-400">الرقم العسكرى : {user.studentId}</p>
            </div>
          )}

          {/* Right side - Actions */}
          <div className="flex items-center gap-3">
            {user && (
              <div className="sm:hidden text-right">
                <p className="text-sm font-medium text-white truncate max-w-[120px]">{user.name}</p>
              </div>
            )}
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="flex items-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors text-sm"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* Logout confirmation dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-sm mx-4 shadow-2xl" dir="rtl">
            <h2 className="text-xl font-bold text-white mb-4">تأكيد تسجيل الخروج</h2>
            <p className="text-gray-400 mb-6">هل أنت متأكد من أنك تريد تسجيل الخروج؟</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
              >
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-72 bg-gray-900/50 border-l border-gray-800 overflow-y-auto">
            {/* New Chat button */}
            <div className="p-4 border-b border-gray-800">
              <button
                onClick={handleNewChat}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium"
              >
                <Plus size={20} />
                محادثة جديدة
              </button>
            </div>

            {/* Sessions */}
            <div className="p-4 border-b border-gray-800">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <MessageSquare size={18} />
                سجل المحادثات
              </h3>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {loadingSessions ? (
                  <p className="text-sm text-gray-400 text-center py-4">جاري التحميل...</p>
                ) : sessions.length > 0 ? (
sessions.map((session, index) => (
  <div
    key={session.Id || `session-${index}`}
    className={`w-full text-right rounded-lg transition-colors text-sm group relative ${
      selectedSessionId === session.Id
        ? 'bg-blue-600/20 border border-blue-500/30'
        : 'hover:bg-gray-800'
    }`}
  >
    <button
      onClick={() => loadSessionMessages(session.Id)}
      className="w-full text-right p-2.5"
    >
      <p className="font-medium text-gray-200 truncate pr-6">
        {session.title || 'محادثة بدون عنوان'}
      </p>
      <p className="text-xs text-gray-500 mt-1">
        {formatDate(session.StartedAt)}
      </p>
    </button>
    
    <span
      onClick={(e) => handleDeleteSession(session.Id, e)}
      className="absolute top-2 right-2 p-1 rounded hover:bg-red-500/20 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-10"
      title="حذف المحادثة"
    >
      <Trash2 size={14} />
    </span>
  </div>
))        ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    لا توجد محادثات سابقة
                  </p>
                )}
              </div>
            </div>

            {/* Analytics */}
            <div className="p-4">
              <button
                onClick={() => {
                  setAnalyticsOpen(!analyticsOpen);
                  if (!analyticsOpen && !analytics) fetchAnalytics();
                }}
                className="w-full flex items-center justify-between font-semibold text-white mb-3"
              >
                <span className="flex items-center gap-2">
                  <BarChart3 size={18} />
                  الإحصائيات
                </span>
                <span className="text-lg">{analyticsOpen ? '−' : '+'}</span>
              </button>

              {analyticsOpen && (
                <div className="space-y-3 text-sm">
                  {loadingAnalytics ? (
                    <p className="text-gray-400 text-center py-2">جاري التحميل...</p>
                  ) : analytics ? (
                    <>
                      <div className="bg-blue-900/20 border border-blue-800/30 p-3 rounded-lg">
                        <p className="text-gray-400 text-xs mb-1">عدد الأسئلة</p>
                        <p className="text-2xl font-bold text-blue-400">
                          {analytics.totalQuestions || 0}
                        </p>
                      </div>
                      <div className="bg-purple-900/20 border border-purple-800/30 p-3 rounded-lg">
                        <p className="text-gray-400 text-xs mb-1">عدد الجلسات</p>
                        <p className="text-2xl font-bold text-purple-400">
                          {analytics.totalSessions || 0}
                        </p>
                      </div>
                      <div className="bg-green-900/20 border border-green-800/30 p-3 rounded-lg">
                        <p className="text-gray-400 text-xs mb-1">متوسط مدة الجلسة</p>
                        <p className="text-lg font-bold text-green-400">
                          {(analytics.averageSessionLength || 0).toFixed(1)} دقيقة
                        </p>
                      </div>
                      {analytics.mostAskedTopic && (
                        <div className="bg-orange-900/20 border border-orange-800/30 p-3 rounded-lg">
                          <p className="text-gray-400 text-xs mb-1">أكثر الموضوعات</p>
                          <p className="font-semibold text-orange-400 line-clamp-2">
                            {analytics.mostAskedTopic}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-500 text-center py-2">
                      لا توجد إحصائيات متاحة
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main chat area */}
        <div className="flex-1 overflow-hidden">
    {selectedSessionId && chatMessages.length > 0 ? (
  <div className="h-full flex flex-col">
    {/* Header للمحادثة المحملة */}
    <div className="bg-gray-900/50 border-b border-gray-800 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={handleNewChat}
          className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors text-gray-400"
          title="عودة للمحادثة الحالية"
        >
          <X size={18} />
        </button>
        <p className="text-sm text-gray-300">
          {sessions.find(s => s.Id === selectedSessionId)?.title || 'محادثة محملة'}
        </p>
      </div>
      <p className="text-xs text-gray-500">
        {chatMessages.length} رسالة
      </p>
    </div>
    
    {/* الرسايل */}
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-3xl mx-auto space-y-4">
        {loadingMessages ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          chatMessages.map((msg, index) => (
            <div
              key={msg.Id || `msg-${index}`}
              className={`flex ${msg.Role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                  msg.Role === 'user'
                    ? 'bg-blue-600/20 border border-blue-500/30 rounded-br-md'
                    : 'bg-gray-800/50 border border-gray-700/50 rounded-bl-md'
                }`}
              >
                <p className="text-gray-100 whitespace-pre-wrap text-sm">{msg.Content}</p>
                <p className="text-xs text-gray-600 mt-1 text-left">
                  {msg.Timestamp ? formatDate(msg.Timestamp) : ''}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
) : (
  /* الشات العادي */
  <ChatContainer />
)}
        </div>
      </div>
    </div>
  );
}