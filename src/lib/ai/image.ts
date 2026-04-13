import { getReplicate, DEFAULT_IMAGE_MODEL } from "./replicate";
import { uploadImageFromUrl, isCloudinaryConfigured } from "./upload";

interface ImageGenerationParams {
  title: string;
  contentType: "blog" | "tool" | "author";
  context?: string;
  variant?: "featured" | "inline";
}

/**
 * Extract a concise visual subject from the blog context to guide the image.
 * Instead of dumping raw context, we distill it into a short scene description.
 */
function buildVisualSubject(title: string, context?: string): string {
  // Extract key nouns/concepts from the title for visual grounding
  const cleanTitle = title
    .replace(/\(inline\)$/i, "")
    .replace(/\d{4}/g, "")
    .replace(/[:,\-–—|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!context) return cleanTitle;

  // Pull category and tags from the structured context for visual hints
  const categoryMatch = context.match(/Category:\s*([^|]+)/i);
  const tagsMatch = context.match(/Tags:\s*([^|]+)/i);
  const excerptMatch = context.match(/Excerpt:\s*([^|]+)/i);

  const parts: string[] = [cleanTitle];
  if (categoryMatch) parts.push(categoryMatch[1].trim());
  if (tagsMatch) parts.push(tagsMatch[1].trim().split(",").slice(0, 3).join(", "));
  if (excerptMatch) parts.push(excerptMatch[1].trim().slice(0, 120));

  return parts.join(". ");
}

/**
 * Category-aware style modifiers to make images feel distinct per topic.
 */
function getCategoryStyle(context?: string): string {
  if (!context) return "";

  const cat = (context.match(/Category:\s*([^|]+)/i)?.[1] || "").trim().toLowerCase();

  const categoryStyles: Record<string, string> = {
    strategy:
      "Executive boardroom atmosphere with strategic diagrams, chess-like composition. Cool blue and slate tones.",
    reviews:
      "Product showcase with glowing screens and interface previews floating in space. Warm amber and electric blue accents.",
    comparisons:
      "Split-screen duality concept, two contrasting approaches side by side. Bold contrasting color halves.",
    guides:
      "Open book or pathway metaphor with clear steps and milestones. Inviting warm gradient palette.",
    "industry news":
      "Breaking news energy with dynamic motion blur and data streams. High-contrast editorial red and white.",
  };

  return categoryStyles[cat] || "";
}

export async function generateImage(params: ImageGenerationParams): Promise<string> {
  const replicate = getReplicate();

  const visualSubject = buildVisualSubject(params.title, params.context);
  const categoryStyle = getCategoryStyle(params.context);

  const styleMap = {
    blog: {
      featured: `High-end editorial photograph for a premium technology publication. ${categoryStyle || "Rich jewel-tone color palette with deep blues, teals, and warm amber accents."} Cinematic lighting with dramatic depth. The scene visually represents: ${visualSubject}. Photorealistic, ultra-sharp, shot on medium format camera. No text, no watermarks, no logos, no words, no letters, no UI elements.`,
      inline: `Clean conceptual illustration for a technology article. Soft isometric perspective. The visual metaphor represents: ${visualSubject}. Muted professional color palette with one vibrant accent color. Elegant and informational, like a premium infographic header. No text, no watermarks, no logos, no words, no letters.`,
    },
    tool: `Minimal product visualization of a modern SaaS application interface. Clean white background, subtle shadows, floating UI elements with soft gradients. Professional product photography style. Sharp, high contrast, premium feel. No text, no watermarks, no logos, no words, no letters.`,
    author: `Professional corporate headshot portrait. Clean studio background with subtle gradient. Sharp focus on face, confident and approachable expression, business attire. Natural skin tones, soft studio lighting. Photorealistic, high detail. No text, no watermarks.`,
  };

  let prompt: string;
  if (params.contentType === "author") {
    prompt = `${styleMap.author} Person: "${params.title}". Ultra detailed, editorial photography quality.`;
  } else if (params.contentType === "blog") {
    const variant = params.variant === "inline" ? "inline" : "featured";
    prompt = styleMap.blog[variant];
  } else {
    const context = params.context ? ` Scene context: ${params.context}.` : "";
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
