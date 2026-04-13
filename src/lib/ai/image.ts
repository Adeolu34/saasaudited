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
    blog: {
      featured:
        "Professional editorial photograph for a technology magazine cover. Clean, modern composition with dramatic lighting. Abstract geometric shapes representing software and cloud technology. Rich jewel-tone color palette with deep blues, teals, and warm accents. Sharp focus, shallow depth of field. No text, no watermarks, no logos, no words, no letters.",
      inline:
        "Clean explanatory diagram-style illustration for a technology article. Isometric perspective showing interconnected software interfaces and data flow. Soft natural lighting, muted professional color palette. Informational and clear, not decorative. No text, no watermarks, no logos, no words, no letters.",
    },
    tool:
      "Minimal product visualization of a modern SaaS application interface. Clean white background, subtle shadows, floating UI elements with soft gradients. Professional product photography style. Sharp, high contrast, premium feel. No text, no watermarks, no logos, no words, no letters.",
    author:
      "Professional corporate headshot portrait. Clean studio background with subtle gradient. Sharp focus on face, confident and approachable expression, business attire. Natural skin tones, soft studio lighting. Photorealistic, high detail. No text, no watermarks.",
  };

  const context = params.context ? ` Scene context: ${params.context}.` : "";

  let prompt: string;
  if (params.contentType === "author") {
    prompt = `${styleMap.author} Person: "${params.title}". Ultra detailed, editorial photography quality.`;
  } else if (params.contentType === "blog") {
    const variant = params.variant === "inline" ? "inline" : "featured";
    prompt = `${styleMap.blog[variant]} Topic: "${params.title}".${context}`;
  } else {
    prompt = `${styleMap.tool} Product concept: "${params.title}".${context}`;
  }

  const aspectMap = {
    blog: { featured: "16:9", inline: "16:9" },
    tool: { featured: "1:1", inline: "1:1" },
    author: { featured: "1:1", inline: "1:1" },
  };

  const aspect =
    aspectMap[params.contentType]?.[params.variant || "featured"] || "16:9";

  // FLUX models use a different input shape than SDXL
  const isFlux = DEFAULT_IMAGE_MODEL.includes("flux");

  const input = isFlux
    ? {
        prompt,
        aspect_ratio: aspect,
        output_format: "webp",
        output_quality: 90,
        safety_tolerance: 2,
        prompt_upsampling: true,
      }
    : {
        // Fallback for SDXL-style models
        prompt,
        negative_prompt:
          "text, watermark, signature, blurry, low quality, distorted, ugly, nsfw, letters, words, writing, typography, font, label, caption, logo, noisy background, low contrast, jpeg artifacts",
        width: params.contentType === "blog" ? 1200 : 512,
        height:
          params.contentType === "blog"
            ? params.variant === "inline"
              ? 675
              : 632
            : 512,
        num_outputs: 1,
        guidance_scale: 7,
        num_inference_steps: 35,
      };

  const output = await replicate.run(
    DEFAULT_IMAGE_MODEL as `${string}/${string}` | `${string}/${string}:${string}`,
    { input }
  );

  // Handle different output formats: FLUX returns a single URL or FileOutput,
  // SDXL returns an array of URLs/FileOutputs.
  let tempUrl: string;

  if (typeof output === "string") {
    tempUrl = output;
  } else if (output && typeof output === "object" && "url" in output) {
    const urlVal = (output as Record<string, unknown>).url;
    const resolved = typeof urlVal === "function" ? urlVal.call(output) : urlVal;
    tempUrl = String(resolved);
  } else if (Array.isArray(output) && output.length > 0) {
    const first = output[0];
    if (typeof first === "string") {
      tempUrl = first;
    } else if (first && typeof first === "object" && "url" in first) {
      const urlVal = (first as Record<string, unknown>).url;
      const resolved = typeof urlVal === "function" ? urlVal.call(first) : urlVal;
      tempUrl = String(resolved);
    } else {
      tempUrl = String(first);
    }
  } else {
    tempUrl = String(output);
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
      const variantSuffix = params.variant === "inline" ? "-inline" : "";
      const permanentUrl = await uploadImageFromUrl(tempUrl, {
        folder: `saasaudited/${params.contentType}s`,
        publicId: `${slug}${variantSuffix}`,
      });
      return permanentUrl;
    } catch (err) {
      console.error("[Image] Cloudinary upload failed, using temp URL:", err);
      return tempUrl;
    }
  }

  return tempUrl;
}
