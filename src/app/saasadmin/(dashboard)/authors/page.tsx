import Link from "next/link";
import Image from "next/image";
import dbConnect from "@/lib/mongodb";
import Author from "@/lib/models/Author";
import Toast from "@/components/admin/shared/Toast";
import DeleteButton from "@/components/admin/shared/DeleteButton";
import BlogPost from "@/lib/models/BlogPost";

export const metadata = { title: "Authors" };
export const dynamic = "force-dynamic";

async function getAuthors() {
  await dbConnect();
  const authors = await Author.find().sort({ name: 1 }).lean();

  // Get post counts per author
  const postCounts = await BlogPost.aggregate([
    { $group: { _id: "$author.name", count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(postCounts.map((p) => [p._id, p.count]));

  return authors.map((a) => ({
    _id: String(a._id),
    name: a.name,
    role: a.role,
    bio: a.bio,
    image: a.image,
    postCount: countMap[a.name] || 0,
  }));
}

export default async function AuthorsPage() {
  const authors = await getAuthors();

  return (
    <div className="space-y-6">
      <Toast />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">Authors</h1>
          <p className="text-on-surface-variant text-sm mt-1">{authors.length} authors total</p>
        </div>
        <Link
          href="/saasadmin/authors/new"
          className="ember-gradient text-on-primary px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          New Author
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {authors.map((a) => (
          <div
            key={a._id}
            className="bg-surface-container-lowest ghost-border rounded-xl p-6 flex flex-col"
          >
            <div className="flex items-start gap-4 mb-4">
              {a.image ? (
                <Image
                  src={a.image}
                  alt={a.name}
                  width={56}
                  height={56}
                  className="rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-2xl text-on-surface-variant/40">
                    person
                  </span>
                </div>
              )}
              <div className="min-w-0">
                <h3 className="font-headline text-lg font-semibold text-on-surface truncate">
                  {a.name}
                </h3>
                <p className="text-xs font-mono text-on-surface-variant">{a.role}</p>
              </div>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-2 mb-4 flex-1">
              {a.bio || "No bio set."}
            </p>
            <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20">
              <span className="text-xs font-mono text-on-surface-variant">
                {a.postCount} {a.postCount === 1 ? "post" : "posts"}
              </span>
              <div className="flex items-center gap-1">
                <Link
                  href={`/saasadmin/authors/${a._id}/edit`}
                  className="p-1.5 rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant hover:text-primary"
                  title="Edit"
                >
                  <span className="material-symbols-outlined text-lg">edit</span>
                </Link>
                <DeleteButton id={a._id} name={a.name} resourceType="authors" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {authors.length === 0 && (
        <div className="bg-surface-container-lowest ghost-border rounded-xl p-12 text-center">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-3 block">
            person_off
          </span>
          <p className="text-on-surface-variant text-sm mb-4">No authors found.</p>
          <Link
            href="/saasadmin/authors/new"
            className="ember-gradient text-on-primary px-4 py-2 rounded-lg text-sm font-semibold inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Add First Author
          </Link>
        </div>
      )}
    </div>
  );
}
