import { requireAdmin } from "@/lib/auth/dal";
import dbConnect from "@/lib/mongodb";
import Tool from "@/lib/models/Tool";
import Review from "@/lib/models/Review";
import BlogPost from "@/lib/models/BlogPost";
import Category from "@/lib/models/Category";
import Comparison from "@/lib/models/Comparison";

export const metadata = { title: "Dashboard" };

async function getStats() {
  await dbConnect();
  const [tools, reviews, blog, categories, comparisons] = await Promise.all([
    Tool.countDocuments(),
    Review.countDocuments(),
    BlogPost.countDocuments(),
    Category.countDocuments(),
    Comparison.countDocuments(),
  ]);
  return { tools, reviews, blog, categories, comparisons };
}

function StatCard({
  icon,
  label,
  value,
  href,
}: {
  icon: string;
  label: string;
  value: number;
  href: string;
}) {
  return (
    <a
      href={href}
      className="bg-surface-container-lowest ghost-border rounded-xl p-6 hover:shadow-editorial transition-shadow group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center">
          <span className="material-symbols-outlined text-on-primary-fixed text-xl">
            {icon}
          </span>
        </div>
        <span className="material-symbols-outlined text-on-surface-variant/40 group-hover:text-primary transition-colors">
          arrow_forward
        </span>
      </div>
      <p className="font-mono text-3xl font-bold text-on-surface">{value}</p>
      <p className="text-sm text-on-surface-variant mt-1">{label}</p>
    </a>
  );
}

export default async function AdminDashboard() {
  await requireAdmin();
  const stats = await getStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-2xl font-bold text-on-surface">
          Dashboard
        </h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Overview of your SaasAudited content
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          icon="construction"
          label="Tools"
          value={stats.tools}
          href="/admin/tools"
        />
        <StatCard
          icon="rate_review"
          label="Reviews"
          value={stats.reviews}
          href="/admin/reviews"
        />
        <StatCard
          icon="compare"
          label="Comparisons"
          value={stats.comparisons}
          href="/admin/comparisons"
        />
        <StatCard
          icon="article"
          label="Blog Posts"
          value={stats.blog}
          href="/admin/blog"
        />
        <StatCard
          icon="category"
          label="Categories"
          value={stats.categories}
          href="/admin/categories"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-surface-container-lowest ghost-border rounded-xl p-6">
          <h2 className="font-headline text-lg font-bold text-on-surface mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: "/admin/tools/new", icon: "add_circle", label: "New Tool" },
              { href: "/admin/reviews/new", icon: "edit_note", label: "New Review" },
              { href: "/admin/blog/new", icon: "post_add", label: "New Blog Post" },
              { href: "/admin/comparisons/new", icon: "compare_arrows", label: "New Comparison" },
            ].map((action) => (
              <a
                key={action.href}
                href={action.href}
                className="flex items-center gap-2.5 px-4 py-3 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors text-sm font-medium text-on-surface"
              >
                <span className="material-symbols-outlined text-primary text-xl">
                  {action.icon}
                </span>
                {action.label}
              </a>
            ))}
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-surface-container-lowest ghost-border rounded-xl p-6">
          <h2 className="font-headline text-lg font-bold text-on-surface mb-4">
            Getting Started
          </h2>
          <div className="space-y-3 text-sm text-on-surface-variant">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-lg mt-0.5">
                check_circle
              </span>
              <p>
                <strong className="text-on-surface">Admin account created</strong>{" "}
                — Change default password in Users section.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-lg mt-0.5">
                check_circle
              </span>
              <p>
                <strong className="text-on-surface">Content seeded</strong> —{" "}
                {stats.tools} tools, {stats.reviews} reviews, {stats.blog} blog
                posts.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-on-surface-variant/40 text-lg mt-0.5">
                radio_button_unchecked
              </span>
              <p>
                <strong className="text-on-surface">
                  Generate API keys
                </strong>{" "}
                — Set up public API access in API Keys section.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-on-surface-variant/40 text-lg mt-0.5">
                radio_button_unchecked
              </span>
              <p>
                <strong className="text-on-surface">
                  Enable comments
                </strong>{" "}
                — Comment moderation in Comments section.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
