"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, LogIn, UserPlus, GraduationCap } from "lucide-react";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Login fields
  const [studentCode, setStudentCode] = useState("");
  const [password, setPassword] = useState("");

  // Register fields
  const [fullName, setFullName] = useState("");
  const [group, setGroup] = useState("");
  const [regCode, setRegCode] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [email, setEmail] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        studentCode,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        window.location.href = "/chat";
      }
    } catch (err) {
      setError("حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!regCode || !fullName || !group || !regPassword) {
      setError("جميع الحقول مطلوبة");
      return;
    }

    if (regCode.length !== 5 || !/^\d+$/.test(regCode)) {
      setError("كود الطالب يجب أن يكون 5 أرقام");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentCode: regCode,
          fullName,
          group,
          password: regPassword,
          email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
      } else {
        setStudentCode(regCode);
        setPassword(regPassword);
        setMode("login");
        setError("");
        alert("تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.");
      }
    } catch (err) {
      setError("حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" dir="rtl">
      {/* Left Side - Login/Register Form (25%) */}
      <div className="w-full lg:w-1/4 flex items-center justify-center p-4 bg-gray-950 border-l border-gray-800">
        <div className="w-full max-w-sm space-y-5">
          {/* Logo and Title */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">
              {mode === "login" ? "تسجيل الدخول" : "إنشاء حساب"}
            </h1>
            <p className="text-gray-500 text-xs">
              {mode === "login"
                ? "أدخل بياناتك للوصول إلى المساعد الذكي"
                : "أنشئ حسابك للاستفادة من المساعد الذكي"}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-red-400 text-xs text-center">
              {error}
            </div>
          )}

          {/* Login Form */}
          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">كود الطالب</label>
                <input
                  type="text"
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  placeholder="12345"
                  maxLength={5}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">كلمة المرور</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg py-2.5 text-sm font-medium hover:from-blue-500 hover:to-purple-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                {loading ? "جاري..." : "تسجيل الدخول"}
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-2.5">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">كود الطالب</label>
                <input
                  type="text"
                  value={regCode}
                  onChange={(e) => setRegCode(e.target.value)}
                  placeholder="12345"
                  maxLength={5}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">الاسم الكامل</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="أحمد محمد علي"
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">السرب</label>
                <input
                  type="text"
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                  placeholder="المجموعة الأولى"
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">كلمة المرور</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">البريد (اختياري)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg py-2.5 text-sm font-medium hover:from-green-500 hover:to-emerald-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                {loading ? "جاري..." : "إنشاء حساب"}
              </button>
            </form>
          )}

          <a
            href="/translator"
            className="block w-full rounded-lg border border-blue-400/20 bg-blue-500/10 py-2.5 text-center text-xs font-medium text-blue-200 transition hover:bg-blue-500/20"
          >
            مترجم الطلاب Offline / Student Translator
          </a>

          {/* Toggle Mode */}
          <div className="text-center">
            <button
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError("");
              }}
              className="text-xs text-gray-500 hover:text-blue-400 transition-colors"
            >
              {mode === "login" ? "ليس لديك حساب؟ أنشئ حساباً" : "لديك حساب؟ سجل دخولك"}
            </button>
          </div>
        </div>
      </div>

      {/* Right Side - Background Image (75%) */}
      <div className="hidden lg:block lg:w-3/4 relative">
        <img
          src="/login-bg.png"
          alt="Login Background"
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-gray-950/30 to-gray-950/80" />
        
        {/* Text Overlay */}
        <div className="absolute bottom-10 right-10 text-white space-y-3 text-right z-10">
          <h2 className="text-4xl font-bold tracking-wide">الكلية الجوية</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-4"></div>
          <p className="text-lg opacity-60 mt-2">نظام المساعد الذكي للطلاب</p>
        </div>
      </div>
    </div>
  );
}