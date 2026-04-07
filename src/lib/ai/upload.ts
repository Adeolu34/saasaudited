import { v2 as cloudinary } from "cloudinary";

let configured = false;

function ensureConfig() {
  if (configured) return;
  const url = process.env.CLOUDINARY_URL;
  if (!url) {
    throw new Error(
      "CLOUDINARY_URL is required. Get it free at https://cloudinary.com/console"
    );
  }
  // CLOUDINARY_URL format: cloudinary://API_KEY:API_SECRET@CLOUD_NAME
  // The SDK auto-parses it from the env var
  cloudinary.config({ secure: true });
  configured = true;
}

/**
 * Upload an image from a URL to Cloudinary for permanent storage.
 * Returns the permanent CDN URL.
 */
export async function uploadImageFromUrl(
  sourceUrl: string,
  options?: {
    folder?: string;
    publicId?: string;
  }
): Promise<string> {
  ensureConfig();

  const result = await cloudinary.uploader.upload(sourceUrl, {
    folder: options?.folder || "saasaudited",
    public_id: options?.publicId,
    overwrite: true,
    resource_type: "image",
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  });

  return result.secure_url;
}

/**
 * Check if Cloudinary is configured.
 */
export function isCloudinaryConfigured(): boolean {
  return Boolean(process.env.CLOUDINARY_URL);
}
