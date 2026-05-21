import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!baseUrl) {
    return NextResponse.json(
      { error: "Missing NEXT_PUBLIC_SITE_URL" },
      { status: 500 },
    );
  }

  const response = await fetch(
    `${baseUrl}/api/sync-matches?secret=${process.env.IMPORT_SECRET}`,
    { method: "POST" },
  );

  const data = await response.json();

  return NextResponse.json({
    success: true,
    syncResult: data,
  });
}
