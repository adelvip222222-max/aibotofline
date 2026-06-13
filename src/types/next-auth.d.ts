import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    studentCode?: string;
    role?: string;
    group?: string;
  }

  interface Session {
    user: {
      id: string;
      studentId?: string;
      name?: string | null;
      email?: string | null;
      role?: string;
      group?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    studentId?: string;
    role?: string;
    group?: string;
  }
}
