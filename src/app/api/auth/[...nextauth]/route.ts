// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/app/lib/auth"

// ✅ هذا ملف API route (Server Side فقط)
// دالة NextAuth تُرجع كائنًا (handler) يحتوي على منطق الـ GET والـ POST
const handler = NextAuth(authOptions);

// في TypeScript، لا نحتاج لتحديد الأنواع هنا بشكل صريح لأن Next.js و NextAuth يتعاملان مع ذلك تلقائيًا
export { handler as GET, handler as POST };