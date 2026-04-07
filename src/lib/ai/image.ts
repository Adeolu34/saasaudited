import { getReplicate, DEFAULT_IMAGE_MODEL } from "./replicate";

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
      height: params.contentType === "blog" ? 630 : 512,
      num_outputs: 1,
      guidance_scale: 7.5,
      num_inference_steps: 25,
    },
  });

  const urls = output as string[];
  if (!urls || urls.length === 0) {
    throw new Error("Image generation returned no results");
  }

  return urls[0];
}
