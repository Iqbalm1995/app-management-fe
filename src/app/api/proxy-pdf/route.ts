import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const encodedUrl = req.nextUrl.searchParams.get("url");
  if (!encodedUrl) {
    return NextResponse.json(
      { error: "Missing url parameter" },
      { status: 400 }
    );
  }

  const pdfUrl = decodeURIComponent(encodedUrl);

  try {
    const res = await fetch(pdfUrl);

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch PDF" },
        { status: res.status }
      );
    }

    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") ?? "application/pdf";

    return new NextResponse(Buffer.from(buffer), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": "inline", // ✅ Key to view in iframe
        "Cache-Control": "no-cache",
      },
    });
  } catch {
    return NextResponse.json({ error: "Error fetching PDF" }, { status: 500 });
  }
}
