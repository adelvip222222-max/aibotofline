import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import sql from "mssql";
import { connectToDB } from "../../../../lib/db";
import { ensureAdminSchema, requireAdmin } from "../../../../lib/admin";

export async function PATCH(request: NextRequest, context: { params: Promise<{ studentCode: string }> }) {
  try {
    const auth = await requireAdmin(request);
    if (auth.response) return auth.response;

    const { studentCode } = await context.params;
    const targetCode = decodeURIComponent(studentCode || "").trim();
    if (!targetCode) return NextResponse.json({ error: "Student code is required" }, { status: 400 });

    const body = await request.json();
    const action = String(body.action || "");
    const pool = await connectToDB();
    await ensureAdminSchema(pool);

    if (action === "reset-password") {
      const password = String(body.password || "");
      if (password.length < 6) return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
      const passwordHash = await bcrypt.hash(password, 10);

      await pool
        .request()
        .input("studentCode", sql.NVarChar, targetCode)
        .input("passwordHash", sql.NVarChar, passwordHash)
        .query("UPDATE Users SET PasswordHash = @passwordHash, LockedUntil = NULL WHERE StudentCode = @studentCode");

      return NextResponse.json({ success: true, message: "Password reset successfully" });
    }

    if (action === "set-active") {
      const isActive = Boolean(body.isActive);
      await pool
        .request()
        .input("studentCode", sql.NVarChar, targetCode)
        .input("isActive", sql.Bit, isActive)
        .query("UPDATE Users SET IsActive = @isActive WHERE StudentCode = @studentCode");

      return NextResponse.json({ success: true, message: isActive ? "User activated" : "User deactivated" });
    }

    if (action === "set-role") {
      const role = String(body.role || "student").toLowerCase();
      const allowedRoles = new Set(["student", "admin", "developer", "owner"]);
      if (!allowedRoles.has(role)) return NextResponse.json({ error: "Invalid role" }, { status: 400 });

      await pool
        .request()
        .input("studentCode", sql.NVarChar, targetCode)
        .input("role", sql.NVarChar, role)
        .query("UPDATE Users SET Role = @role WHERE StudentCode = @studentCode");

      return NextResponse.json({ success: true, message: "Role updated" });
    }

    if (action === "update-profile") {
      await pool
        .request()
        .input("studentCode", sql.NVarChar, targetCode)
        .input("fullName", sql.NVarChar, String(body.fullName || "").trim())
        .input("email", sql.NVarChar, String(body.email || "").trim() || null)
        .input("group", sql.NVarChar, String(body.group || "").trim() || null)
        .query(`
          UPDATE Users
          SET FullName = NULLIF(@fullName, ''), Email = @email, UserGroup = @group
          WHERE StudentCode = @studentCode
        `);

      return NextResponse.json({ success: true, message: "Profile updated" });
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch (error: any) {
    console.error("Admin user PATCH error:", error);
    return NextResponse.json({ error: "Failed to update user", details: error.message }, { status: 500 });
  }
}
