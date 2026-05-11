import { put, del, list, type PutBlobResult } from "@vercel/blob";

export interface UploadOptions {
  pathname: string;
  body: Blob | ArrayBuffer | Buffer | string;
  contentType?: string;
}

export async function uploadAsset({ pathname, body, contentType }: UploadOptions): Promise<PutBlobResult> {
  return put(pathname, body, {
    access: "public",
    contentType,
    token: process.env.BLOB_READ_WRITE_TOKEN,
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

export async function deleteAsset(urlOrPath: string) {
  return del(urlOrPath, { token: process.env.BLOB_READ_WRITE_TOKEN });
}

export async function listAssets(prefix: string) {
  return list({ prefix, token: process.env.BLOB_READ_WRITE_TOKEN });
}

export function buildBlobPath(orderId: string, shotId: string, kind: string, filename: string): string {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `orders/${orderId}/shots/${shotId}/${kind}/${safeName}`;
}

export function buildDeliveryZipPath(orderId: string): string {
  return `deliveries/${orderId}.zip`;
}
