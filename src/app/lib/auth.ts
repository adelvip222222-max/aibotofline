import type { AuthOptions } from "next-auth";
import type { NextRequest } from "next/server";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import sql from "mssql";
import { getToken } from "next-auth/jwt";
import { connectToDB } from "./db";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "College Login",
      credentials: {
        studentCode: { label: "كود الطالب", type: "text" },
        password: { label: "كلمة المرور", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.studentCode || !credentials?.password) {
            throw new Error("الرجاء إدخال كود الطالب وكلمة المرور");
          }

          const pool = await connectToDB();
          const result = await pool
            .request()
            .input("code", sql.NVarChar, credentials.studentCode as string)
            .query("SELECT * FROM Users WHERE StudentCode = @code AND IsActive = 1");

          const user = result.recordset[0];
          if (!user) throw new Error("كود الطالب غير موجود");

          if (user.LockedUntil && new Date(user.LockedUntil) > new Date()) {
            throw new Error("تم حظر الحساب مؤقتاً");
          }

          const isValid = await bcrypt.compare(credentials.password as string, user.PasswordHash);
          if (!isValid) throw new Error("كلمة المرور غير صحيحة");

          console.log(`✅ ${user.FullName} دخل`);

          return {
            id: user.StudentCode,
            studentCode: user.StudentCode,
            name: user.FullName,
            email: user.Email || "",
            role: user.Role || "student",
            group: user.UserGroup,
          };
        } catch (err: any) {
          console.error("Auth error:", err.message);
          throw new Error(err.message);
        }
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/", error: "/" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.studentId = user.studentCode;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.group = user.group;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user = {
          ...session.user,
          id: token.sub || "",
          studentId: token.studentId as string,
          name: token.name as string,
          email: token.email as string,
          role: token.role as string,
          group: token.group as string,
        };
      }
      return session;
    },
  },
};

export async function verifyToken(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token) throw new Error("غير مصرح");
  return token;
}
