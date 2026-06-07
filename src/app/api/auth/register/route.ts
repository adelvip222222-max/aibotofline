import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "../../../lib/db";
import bcrypt from "bcryptjs";
import sql from "mssql";

export async function POST(req: NextRequest) {
  try {
    const { studentCode, fullName, group, password, email } = await req.json();

    if (!studentCode || !fullName || !group || !password) {
      return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
    }

    if (studentCode.length !== 5 || !/^\d+$/.test(studentCode)) {
      return NextResponse.json({ error: "كود الطالب يجب أن يكون 5 أرقام" }, { status: 400 });
    }

    const pool = await connectToDB();

    // استخدام استعلام بسيط للتحقق
    const checkResult = await pool
      .request()
      .input("code", sql.NVarChar, studentCode)
      .query("SELECT * FROM Users WHERE StudentCode = @code");

    if (checkResult.recordset.length > 0) {
      return NextResponse.json({ error: "كود الطالب موجود بالفعل" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await pool
      .request()
      .input("code", sql.NVarChar, studentCode)
      .input("name", sql.NVarChar, fullName)
      .input("grp", sql.NVarChar, group)
      .input("pass", sql.NVarChar, passwordHash)
      .input("mail", sql.NVarChar, email || null)
      .query(`
        INSERT INTO Users (StudentCode, FullName, UserGroup, PasswordHash, Email)
        VALUES (@code, @name, @grp, @pass, @mail)
      `);

    return NextResponse.json({ success: true, message: "تم إنشاء الحساب بنجاح" }, { status: 201 });
  } catch (error: any) {
    console.error("Register error:", error.message);
    return NextResponse.json({ 
      error: "حدث خطأ في السيرفر", 
      details: error.message 
    }, { status: 500 });
  }
}