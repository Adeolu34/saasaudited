import { getReplicate, DEFAULT_IMAGE_MODEL } from "./replicate";
import { uploadImageFromUrl, isCloudinaryConfigured } from "./upload";

interface ImageGenerationParams {
  title: string;
  contentType: "blog" | "tool";
}

export async function generateImage(params: ImageGenerationParams): Promise<string> {
  const replicate = getReplicate();

  const styleMap = {
    blog: "modern minimalist tech blog header illustration, abstract geometric shapes, soft gradients, professional, clean design, no text, no letters, no words",
    tool: "modern app icon logo design, minimalist, flat design, professional SaaS branding, single color palette, centered icon, no text, no letters",
  };

  const prompt = `${styleMap[params.contentType]}, representing "${params.title}", high quality, 4k`;

  const output = await replicate.run(DEFAULT_IMAGE_MODEL as `${string}/${string}:${string}`, {
    input: {
      prompt,
      negative_prompt:
        "text, watermark, signature, blurry, low quality, distorted, ugly, nsfw, letters, words, writing",
      width: params.contentType === "blog" ? 1200 : 512,
      height: params.contentType === "blog" ? 632 : 512,
      num_outputs: 1,
      guidance_scale: 7.5,
      num_inference_steps: 25,
    },
  });

  // Replicate SDK v1.x returns FileOutput objects, not plain strings
  const results = output as unknown[];
  if (!results || results.length === 0) {
    throw new Error("Image generation returned no results");
  }

  const first = results[0];
  let tempUrl: string;
  if (typeof first === "string") {
    tempUrl = first;
  } else if (first && typeof first === "object" && "url" in first) {
    // FileOutput.url() returns a URL object — call it then convert to string
    const urlVal = (first as Record<string, unknown>).url;
    const resolved = typeof urlVal === "function" ? urlVal.call(first) : urlVal;
    tempUrl = String(resolved);
  } else {
    tempUrl = String(first);
  }

  if (!tempUrl || tempUrl === "[object Object]" || !tempUrl.startsWith("http")) {
    throw new Error(`Image generation returned invalid URL: ${tempUrl}`);
  }

  // Upload to Cloudinary for permanent storage (Replicate URLs expire)
  if (isCloudinaryConfigured()) {
    try {
      const slug = params.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 60);
      const permanentUrl = await uploadImageFromUrl(tempUrl, {
        folder: `saasaudited/${params.contentType}s`,
        publicId: slug,
      });
      return permanentUrl;
    } catch (err) {
      console.error("[Image] Cloudinary upload failed, using temp URL:", err);
      return tempUrl;
    }
  }

  return tempUrl;
}
