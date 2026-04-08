import { NextResponse } from "next/server";
import { getAuthors, saveAuthorImage } from "@/lib/ai/authors";
import { generateImage } from "@/lib/ai/image";

export async function GET() {
  const authors = await getAuthors();
  return NextResponse.json({ authors });
}

export async function POST() {
  try {
    const authors = await getAuthors();
    const results: { name: string; status: string; image?: string; error?: string }[] = [];

    for (const author of authors) {
      try {
        const imageUrl = await generateImage({
          title: author.name,
          contentType: "author",
        });
        await saveAuthorImage(author.name, imageUrl);
        results.push({ name: author.name, status: "success", image: imageUrl });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed";
        results.push({ name: author.name, status: "error", error: message });
      }
    }

    const succeeded = results.filter((r) => r.status === "success").length;
    return NextResponse.json({
      message: `Generated ${succeeded}/${authors.length} author images`,
      results,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Author image generation failed";
    console.error("[AI Authors]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
