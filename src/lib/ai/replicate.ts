import Replicate from "replicate";

let client: Replicate | null = null;

export function getReplicate(): Replicate {
  if (!client) {
    const token = process.env.REPLICATE_API_TOKEN;
    if (!token) throw new Error("REPLICATE_API_TOKEN environment variable is required");
    client = new Replicate({ auth: token });
  }
  return client;
}

export const DEFAULT_IMAGE_MODEL =
  process.env.REPLICATE_IMAGE_MODEL || "stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc";
