@echo off
chcp 65001 >nul
title تشغيل مشروع المساعد الذكي

echo.
echo ╔══════════════════════════════════════════╗
echo ║     🚀 نظام المساعد الذكي للطلاب        ║
echo ║     الكلية الجوية - إندونيسيا           ║
echo ╚══════════════════════════════════════════╝
echo.

:: =============================================
:: 1. التحقق من تشغيل Ollama
:: =============================================
echo [1/3] جاري التحقق من خدمة Ollama...
echo.

set OLLAMA_RUNNING=0

:: محاولة الاتصال بـ Ollama
curl -s http://127.0.0.1:11434/api/tags >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ خدمة Ollama تعمل بالفعل على http://127.0.0.1:11434
    set OLLAMA_RUNNING=1
    goto :check_models
)

:: لو مش شغال، نحاول نشغلها
echo ⚠️  خدمة Ollama غير نشطة. جاري تشغيلها...

:: البحث عن Ollama في المسارات المعروفة
set OLLAMA_PATH=

:: المسار الافتراضي
if exist "%LOCALAPPDATA%\Programs\Ollama\ollama.exe" (
    set OLLAMA_PATH=%LOCALAPPDATA%\Programs\Ollama\ollama.exe
)

:: مسار Program Files
if exist "C:\Program Files\Ollama\ollama.exe" (
    set OLLAMA_PATH=C:\Program Files\Ollama\ollama.exe
)

:: محاولة استخدام الأمر مباشرة لو موجود في PATH
where ollama >nul 2>&1
if %errorlevel% equ 0 (
    set OLLAMA_PATH=ollama
)

if "%OLLAMA_PATH%"=="" (
    echo ❌ خطأ: لم يتم العثور على Ollama على جهازك!
    echo.
    echo 📥 حمل Ollama من: https://ollama.com/download
    echo.
    pause
    exit /b 1
)

:: تشغيل Ollama
echo 🔄 جاري تشغيل Ollama...
start "" "%OLLAMA_PATH%" serve

:: انتظار 5 ثواني عشان Ollama يشتغل
echo ⏳ انتظار 5 ثواني لتشغيل الخدمة...
timeout /t 5 /nobreak >nul

:: التأكد مرة تانية
curl -s http://127.0.0.1:11434/api/tags >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ تم تشغيل خدمة Ollama بنجاح!
    set OLLAMA_RUNNING=1
) else (
    echo ❌ فشل تشغيل Ollama تلقائياً.
    echo.
    echo 🖐️  افتح نافذة جديدة واكتب: ollama serve
    echo ثم أعد تشغيل هذا السكريبت.
    echo.
    pause
    exit /b 1
)

:: =============================================
:: 2. التحقق من وجود النماذج
:: =============================================
:check_models
echo.
echo [2/3] التحقق من النماذج المتاحة...
echo.

:: جلب قائمة النماذج
curl -s http://127.0.0.1:11434/api/tags > "%TEMP%\ollama_tags.txt" 2>&1

:: التحقق من وجود موديل llama3
findstr /i "llama3" "%TEMP%\ollama_tags.txt" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ النموذج llama3 موجود.
) else (
    echo ⚠️  النموذج llama3 غير موجود.
    echo 📥 جاري تحميل النموذج...
    echo.
    ollama pull llama3
    if %errorlevel% neq 0 (
        echo ❌ فشل تحميل النموذج. تأكد من اتصال الإنترنت.
    ) else (
        echo ✅ تم تحميل النموذج llama3 بنجاح!
    )
)

:: تنظيف
del "%TEMP%\ollama_tags.txt" >nul 2>&1

:: =============================================
:: 3. تشغيل مشروع Next.js
:: =============================================
echo.
echo [3/3] جاري تشغيل تطبيق Next.js...
echo.

:: التأكد من تثبيت الحزم
if not exist "node_modules\" (
    echo 📦 تثبيت حزم npm...
    call npm install
    echo.
)

:: تنظيف الكاش لو حابب
if exist ".next\" (
    choice /c YN /m "هل تريد تنظيف كاش Next.js"
    if !errorlevel! equ 2 goto :skip_clean
    echo 🧹 جاري تنظيف الكاش...
    rmdir /s /q ".next" >nul 2>&1
)
:skip_clean

echo.
echo ╔══════════════════════════════════════════╗
echo ║  ✅ تم تشغيل كل الخدمات بنجاح!         ║
echo ║  🌐 http://localhost:3000               ║
echo ║  🔒 http://localhost:3000 (Chat)        ║
echo ║  🤖 Ollama: http://127.0.0.1:11434     ║
echo ╚══════════════════════════════════════════╝
echo.
echo 🟢 الخدمات النشطة:
echo    • Ollama Server
echo    • Next.js Development Server
echo.
echo 📋 بيانات الدخول التجريبية:
echo    • كود الطالب: 12345
echo    • كلمة المرور: 123456
echo.
echo ⚠️  لا تغلق هذه النافذة أثناء استخدام التطبيق!
echo.

:: فتح المتصفح تلقائياً
start http://localhost:3000

:: تشغيل Next.js
call npm run dev

:: لو Next.js اتقفل، نقفل Ollama كمان
echo.
echo 🛑 تم إيقاف Next.js.
echo.
choice /c YN /m "هل تريد إيقاف خدمة Ollama أيضاً"
if errorlevel 2 goto :end
taskkill /f /im ollama.exe >nul 2>&1
echo ✅ تم إيقاف جميع الخدمات.

:end
echo.
echo 👋 مع السلامة!
pause