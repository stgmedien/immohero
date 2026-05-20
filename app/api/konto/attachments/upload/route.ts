import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const json = await handleUpload({
      body,
      request,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      onBeforeGenerateToken: async () => {
        const session = await auth();
        if (!session?.user?.id) throw new Error("Unauthorized");
        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/heic",
            "image/heif",
            "application/pdf",
          ],
          maximumSizeInBytes: 30 * 1024 * 1024, // 30 MB
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ userId: session.user.id }),
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log("[konto/attachments] complete", blob.pathname);
      },
    });
    return NextResponse.json(json);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message ?? "Upload failed" },
      { status: 400 },
    );
  }
}
