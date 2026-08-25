import { NextResponse } from "next/server";
import { APP_GIT_SHA, APP_VERSION } from "@/lib/version";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    version: APP_VERSION,
    commit: APP_GIT_SHA,
  });
}
