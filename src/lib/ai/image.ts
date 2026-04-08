import { getReplicate, DEFAULT_IMAGE_MODEL } from "./replicate";
import { uploadImageFromUrl, isCloudinaryConfigured } from "./upload";

interface ImageGenerationParams {
  title: string;
  contentType: "blog" | "tool";
}

export async function generateImage(params: ImageGenerationParams): Promise<string> {
  const replicate = getReplicate();

  const styleMap = {
    blog: "dark navy blue background, futuristic technology concept art, glowing holographic 3D elements floating in space, neon blue and cyan accent lighting, digital globe or network nodes, sleek corporate tech aesthetic, cinematic lighting, depth of field, professional SaaS blog header, no text, no letters, no words, no writing",
    tool: "dark navy background, single glowing holographic app icon, neon blue and cyan glow, futuristic 3D render, centered composition, sleek minimal SaaS branding, professional tech aesthetic, no text, no letters, no words",
  };

  const prompt = `${styleMap[params.contentType]}, concept: "${params.title}", ultra detailed, 8k render, octane render`;

  const output = await replicate.run(DEFAULT_IMAGE_MODEL as `${string}/${string}:${string}`, {
    input: {
      prompt,
      negative_prompt:
        "text, watermark, signature, blurry, low quality, distorted, ugly, nsfw, letters, words, writing, typography, font, label, caption, bright white background, cartoon, clipart, amateur",
      width: params.contentType === "blog" ? 1200 : 512,
      height: params.contentType === "blog" ? 632 : 512,
      num_outputs: 1,
      guidance_scale: 8.5,
      num_inference_steps: 30,
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
