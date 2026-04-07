import { notFound } from "next/navigation";
export const revalidate = 3600;
import type { Metadata } from "next";
import Link from "next/link";
import dbConnect from "@/lib/mongodb";
import BlogPost from "@/lib/models/BlogPost";
import Breadcrumb from "@/components/layout/Breadcrumb";
import NewsletterForm from "@/components/shared/NewsletterForm";
import { sanitizeHtml } from "@/lib/sanitize";
import { getBlogPost } from "@/lib/queries";
import JsonLd from "@/components/shared/JsonLd";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  await dbConnect();
  const posts = await BlogPost.find({}, { slug: 1 }).lean();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return { title: "Post Not Found" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      ...(post.featured_image && { images: [post.featured_image] }),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}


export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  const post = await getBlogPost(slug);
  if (!post) notFound();

  await dbConnect();
  const relatedPosts = await BlogPost.find({ slug: { $ne: slug } })
    .sort({ published_at: -1 })
    .limit(3)
    .lean();

  return (
    <div className="pt-8 pb-24 px-6 md:px-8 max-w-7xl mx-auto">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.excerpt,
          author: {
            "@type": "Person",
            name: post.author?.name || "Staff",
          },
          datePublished: post.published_at,
          publisher: {
            "@type": "Organization",
            name: "SaasAudited",
          },
          ...(post.featured_image && { image: post.featured_image }),
        }}
      />
      <div className="flex flex-col lg:flex-row gap-16 relative">
        {/* Article Canvas */}
        <article className="flex-1 max-w-[720px] mx-auto lg:mx-0">
          {/* Breadcrumbs & Category */}
          <div className="flex flex-col items-center mb-8 text-center">
            <Breadcrumb
              items={[
                { label: "Home", href: "/" },
                { label: "Blog", href: "/blog" },
                { label: post.category },
              ]}
            />
            <span className="ember-gradient text-white text-[11px] font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-6 inline-block">
              {post.category}
            </span>
            <h1 className="text-5xl md:text-[52px] font-headline font-semibold leading-[1.1] text-on-background tracking-tight mb-6">
              {post.title}
            </h1>
            <p className="text-xl font-body text-on-surface-variant leading-relaxed mb-8 max-w-2xl">
              {post.excerpt}
            </p>

            {/* Author & Stats */}
            <div className="flex items-center gap-4 mb-8">
              {post.author?.image && (
                <img
                  alt={post.author.name}
                  className="w-10 h-10 rounded-full object-cover"
                  src={post.author.image}
                />
              )}
              <div className="text-left">
                <div className="text-sm font-medium">{post.author?.name}</div>
                <div className="text-xs text-on-surface-variant/70 font-mono">
                  {new Date(post.published_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                  · {post.read_time} min read
                </div>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          {post.featured_image && (
            <figure className="mb-16 max-w-[860px] self-center">
              <img
                alt={post.title}
                className="w-full h-auto rounded-xl shadow-xl"
                src={post.featured_image}
              />
            </figure>
          )}

          {/* Article Body */}
          <div
            className="prose prose-stone max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
          />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-16 pt-8 border-t border-outline-variant/20">
              <div className="flex flex-wrap gap-3 mb-12">
                {post.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="text-[11px] font-mono text-on-surface-variant/70 border border-outline-variant/30 px-3 py-1 rounded"
                  >
                    # {tag.toUpperCase()}
                  </span>
                ))}
              </div>

              {/* Author Bio */}
              {post.author?.bio && (
                <div className="bg-surface-container-low p-8 rounded-2xl flex flex-col md:flex-row gap-8 items-start">
                  {post.author.image && (
                    <img
                      alt={post.author.name}
                      className="w-20 h-20 rounded-full object-cover"
                      src={post.author.image}
                    />
                  )}
                  <div>
                    <p className="text-2xl font-headline italic mb-2">
                      {post.author.name}
                    </p>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      {post.author.bio}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </article>

        {/* Sidebar */}
        <aside className="w-full lg:w-[280px] space-y-12 shrink-0">
          <div className="sticky top-28 space-y-12">
            {/* TOC */}
            {post.toc && post.toc.length > 0 && (
              <nav aria-label="Table of contents">
                <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary mb-6">
                  In this article
                </h2>
                <ul className="space-y-4">
                  {post.toc.map(
                    (item: { title: string; anchor: string }) => (
                      <li key={item.anchor}>
                        <a
                          href={`#${item.anchor}`}
                          className="text-[13px] font-body text-on-surface-variant hover:text-primary transition-colors"
                        >
                          {item.title}
                        </a>
                      </li>
                    )
                  )}
                </ul>
              </nav>
            )}

            {/* Newsletter Sidebar */}
            <div className="ember-gradient p-8 rounded-2xl text-white">
              <span className="material-symbols-outlined mb-4 text-3xl">
                mail
              </span>
              <p className="text-xl font-headline italic mb-2">
                The Ember Weekly
              </p>
              <p className="text-xs text-white/80 mb-6 leading-relaxed">
                The software intelligence your competition is reading.
              </p>
              <Link
                href="/blog"
                className="w-full bg-white text-primary py-3 rounded-lg font-bold text-xs uppercase tracking-widest block text-center"
              >
                Sign Up Free
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {/* Related Posts Grid */}
      {relatedPosts.length > 0 && (
        <section className="mt-32 pt-16 border-t border-outline-variant/30">
          <h3 className="text-[32px] font-headline italic mb-12">
            You might also like
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {relatedPosts.map((related) => (
              <Link
                key={related.slug}
                href={`/blog/${related.slug}`}
                className="group block"
              >
                {related.featured_image && (
                  <div className="overflow-hidden rounded-xl mb-4 bg-surface-container-low aspect-[16/10]">
                    <img
                      alt={related.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      src={related.featured_image}
                    />
                  </div>
                )}
                <div className="text-[10px] font-mono text-primary font-bold uppercase tracking-widest mb-2">
                  {related.category}
                </div>
                <h4 className="text-xl font-headline font-semibold group-hover:text-primary transition-colors mb-2 italic leading-tight">
                  {related.title}
                </h4>
                <p className="text-sm text-on-surface-variant line-clamp-2">
                  {related.excerpt}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
