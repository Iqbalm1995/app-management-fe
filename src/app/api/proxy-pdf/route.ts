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

    // Extract original filename from the URL path (before query string)
    const urlPath = pdfUrl.split("?")[0];
    const fileName = urlPath.split("/").pop() ?? "preview.pdf";

    const isDownload = req.nextUrl.searchParams.get("download") === "true";
    const contentDisposition = isDownload
      ? `attachment; filename="${fileName}"`
      : "inline";

    // Always force application/pdf regardless of what MinIO returns.
    // Set Content-Disposition: inline to ensure preview in iframes does NOT trigger download.
    return new NextResponse(Buffer.from(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": contentDisposition,
        "Cache-Control": "no-cache",
      },
    });
  } catch {
    return NextResponse.json({ error: "Error fetching PDF" }, { status: 500 });
  }
}
