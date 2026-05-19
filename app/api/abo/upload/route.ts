import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAboCustomerByEmail } from "@/lib/abo";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const json = await handleUpload({
      body,
      request,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      onBeforeGenerateToken: async () => {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");
        const abo = await getAboCustomerByEmail(session.user.email);
        if (!abo) throw new Error("Kein aktives Abo");
        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/heic",
            "image/heif",
            "application/pdf",
          ],
          maximumSizeInBytes: 50 * 1024 * 1024, // 50 MB
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ aboId: abo.id }),
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log("[abo/upload] complete", blob.pathname);
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
