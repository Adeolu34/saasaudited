import { getReplicate, DEFAULT_IMAGE_MODEL } from "./replicate";
import { uploadImageFromUrl, isCloudinaryConfigured } from "./upload";

interface ImageGenerationParams {
  title: string;
  contentType: "blog" | "tool" | "author";
  context?: string;
  variant?: "featured" | "inline";
}

export async function generateImage(params: ImageGenerationParams): Promise<string> {
  const replicate = getReplicate();

  const styleMap = {
    blog:
      "clean modern SaaS editorial illustration, premium digital magazine style, polished lighting, balanced composition, rich but not oversaturated colors, visually clear focal point, professional and trustworthy, high detail, no text overlays",
    tool:
      "clean product hero illustration, modern SaaS UI-inspired composition, subtle gradients, precise lighting, minimal clutter, high-detail 3d style, no text overlays",
    author:
      "professional corporate headshot portrait, clean studio background, sharp focus on face, confident expression, business attire, natural skin tones, photorealistic",
  };

  const context = params.context ? ` Story context: ${params.context}.` : "";
  const blogVariantHint =
    params.contentType === "blog" && params.variant === "inline"
      ? " Create an explanatory supporting scene suitable for in-article placement, not a title banner."
      : " Create a high-impact hero composition suitable for a blog featured image.";

  const prompt =
    params.contentType === "author"
      ? `${styleMap.author}, person named "${params.title}", ultra detailed, high-end editorial photography`
      : `${styleMap[params.contentType]}, concept: "${params.title}".${context}${blogVariantHint}`;

  const sizeMap = {
    blog: { width: 1200, height: 632 },
    tool: { width: 512, height: 512 },
    author: { width: 512, height: 512 },
  };
  const dimensions =
    params.contentType === "blog" && params.variant === "inline"
      ? { width: 1200, height: 675 }
      : sizeMap[params.contentType];

  const output = await replicate.run(DEFAULT_IMAGE_MODEL, {
    input: {
      prompt,
      negative_prompt:
        "text, watermark, signature, blurry, low quality, distorted, ugly, nsfw, letters, words, writing, typography, font, label, caption, logo, noisy background, low contrast, jpeg artifacts",
      width: dimensions.width,
      height: dimensions.height,
      num_outputs: 1,
      guidance_scale: 7,
      num_inference_steps: 35,
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
