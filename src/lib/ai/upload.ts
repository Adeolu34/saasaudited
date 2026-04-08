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

  // Explicitly parse CLOUDINARY_URL: cloudinary://API_KEY:API_SECRET@CLOUD_NAME
  const match = url.match(
    /cloudinary:\/\/([^:]+):([^@]+)@(.+)/
  );
  if (!match) {
    throw new Error(
      "Invalid CLOUDINARY_URL format. Expected: cloudinary://API_KEY:API_SECRET@CLOUD_NAME"
    );
  }

  cloudinary.config({
    cloud_name: match[3],
    api_key: match[1],
    api_secret: match[2],
    secure: true,
  });

  console.log("[Cloudinary] Configured for cloud:", match[3]);
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

  console.log("[Cloudinary] Uploading image from:", sourceUrl.slice(0, 80));

  const result = await cloudinary.uploader.upload(sourceUrl, {
    folder: options?.folder || "saasaudited",
    public_id: options?.publicId,
    overwrite: true,
    resource_type: "image",
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  });

  console.log("[Cloudinary] Uploaded:", result.secure_url);
  return result.secure_url;
}

/**
 * Check if Cloudinary is configured.
 */
export function isCloudinaryConfigured(): boolean {
  const has = Boolean(process.env.CLOUDINARY_URL);
  if (!has) console.log("[Cloudinary] CLOUDINARY_URL not set, skipping upload");
  return has;
}
