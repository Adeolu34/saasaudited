import dbConnect from "@/lib/mongodb";
import AiSettings from "@/lib/models/AiSettings";

export interface Author {
  name: string;
  bio: string;
  image: string;
}

const AUTHORS_BASE: Author[] = [
  {
    name: "Maya Chen",
    bio: "Senior SaaS Analyst at SaasAudited. Former product lead at Salesforce and advisor to three B2B startups. Specializes in CRM, marketing automation, and go-to-market strategy.",
    image: "",
  },
  {
    name: "Daniel Okafor",
    bio: "Staff Writer & SaaS Strategist at SaasAudited. Ex-consultant at McKinsey's tech practice with deep expertise in enterprise software, security, and infrastructure tools.",
    image: "",
  },
];

/** Get authors with DB-stored images merged in */
export async function getAuthors(): Promise<Author[]> {
  try {
    await dbConnect();
    const doc = await AiSettings.findOne({ config_key: "authors" }).lean();
    const images = (doc as Record<string, unknown>)?.author_images as Record<string, string> | undefined;
    if (!images) return AUTHORS_BASE;
    return AUTHORS_BASE.map((a) => ({
      ...a,
      image: images[a.name] || a.image,
    }));
  } catch {
    return AUTHORS_BASE;
  }
}

/** Get author by content type: Maya Chen for blogs, Daniel Okafor for tools/comparisons */
export async function getAuthorForType(type: "blog" | "tool" | "review" | "comparison" | "category"): Promise<Author> {
  const authors = await getAuthors();
  const maya = authors.find((a) => a.name === "Maya Chen") || authors[0];
  const daniel = authors.find((a) => a.name === "Daniel Okafor") || authors[1] || authors[0];
  return type === "blog" ? maya : daniel;
}

/** Save an author image URL to the DB */
export async function saveAuthorImage(name: string, imageUrl: string): Promise<void> {
  await dbConnect();
  await AiSettings.updateOne(
    { config_key: "authors" },
    { $set: { [`author_images.${name}`]: imageUrl } },
    { upsert: true }
  );
}
