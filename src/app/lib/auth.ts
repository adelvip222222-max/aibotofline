import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import sql from "mssql";
import bcrypt from "bcryptjs";
import { getToken } from "next-auth/jwt";




const dbConfig: sql.config = {
  server: process.env.DB_SERVER || "dev",
  database: process.env.DB_NAME || "collegechatdb",
  user: process.env.DB_USER || "sa",
  password: process.env.DB_PASSWORD || "12345",
  port: parseInt(process.env.DB_PORT || "1433"),
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

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

          const pool = await sql.connect(dbConfig);
          const result = await pool
            .request()
            .input("code", sql.NVarChar, credentials.studentCode as string)
            .query("SELECT * FROM Users WHERE StudentCode = @code AND IsActive = 1");

          await pool.close();

          const user = result.recordset[0];

          if (!user) {
            throw new Error("كود الطالب غير موجود");
          }

          if (user.LockedUntil && new Date(user.LockedUntil) > new Date()) {
            throw new Error("تم حظر الحساب مؤقتاً");
          }

          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.PasswordHash
          );

          if (!isValid) {
            throw new Error("كلمة المرور غير صحيحة");
          }

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
  
  trustHost: true,
  
};

export async function verifyToken(request: NextRequest) {
  const token = await getToken({ 
    request, 
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  if (!token) {
    throw new Error("غير مصرح");
  }
  
  return token;
}