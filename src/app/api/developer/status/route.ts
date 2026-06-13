import { NextRequest, NextResponse } from "next/server";
import os from "os";
import { connectToDB } from "../../../lib/db";
import { requireAdmin } from "../../../lib/admin";
import { OLLAMA_BASE_URL, TEXT_MODEL, VISION_MODEL } from "../../../lib/ai";

async function checkOllama() {
  const startedAt = Date.now();
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, { cache: "no-store", signal: AbortSignal.timeout(4000) });
    const data = await res.json();
    return {
      ok: res.ok,
      latencyMs: Date.now() - startedAt,
      baseUrl: OLLAMA_BASE_URL,
      models: data.models?.map((model: any) => ({ name: model.name, size: model.size, modifiedAt: model.modified_at })) || [],
      textModel: TEXT_MODEL,
      visionModel: VISION_MODEL,
    };
  } catch (error: any) {
    return { ok: false, latencyMs: Date.now() - startedAt, baseUrl: OLLAMA_BASE_URL, error: error.message, models: [], textModel: TEXT_MODEL, visionModel: VISION_MODEL };
  }
}

async function checkDatabase() {
  const startedAt = Date.now();
  try {
    const pool = await connectToDB();
    await pool.request().query("SELECT 1 AS ok");
    return { ok: true, latencyMs: Date.now() - startedAt };
  } catch (error: any) {
    return { ok: false, latencyMs: Date.now() - startedAt, error: error.message };
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth.response) return auth.response;

    const [database, ollama] = await Promise.all([checkDatabase(), checkOllama()]);
    const memory = process.memoryUsage();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();

    return NextResponse.json({
      success: true,
      generatedAt: new Date().toISOString(),
      server: {
        platform: os.platform(),
        arch: os.arch(),
        hostname: os.hostname(),
        uptimeSeconds: os.uptime(),
        loadAverage: os.loadavg(),
        cpuCount: os.cpus().length,
        totalMemory: totalMem,
        freeMemory: freeMem,
        usedMemoryPercent: Math.round(((totalMem - freeMem) / totalMem) * 1000) / 10,
      },
      node: {
        version: process.version,
        pid: process.pid,
        env: process.env.NODE_ENV || "development",
        uptimeSeconds: process.uptime(),
        memory,
      },
      services: { database, ollama },
      env: {
        port: process.env.PORT || "3000",
        hostname: process.env.HOSTNAME || "0.0.0.0",
        textModel: TEXT_MODEL,
        visionModel: VISION_MODEL,
      },
    });
  } catch (error: any) {
    console.error("Developer status error:", error);
    return NextResponse.json({ error: "Failed to load developer status", details: error.message }, { status: 500 });
  }
}
