import dbConnect from "@/lib/mongodb";
import AuthorModel from "@/lib/models/Author";

export interface Author {
  name: string;
  bio: string;
  image: string;
}

/** Default authors — seeded into the Author collection on first use */
const SEED_AUTHORS = [
  {
    name: "Maya Chen",
    bio: "Senior SaaS Analyst at SaasAudited. Former product lead at Salesforce and advisor to three B2B startups. Specializes in CRM, marketing automation, and go-to-market strategy.",
    image: "",
    role: "Senior SaaS Analyst",
    content_types: ["blog"],
  },
  {
    name: "Daniel Okafor",
    bio: "Staff Writer & SaaS Strategist at SaasAudited. Ex-consultant at McKinsey's tech practice with deep expertise in enterprise software, security, and infrastructure tools.",
    image: "",
    role: "Staff Writer & SaaS Strategist",
    content_types: ["tool", "review", "comparison", "category"],
  },
];

/** Ensure seed authors exist in the Author collection */
async function ensureSeeded(): Promise<void> {
  const count = await AuthorModel.countDocuments();
  if (count > 0) return;

  console.log("[Authors] Seeding default authors...");
  for (const seed of SEED_AUTHORS) {
    await AuthorModel.findOneAndUpdate(
      { name: seed.name },
      { $setOnInsert: seed },
      { upsert: true }
    );
  }
}

/** Get all authors from the Author collection */
export async function getAuthors(): Promise<Author[]> {
  await dbConnect();
  await ensureSeeded();
  const docs = await AuthorModel.find().sort({ name: 1 }).lean();
  return docs.map((d) => ({
    name: d.name,
    bio: d.bio || "",
    image: d.image || "",
  }));
}

/** Get author by content type */
export async function getAuthorForType(
  type: "blog" | "tool" | "review" | "comparison" | "category"
): Promise<Author> {
  await dbConnect();
  await ensureSeeded();

  // Find an author whose content_types includes this type
  const match = await AuthorModel.findOne({ content_types: type }).lean();
  if (match) {
    return { name: match.name, bio: match.bio || "", image: match.image || "" };
  }

  // Fallback: return first author
  const fallback = await AuthorModel.findOne().lean();
  if (fallback) {
    return { name: fallback.name, bio: fallback.bio || "", image: fallback.image || "" };
  }

  // Last resort: hardcoded fallback
  return SEED_AUTHORS[0];
}

/** Save an author image URL */
export async function saveAuthorImage(name: string, imageUrl: string): Promise<void> {
  await dbConnect();
  await AuthorModel.findOneAndUpdate(
    { name },
    { $set: { image: imageUrl } }
  );
}
