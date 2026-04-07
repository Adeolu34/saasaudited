import mongoose from "mongoose";
import Tool from "../src/lib/models/Tool";
import Review from "../src/lib/models/Review";
import Category from "../src/lib/models/Category";
import Comparison from "../src/lib/models/Comparison";
import BlogPost from "../src/lib/models/BlogPost";
import { reviews } from "./seed-reviews";
import { comparisons } from "./seed-comparisons";
import { blogPosts } from "./seed-blog";

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/saasverdict";

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------
const categories = [
  {
    name: "CRM Software",
    slug: "crm-software",
    description:
      "Customer Relationship Management platforms that help teams track leads, manage pipelines, and close deals faster with data-driven insights.",
    icon_name: "groups",
    review_count: 42,
    featured_tools: ["hubspot", "salesforce", "pipedrive"],
    faq: [
      {
        question: "What is CRM software and why does my business need it?",
        answer:
          "CRM software centralises every customer interaction, from first touch to renewal, into a single source of truth. It eliminates scattered spreadsheets, automates follow-ups, and gives leadership real-time pipeline visibility so nothing falls through the cracks.",
      },
      {
        question: "How much does CRM software typically cost?",
        answer:
          "Pricing ranges from free tiers (HubSpot, Zoho) to $300+/user/month for enterprise platforms like Salesforce. Most mid-market teams spend $50-$150/user/month. Watch for hidden costs like implementation, data migration, and API overage fees.",
      },
      {
        question: "Can CRM software integrate with my existing tech stack?",
        answer:
          "Modern CRMs offer hundreds of native integrations and open APIs. HubSpot connects to 1,500+ apps, Salesforce has 5,000+ on AppExchange, and tools like Pipedrive support Zapier and Make for custom workflows.",
      },
    ],
  },
  {
    name: "Project Management",
    slug: "project-management",
    description:
      "Tools that help teams plan, track, and ship work with clarity. From kanban boards to sprint planning, these platforms keep every project on course.",
    icon_name: "task_alt",
    review_count: 38,
    featured_tools: ["linear", "asana", "notion"],
    faq: [
      {
        question: "What makes a great project management tool?",
        answer:
          "The best PM tools balance powerful features with frictionless UX. Key differentiators include real-time collaboration, flexible views (list, board, timeline), automations that reduce busywork, and integrations with your dev and design toolchain.",
      },
      {
        question:
          "Should engineering teams use a general PM tool or a specialised one?",
        answer:
          "Specialised tools like Linear are purpose-built for engineering velocity with native Git integration, cycle tracking, and sub-issue hierarchies. General tools like Asana or Notion work well for cross-functional teams that need a shared workspace.",
      },
      {
        question: "How do I migrate from one project management tool to another?",
        answer:
          "Most modern PM tools offer CSV and API-based importers. Start with a parallel run, migrate one team at a time, and map custom fields before bulk imports. Tools like Linear and Asana provide dedicated migration guides from competitors.",
      },
    ],
  },
  {
    name: "Marketing Automation",
    slug: "marketing-automation",
    description:
      "Platforms that automate repetitive marketing tasks such as email campaigns, lead nurturing, social scheduling, and attribution reporting.",
    icon_name: "campaign",
    review_count: 28,
    featured_tools: ["hubspot-marketing", "mailchimp", "activecampaign"],
    faq: [
      {
        question: "What is marketing automation?",
        answer:
          "Marketing automation uses software to execute, manage, and measure multi-channel campaigns at scale. It replaces manual processes for email, social, ads, and lead scoring so marketers can focus on strategy instead of execution.",
      },
      {
        question:
          "When should a company invest in marketing automation?",
        answer:
          "Once your team is sending more than a handful of manual emails per week or struggling to track lead sources, it is time. Most companies see ROI within 6 months of adoption through improved lead conversion and reduced manual effort.",
      },
      {
        question:
          "What is the difference between marketing automation and a CRM?",
        answer:
          "A CRM manages customer relationships and sales pipeline. Marketing automation handles top-of-funnel activities: nurturing leads, scoring engagement, and orchestrating campaigns. Many suites like HubSpot combine both into a single platform.",
      },
    ],
  },
  {
    name: "Analytics",
    slug: "analytics",
    description:
      "Product and web analytics platforms that help teams understand user behaviour, measure feature adoption, and make data-driven product decisions.",
    icon_name: "analytics",
    review_count: 35,
    featured_tools: ["posthog", "amplitude", "mixpanel"],
    faq: [
      {
        question: "What is product analytics?",
        answer:
          "Product analytics tracks how users interact with your software, from sign-up flows to feature usage. It answers questions like 'where do users drop off?' and 'which features drive retention?' so teams can prioritise what to build next.",
      },
      {
        question: "How does product analytics differ from web analytics?",
        answer:
          "Web analytics (like Google Analytics) focuses on page views, traffic sources, and sessions. Product analytics tools like PostHog and Amplitude go deeper into user-level event tracking, cohort analysis, and funnel conversion within the application.",
      },
      {
        question: "Should I self-host my analytics or use a cloud solution?",
        answer:
          "Self-hosting (PostHog, Plausible) gives you full data ownership and compliance control, ideal for regulated industries. Cloud solutions (Amplitude, Mixpanel) offer faster setup and managed infrastructure. Your choice depends on data sensitivity and engineering capacity.",
      },
    ],
  },
  {
    name: "HR Software",
    slug: "hr-software",
    description:
      "Human Resources platforms that streamline payroll, benefits administration, onboarding, performance management, and compliance tracking.",
    icon_name: "badge",
    review_count: 22,
    featured_tools: ["rippling", "gusto", "bamboohr"],
    faq: [
      {
        question: "What should I look for in HR software?",
        answer:
          "Prioritise payroll accuracy, benefits administration, compliance automation, and employee self-service. For growing teams, scalability and integration with your accounting and IT tools matter as much as core HR features.",
      },
      {
        question: "Is Rippling better for startups or enterprises?",
        answer:
          "Rippling is uniquely positioned for fast-scaling companies (50-1,000 employees) because it unifies HR, IT, and finance. Startups under 20 employees may find Gusto more cost-effective, while enterprises over 5,000 may need Workday-class depth.",
      },
      {
        question: "How long does it take to implement HR software?",
        answer:
          "Simple payroll-only setups take 1-2 weeks. Full HRIS implementations with benefits, onboarding flows, and integrations typically run 4-8 weeks. Rippling and Gusto offer guided onboarding to reduce time-to-value.",
      },
    ],
  },
  {
    name: "DevTools",
    slug: "devtools",
    description:
      "Developer platforms, hosting services, and low-code tools that accelerate software delivery from local development to global deployment.",
    icon_name: "terminal",
    review_count: 31,
    featured_tools: ["vercel", "supabase", "retool"],
    faq: [
      {
        question: "What qualifies as a DevTool?",
        answer:
          "DevTools encompass any platform that accelerates the software development lifecycle: hosting and deployment (Vercel, Netlify), backend-as-a-service (Supabase, Firebase), internal tool builders (Retool), CI/CD, and monitoring services.",
      },
      {
        question: "How do I choose between Vercel and Netlify?",
        answer:
          "Vercel is optimised for Next.js and React Server Components with edge-first architecture. Netlify offers broader framework support and a more generous free tier for commercial use. Choose Vercel for Next.js-heavy stacks; Netlify for Astro, Hugo, or multi-framework projects.",
      },
      {
        question: "Is Supabase a real alternative to Firebase?",
        answer:
          "Yes. Supabase provides Postgres (not NoSQL), row-level security, real-time subscriptions, edge functions, and built-in auth. It is open-source and self-hostable, making it a strong Firebase alternative for teams that prefer SQL and data ownership.",
      },
    ],
  },
  {
    name: "Customer Service",
    slug: "customer-service",
    description:
      "Help desk and support platforms that unify ticketing, live chat, AI bots, and knowledge bases to deliver fast, consistent customer experiences.",
    icon_name: "support_agent",
    review_count: 25,
    featured_tools: ["intercom", "zendesk", "freshdesk"],
    faq: [
      {
        question: "What is the difference between Intercom and Zendesk?",
        answer:
          "Intercom leads in conversational, AI-first support with proactive messaging. Zendesk excels at structured ticketing and enterprise-scale workflows. Intercom suits product-led growth companies; Zendesk fits high-volume support operations.",
      },
      {
        question: "Can AI really handle customer support effectively?",
        answer:
          "Modern AI agents (Intercom Fin, Zendesk AI) resolve 30-60% of L1 tickets autonomously by drawing from knowledge bases. They work best for repetitive queries and triage, while complex issues still route to human agents.",
      },
      {
        question: "How much does customer service software cost?",
        answer:
          "Entry plans start around $19/agent/month (Freshdesk, Help Scout). Mid-tier platforms run $50-$100/agent/month. Enterprise deployments with AI, custom bots, and advanced analytics can exceed $200/agent/month. Many offer free tiers for small teams.",
      },
    ],
  },
  {
    name: "Communication",
    slug: "communication",
    description:
      "Team communication tools that keep distributed teams aligned with real-time messaging, async video, and structured channels.",
    icon_name: "forum",
    review_count: 20,
    featured_tools: ["slack", "loom", "zoom"],
    faq: [
      {
        question: "Is Slack still the best team messaging tool?",
        answer:
          "Slack remains the dominant choice for professional teams thanks to its rich integration ecosystem (2,600+ apps), Huddles, Canvas, and Workflow Builder. Alternatives like Microsoft Teams win in enterprises already invested in the Microsoft 365 suite.",
      },
      {
        question: "When should a team adopt async video like Loom?",
        answer:
          "Async video reduces meeting fatigue for distributed teams across time zones. Adopt Loom when your team spends more than 25% of the week in status-update meetings that could be replaced with a 3-minute walkthrough recording.",
      },
      {
        question: "Is Discord suitable for business use?",
        answer:
          "Discord is increasingly used by developer communities, open-source projects, and creator-led businesses. Its free voice channels and community features are unmatched, but it lacks enterprise compliance, SSO, and admin controls found in Slack.",
      },
    ],
  },
  {
    name: "Design Systems",
    slug: "design-systems",
    description:
      "Design and prototyping platforms that enable teams to create, iterate, and ship polished interfaces with collaborative, component-driven workflows.",
    icon_name: "palette",
    review_count: 18,
    featured_tools: ["figma", "framer", "webflow"],
    faq: [
      {
        question: "What is a design system?",
        answer:
          "A design system is a collection of reusable components, tokens, and guidelines that ensure visual and functional consistency across a product. Tools like Figma enable teams to build, version, and share these systems collaboratively.",
      },
      {
        question: "Should my team use Figma or Framer?",
        answer:
          "Figma is the industry standard for UI/UX design and component libraries. Framer blurs the line between design and production, allowing designers to publish high-performance websites directly. Use Figma for app design; Framer for marketing sites.",
      },
      {
        question: "Is Sketch still relevant in 2026?",
        answer:
          "Sketch retains a loyal macOS user base and has improved with real-time collaboration. However, Figma's browser-based, cross-platform approach and deeper community ecosystem have made it the default choice for most new teams.",
      },
    ],
  },
  {
    name: "Data Analytics",
    slug: "data-analytics",
    description:
      "Business intelligence and data visualisation platforms that turn raw data into actionable dashboards, reports, and insights for stakeholders.",
    icon_name: "bar_chart",
    review_count: 15,
    featured_tools: ["tableau", "metabase", "power-bi"],
    faq: [
      {
        question: "What is the difference between data analytics and product analytics?",
        answer:
          "Data analytics (Tableau, Looker) focuses on enterprise-wide business intelligence: revenue dashboards, operational metrics, and cross-departmental reporting. Product analytics (Amplitude, Mixpanel) drills into in-app user behaviour and feature adoption.",
      },
      {
        question: "Do I need a data warehouse before adopting BI tools?",
        answer:
          "Yes for enterprise BI. Modern tools like Looker and Tableau perform best when connected to a centralised warehouse (Snowflake, BigQuery, Redshift). Lightweight tools like Metabase can connect directly to your production database for quick wins.",
      },
      {
        question: "How do Tableau and Power BI differ?",
        answer:
          "Tableau excels at ad-hoc visual exploration and is loved by analysts. Power BI offers unbeatable value at $10/user/month with tight Microsoft 365 integration. Power BI leads Gartner's Magic Quadrant; Tableau offers deeper visual customisation.",
      },
    ],
  },
  {
    name: "AI Platforms",
    slug: "ai-platforms",
    description:
      "AI assistant platforms and large language models that help individuals and businesses with writing, coding, research, analysis, and creative tasks through conversational interfaces and APIs.",
    icon_name: "smart_toy",
    review_count: 45,
    featured_tools: ["claude", "chatgpt", "gemini"],
    faq: [
      {
        question: "Which AI platform is best for coding?",
        answer:
          "Claude (Anthropic) leads coding benchmarks with 92.1% on HumanEval and 80.9% on SWE-bench Verified. It writes the cleanest, most idiomatic code with better structure and naming. ChatGPT (GPT-5.4) and GitHub Copilot are close competitors, especially for inline code completion.",
      },
      {
        question: "Is paying for an AI subscription worth it in 2026?",
        answer:
          "Yes, for power users. Free tiers are increasingly limited (ChatGPT Free now shows ads, Claude Free restricts to Sonnet). Pro plans at $20/month unlock the latest models, longer context windows, and advanced features like deep research and file analysis. The productivity gains typically save 5-10+ hours/month.",
      },
      {
        question: "What is the difference between ChatGPT, Claude, and Gemini?",
        answer:
          "ChatGPT (OpenAI) excels at broad versatility with GPT-5.4, image generation (DALL-E), and the largest ecosystem. Claude (Anthropic) leads in reasoning, coding, and long-document analysis with superior writing quality. Gemini (Google) offers the deepest Google ecosystem integration and a massive 1M token context window.",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Tools (50+ across all categories)
// ---------------------------------------------------------------------------
const tools = [
  // ── CRM Software ──────────────────────────────────────────────────────
  {
    name: "HubSpot CRM",
    slug: "hubspot",
    category: "CRM Software",
    logo_url: "/logos/hubspot.svg",
    official_url: "https://www.hubspot.com",
    overall_score: 9.2,
    rating_label: "Exceptional",
    short_description:
      "The all-in-one CRM platform that unifies marketing, sales, service, and operations with an industry-leading free tier and intuitive UX.",
    is_featured: true,
    is_editors_pick: true,
    pricing_tiers: [
      { name: "Free", price: "$0" },
      { name: "Starter", price: "$20/mo/seat" },
      { name: "Professional", price: "$100/mo/seat" },
      { name: "Enterprise", price: "$150/mo/seat" },
    ],
    metrics: [
      { label: "Ease of Use", value: 95 },
      { label: "Features", value: 88 },
      { label: "Support", value: 92 },
      { label: "Value", value: 75 },
    ],
  },
  {
    name: "Salesforce",
    slug: "salesforce",
    category: "CRM Software",
    logo_url: "/logos/salesforce.svg",
    official_url: "https://www.salesforce.com",
    overall_score: 9.6,
    rating_label: "Exceptional",
    short_description:
      "The enterprise CRM powerhouse with unmatched customisation, a massive app ecosystem, and Agentforce AI for complex sales organisations.",
    is_featured: true,
    is_editors_pick: false,
    pricing_tiers: [
      { name: "Starter", price: "$25/mo/user" },
      { name: "Pro Suite", price: "$100/mo/user" },
      { name: "Enterprise", price: "$175/mo/user" },
      { name: "Unlimited", price: "$350/mo/user" },
    ],
    metrics: [
      { label: "Customization", value: 98 },
      { label: "Scalability", value: 96 },
      { label: "Integration", value: 94 },
      { label: "Complexity", value: 45 },
    ],
  },
  {
    name: "Pipedrive",
    slug: "pipedrive",
    category: "CRM Software",
    logo_url: "/logos/pipedrive.svg",
    official_url: "https://www.pipedrive.com",
    overall_score: 8.8,
    rating_label: "Excellent",
    short_description:
      "A sales-focused CRM designed for small teams that want a visual pipeline, dead-simple UX, and powerful automation without the bloat.",
    is_featured: false,
    is_editors_pick: false,
    pricing_tiers: [
      { name: "Essential", price: "$14/mo" },
      { name: "Advanced", price: "$34/mo" },
      { name: "Professional", price: "$49/mo" },
      { name: "Power", price: "$64/mo" },
      { name: "Enterprise", price: "$99/mo" },
    ],
    metrics: [
      { label: "UX", value: 90 },
      { label: "Pipeline", value: 94 },
      { label: "Value", value: 85 },
    ],
  },
  {
    name: "Zoho CRM",
    slug: "zoho-crm",
    category: "CRM Software",
    logo_url: "/logos/zoho.svg",
    official_url: "https://www.zoho.com/crm",
    overall_score: 8.4,
    rating_label: "Very Good",
    short_description:
      "A feature-rich CRM with exceptional value for money, deep customisation, and a sprawling suite of 50+ integrated Zoho apps.",
    is_featured: false,
    is_editors_pick: false,
    pricing_tiers: [
      { name: "Standard", price: "$14/mo" },
      { name: "Professional", price: "$23/mo" },
      { name: "Enterprise", price: "$40/mo" },
      { name: "Ultimate", price: "$52/mo" },
    ],
    metrics: [
      { label: "Features", value: 88 },
      { label: "Value", value: 95 },
      { label: "Support", value: 80 },
    ],
  },
  {
    name: "Attio",
    slug: "attio",
    category: "CRM Software",
    logo_url: "/logos/attio.svg",
    official_url: "https://attio.com",
    overall_score: 8.9,
    rating_label: "Excellent",
    short_description:
      "A next-generation CRM that combines the flexibility of a spreadsheet with the power of a relationship graph to map how your business connects.",
    is_featured: false,
    is_editors_pick: false,
    pricing_tiers: [
      { name: "Free", price: "$0" },
      { name: "Plus", price: "$29/mo" },
      { name: "Pro", price: "$59/mo" },
      { name: "Enterprise", price: "Custom" },
    ],
    metrics: [
      { label: "UX Quality", value: 90 },
      { label: "Integrations", value: 85 },
      { label: "Value", value: 78 },
    ],
  },
  {
    name: "Close",
    slug: "close",
    category: "CRM Software",
    logo_url: "/logos/close.svg",
    official_url: "https://www.close.com",
    overall_score: 8.5,
    rating_label: "Excellent",
    short_description:
      "A CRM built for inside sales teams with built-in calling, SMS, email sequences, and a ruthless focus on helping reps close more deals faster.",
    is_featured: false,
    is_editors_pick: false,
    pricing_tiers: [
      { name: "Startup", price: "$49/mo" },
      { name: "Professional", price: "$99/mo" },
      { name: "Enterprise", price: "$139/mo" },
    ],
    metrics: [
      { label: "Sales Focus", value: 96 },
      { label: "Built-in Comms", value: 94 },
      { label: "Ease of Use", value: 88 },
      { label: "Value", value: 80 },
    ],
  },

  // ── Project Management ────────────────────────────────────────────────
  {
    name: "Linear",
    slug: "linear",
    category: "Project Management",
    logo_url: "/logos/linear.svg",
    official_url: "https://linear.app",
    overall_score: 9.4,
    rating_label: "Exceptional",
    short_description:
      "The gold standard issue tracker for modern engineering teams, built for speed with keyboard-first navigation and opinionated workflows.",
    is_featured: true,
    is_editors_pick: true,
    pricing_tiers: [
      { name: "Free", price: "$0" },
      { name: "Standard", price: "$8/mo/user" },
      { name: "Plus", price: "$14/mo/user" },
      { name: "Enterprise", price: "Custom" },
    ],
    metrics: [
      { label: "Interface", value: 98 },
      { label: "Features", value: 92 },
      { label: "Velocity", value: 95 },
      { label: "Value", value: 90 },
    ],
  },
  {
    name: "Notion",
    slug: "notion",
    category: "Project Management",
    logo_url: "/logos/notion.svg",
    official_url: "https://www.notion.so",
    overall_score: 8.6,
    rating_label: "Excellent",
    short_description:
      "The connected workspace that blends docs, databases, wikis, and project tracking into a single, endlessly flexible canvas.",
    is_featured: false,
    is_editors_pick: false,
    pricing_tiers: [
      { name: "Free", price: "$0" },
      { name: "Plus", price: "$10/mo" },
      { name: "Business", price: "$18/mo" },
      { name: "Enterprise", price: "Custom" },
    ],
    metrics: [
      { label: "Flexibility", value: 95 },
      { label: "Collaboration", value: 88 },
      { label: "Performance", value: 78 },
      { label: "Value", value: 88 },
    ],
  },
  {
    name: "Asana",
    slug: "asana",
    category: "Project Management",
    logo_url: "/logos/asana.svg",
    official_url: "https://asana.com",
    overall_score: 7.9,
    rating_label: "Good",
    short_description:
      "An enterprise-grade work management platform with robust portfolios, goals tracking, and cross-team visibility for large organisations.",
    is_featured: false,
    is_editors_pick: false,
    pricing_tiers: [
      { name: "Personal", price: "$0" },
      { name: "Starter", price: "$10.99/mo" },
      { name: "Advanced", price: "$24.99/mo" },
      { name: "Enterprise", price: "Custom" },
    ],
    metrics: [
      { label: "Scale", value: 95 },
      { label: "Complexity", value: 80 },
      { label: "Flexibility", value: 75 },
      { label: "Value", value: 72 },
    ],
  },
  {
    name: "ClickUp",
    slug: "clickup",
    category: "Project Management",
    logo_url: "/logos/clickup.svg",
    official_url: "https://clickup.com",
    overall_score: 8.3,
    rating_label: "Very Good",
    short_description:
      "The everything app for work: tasks, docs, whiteboards, chat, and goals in a single platform that tries to replace your entire tool stack.",
    is_featured: false,
    is_editors_pick: false,
    pricing_tiers: [
      { name: "Free", price: "$0" },
      { name: "Unlimited", price: "$7/mo/user" },
      { name: "Business", price: "$12/mo/user" },
      { name: "Enterprise", price: "Custom" },
    ],
    metrics: [
      { label: "Features", value: 96 },
      { label: "Value", value: 92 },
      { label: "Ease of Use", value: 72 },
      { label: "Performance", value: 70 },
    ],
  },
  {
    name: "Jira",
    slug: "jira",
    category: "Project Management",
    logo_url: "/logos/jira.svg",
    official_url: "https://www.atlassian.com/software/jira",
    overall_score: 8.0,
    rating_label: "Very Good",
    short_description:
      "The original agile project management tool with deep Scrum/Kanban support, 3,000+ marketplace integrations, and enterprise-scale configurability.",
    is_featured: false,
    is_editors_pick: false,
    pricing_tiers: [
      { name: "Free", price: "$0 (10 users)" },
      { name: "Standard", price: "$8.60/mo/user" },
      { name: "Premium", price: "$17/mo/user" },
      { name: "Enterprise", price: "Custom" },
    ],
    metrics: [
      { label: "Agile Support", value: 96 },
      { label: "Integrations", value: 94 },
      { label: "Ease of Use", value: 62 },
      { label: "Performance", value: 68 },
    ],
  },
  {
    name: "Monday.com",
    slug: "monday",
    category: "Project Management",
    logo_url: "/logos/monday.svg",
    official_url: "https://monday.com",
    overall_score: 8.1,
    rating_label: "Very Good",
    short_description:
      "A colourful, visual work OS that makes project management accessible to non-technical teams with drag-and-drop automations and 200+ integrations.",
    is_featured: false,
    is_editors_pick: false,
    pricing_tiers: [
      { name: "Free", price: "$0 (2 users)" },
      { name: "Basic", price: "$12/mo/seat" },
      { name: "Standard", price: "$14/mo/seat" },
      { name: "Pro", price: "$27/mo/seat" },
      { name: "Enterprise", price: "Custom" },
    ],
    metrics: [
      { label: "Visual Design", value: 92 },
      { label: "Ease of Use", value: 90 },
      { label: "Automation", value: 85 },
      { label: "Depth", value: 74 },
    ],
  },

  // ── Marketing Automation ──────────────────────────────────────────────
  {
    name: "HubSpot Marketing Hub",
    slug: "hubspot-marketing",
    category: "Marketing Automation",
    logo_url: "/logos/hubspot.svg",
    official_url: "https://www.hubspot.com/products/marketing",
    overall_score: 9.0,
    rating_label: "Exceptional",
    short_description:
      "Enterprise-grade marketing automation with best-in-class visual workflow builder, CRM-native attribution, and AI-powered content tools.",
    is_featured: true,
    is_editors_pick: true,
    pricing_tiers: [
      { name: "Free", price: "$0" },
      { name: "Starter", price: "$20/mo" },
      { name: "Professional", price: "$890/mo" },
      { name: "Enterprise", price: "$3,600/mo" },
    ],
    metrics: [
      { label: "Automation", value: 94 },
      { label: "Analytics", value: 90 },
      { label: "Ease of Use", value: 92 },
      { label: "Value", value: 68 },
    ],
  },
  {
    name: "Mailchimp",
    slug: "mailchimp",
    category: "Marketing Automation",
    logo_url: "/logos/mailchimp.svg",
    official_url: "https://mailchimp.com",
    overall_score: 7.8,
    rating_label: "Good",
    short_description:
      "The email marketing icon that has expanded into a full marketing platform with landing pages, social ads, and AI-driven send-time optimisation.",
    is_featured: false,
    is_editors_pick: false,
    pricing_tiers: [
      { name: "Free", price: "$0 (500 contacts)" },
      { name: "Essentials", price: "$13/mo" },
      { name: "Standard", price: "$20/mo" },
      { name: "Premium", price: "$350/mo" },
    ],
    metrics: [
      { label: "Ease of Use", value: 88 },
      { label: "Email Tools", value: 82 },
      { label: "Automation", value: 70 },
      { label: "Value", value: 72 },
    ],
  },
  {
    name: "ActiveCampaign",
    slug: "activecampaign",
    category: "Marketing Automation",
    logo_url: "/logos/activecampaign.svg",
    official_url: "https://www.activecampaign.com",
    overall_score: 8.6,
    rating_label: "Excellent",
    short_description:
      "Powerful email and marketing automation with best-in-class conditional logic, CRM, and machine-learning-driven predictive sending.",
    is_featured: false,
    is_editors_pick: false,
    pricing_tiers: [
      { name: "Starter", price: "$15/mo" },
      { name: "Plus", price: "$49/mo" },
      { name: "Pro", price: "$79/mo" },
      { name: "Enterprise", price: "$145/mo" },
    ],
    metrics: [
      { label: "Automation Depth", value: 96 },
      { label: "Deliverability", value: 92 },
      { label: "CRM", value: 80 },
      { label: "Value", value: 88 },
    ],
  },
  {
    name: "Klaviyo",
    slug: "klaviyo",
    category: "Marketing Automation",
    logo_url: "/logos/klaviyo.svg",
    official_url: "https://www.klaviyo.com",
    overall_score: 8.7,
    rating_label: "Excellent",
    short_description:
      "The e-commerce marketing powerhouse with deep Shopify integration, predictive analytics, and revenue-attributed email and SMS campaigns.",
    is_featured: false,
    is_editors_pick: false,
    pricing_tiers: [
      { name: "Free", price: "$0 (250 contacts)" },
      { name: "Email", price: "$20/mo" },
      { name: "Email + SMS", price: "$35/mo" },
    ],
    metrics: [
      { label: "E-commerce", value: 98 },
      { label: "Segmentation", value: 95 },
      { label: "Analytics", value: 90 },
      { label: "Value", value: 82 },
    ],
  },
  {
    name: "Brevo",
    slug: "brevo",
    category: "Marketing Automation",
    logo_url: "/logos/brevo.svg",
    official_url: "https://www.brevo.com",
    overall_score: 8.0,
    rating_label: "Very Good",
    short_description:
      "Formerly Sendinblue, Brevo offers affordable multi-channel marketing with email, SMS, WhatsApp, and chat in a single platform.",
    is_featured: false,
    is_editors_pick: false,
    pricing_tiers: [
      { name: "Free", price: "$0 (300 emails/day)" },
      { name: "Starter", price: "$9/mo" },
      { name: "Business", price: "$18/mo" },
      { name: "Enterprise", price: "Custom" },
    ],
    metrics: [
      { label: "Value", value: 94 },
      { label: "Multi-Channel", value: 88 },
      { label: "Automation", value: 78 },
      { label: "Ease of Use", value: 85 },
    ],
  },

  // ── Analytics ─────────────────────────────────────────────────────────
  {
    name: "PostHog",
    slug: "posthog",
    category: "Analytics",
    logo_url: "/logos/posthog.svg",
    official_url: "https://posthog.com",
    overall_score: 9.0,
    rating_label: "Exceptional",
    short_description:
      "The open-source product analytics suite with session replay, feature flags, A/B testing, and a data warehouse — all self-hostable.",
    is_featured: true,
    is_editors_pick: true,
    pricing_tiers: [
      { name: "Free", price: "$0 (1M events)" },
      { name: "Pay-as-you-go", price: "Usage-based" },
    ],
    metrics: [
      { label: "Flexibility", value: 94 },
      { label: "Features", value: 92 },
      { label: "Transparency", value: 98 },
      { label: "Value", value: 90 },
    ],
  },
  {
    name: "Amplitude",
    slug: "amplitude",
    category: "Analytics",
    logo_url: "/logos/amplitude.svg",
    official_url: "https://amplitude.com",
    overall_score: 8.7,
    rating_label: "Excellent",
    short_description:
      "Enterprise-grade product analytics with best-in-class behavioural cohorts, predictive analytics, and AI-powered insight discovery.",
    is_featured: false,
    is_editors_pick: false,
    pricing_tiers: [
      { name: "Starter", price: "$0 (50K MTUs)" },
      { name: "Plus", price: "$49/mo" },
      { name: "Growth", price: "Custom" },
      { name: "Enterprise", price: "Custom" },
    ],
    metrics: [
      { label: "Cohort Analysis", value: 96 },
      { label: "Ease of Use", value: 85 },
      { label: "Enterprise", value: 92 },
      { label: "Value", value: 75 },
    ],
  },
  {
    name: "Mixpanel",
    slug: "mixpanel",
    category: "Analytics",
    logo_url: "/logos/mixpanel.svg",
    official_url: "https://mixpanel.com",
    overall_score: 8.5,
    rating_label: "Excellent",
    short_description:
      "Event-based product analytics with powerful funnels, retention analysis, and a generous free tier of 20M events per month.",
    is_featured: false,
    is_editors_pick: false,
    pricing_tiers: [
      { name: "Free", price: "$0 (20M events)" },
      { name: "Growth", price: "$20/mo" },
      { name: "Enterprise", price: "Custom" },
    ],
    metrics: [
      { label: "Event Analytics", value: 92 },
      { label: "Funnels", value: 94 },
      { label: "Ease of Use", value: 86 },
      { label: "Value", value: 90 },
    ],
  },
  {
    name: "Hotjar",
    slug: "hotjar",
    category: "Analytics",
    logo_url: "/logos/hotjar.svg",
    official_url: "https://www.hotjar.com",
    overall_score: 8.1,
    rating_label: "Very Good",
    short_description:
      "Heatmaps, session recordings, and user feedback tools that show you exactly how visitors experience your website.",
    is_featured: false,
    is_editors_pick: false,
    pricing_tiers: [
      { name: "Basic", price: "$0" },
      { name: "Plus", price: "$32/mo" },
      { name: "Business", price: "$80/mo" },
      { name: "Scale", price: "$171/mo" },
    ],
    metrics: [
      { label: "Heatmaps", value: 96 },
      { label: "Session Replay", value: 88 },
      { label: "Ease of Use", value: 94 },
      { label: "Depth", value: 70 },
    ],
  },
  {
    name: "Heap",
    slug: "heap",
    category: "Analytics",
    logo_url: "/logos/heap.svg",
    official_url: "https://www.heap.io",
    overall_score: 8.3,
    rating_label: "Very Good",
    short_description:
      "Auto-capture analytics that retroactively tracks every user interaction without manual event instrumentation — ideal for lean teams.",
    is_featured: false,
    is_editors_pick: false,
    pricing_tiers: [
      { name: "Free", price: "$0 (10K sessions)" },
      { name: "Growth", price: "Custom" },
      { name: "Pro", price: "Custom" },
      { name: "Premier", price: "Custom" },
    ],
    metrics: [
      { label: "Auto-Capture", value: 98 },
      { label: "Ease of Setup", value: 95 },
      { label: "Analysis Depth", value: 82 },
      { label: "Value", value: 76 },
    ],
  },

  // ── HR Software ───────────────────────────────────────────────────────
  {
    name: "Rippling",
    slug: "rippling",
    category: "HR Software",
    logo_url: "/logos/rippling.svg",
    official_url: "https://www.rippling.com",
    overall_score: 9.1,
    rating_label: "Exceptional",
    short_description:
      "A unified workforce platform that connects HR, IT, and finance so companies can manage payroll, benefits, devices, and apps from one system.",
    is_featured: true,
    is_editors_pick: true,
    pricing_tiers: [
      { name: "Core", price: "$8/mo/employee" },
      { name: "Pro", price: "$12/mo/employee" },
      { name: "Unlimited", price: "Custom" },
    ],
    metrics: [
      { label: "Automation", value: 96 },
      { label: "Breadth", value: 94 },
      { label: "Onboarding", value: 90 },
      { label: "Value", value: 82 },
    ],
  },
  {
    name: "Gusto",
    slug: "gusto",
    category: "HR Software",
    logo_url: "/logos/gusto.svg",
    official_url: "https://gusto.com",
    overall_score: 8.6,
    rating_label: "Excellent",
    short_description:
      "The small business HR favourite with dead-simple payroll, benefits administration, and compliance tools designed for teams under 100.",
    is_featured: false,
    is_editors_pick: false,
    pricing_tiers: [
      { name: "Simple", price: "$40/mo + $6/person" },
      { name: "Plus", price: "$80/mo + $12/person" },
      { name: "Premium", price: "Custom" },
    ],
    metrics: [
      { label: "Payroll", value: 95 },
      { label: "Ease of Use", value: 94 },
      { label: "Benefits", value: 88 },
      { label: "Scalability", value: 68 },
    ],
  },
  {
    name: "BambooHR",
    slug: "bamboohr",
    category: "HR Software",
    logo_url: "/logos/bamboohr.svg",
    official_url: "https://www.bamboohr.com",
    overall_score: 8.2,
    rating_label: "Very Good",
    short_description:
      "A people-first HRIS with intuitive employee self-service, performance management, and reporting for mid-size companies.",
    is_featured: false,
    is_editors_pick: false,
    pricing_tiers: [
      { name: "Core", price: "$6/mo/employee" },
      { name: "Pro", price: "$8/mo/employee" },
    ],
    metrics: [
      { label: "Employee Experience", value: 92 },
      { label: "Ease of Use", value: 90 },
      { label: "Reporting", value: 80 },
      { label: "Value", value: 84 },
    ],
  },
  {
    name: "Deel",
    slug: "deel",
    category: "HR Software",
    logo_url: "/logos/deel.svg",
    official_url: "https://www.deel.com",
    overall_score: 8.8,
    rating_label: "Excellent",
    short_description:
      "The global payroll and compliance leader for distributed teams, handling contractor payments and EOR in 150+ countries from a single dashboard.",
    is_featured: false,
    is_editors_pick: false,
    pricing_tiers: [
      { name: "Deel HR", price: "$5/mo/employee" },
      { name: "Contractors", price: "$49/mo" },
      { name: "EOR", price: "$599/mo" },
      { name: "Global Payroll", price: "$29/mo/employee" },
    ],
    metrics: [
      { label: "Global Coverage", value: 98 },
      { label: "Compliance", value: 96 },
      { label: "Ease of Use", value: 88 },
      { label: "Value", value: 80 },
    ],
  },

  // ── DevTools ──────────────────────────────────────────────────────────
  {
    name: "Vercel",
    slug: "vercel",
    category: "DevTools",
    logo_url: "/logos/vercel.svg",
    official_url: "https://vercel.com",
    overall_score: 9.3,
    rating_label: "Exceptional",
    short_description:
      "The frontend cloud for Next.js and React with edge-first architecture, instant previews, and AI-powered developer tooling.",
    is_featured: true,
    is_editors_pick: true,
    pricing_tiers: [
      { name: "Hobby", price: "$0 (non-commercial)" },
      { name: "Pro", price: "$20/mo/member" },
      { name: "Enterprise", price: "Custom" },
    ],
    metrics: [
      { label: "DX", value: 98 },
      { label: "Performance", value: 96 },
      { label: "Next.js Fit", value: 99 },
      { label: "Value", value: 82 },
    ],
  },
  {
    name: "Supabase",
    slug: "supabase",
    category: "DevTools",
    logo_url: "/logos/supabase.svg",
    official_url: "https://supabase.com",
    overall_score: 9.0,
    rating_label: "Exceptional",
    short_description:
      "The open-source Firebase alternative with Postgres, real-time subscriptions, auth, storage, and edge functions — all self-hostable.",
    is_featured: false,
    is_editors_pick: false,
    pricing_tiers: [
      { name: "Free", price: "$0 (500MB DB)" },
      { name: "Pro", price: "$25/mo" },
      { name: "Team", price: "$599/mo" },
      { name: "Enterprise", price: "Custom" },
    ],
    metrics: [
      { label: "Open Source", value: 98 },
      { label: "Features", value: 92 },
      { label: "DX", value: 94 },
      { label: "Value", value: 92 },
    ],
  },
  {
    name: "Retool",
    slug: "retool",
    category: "DevTools",
    logo_url: "/logos/retool.svg",
    official_url: "https://retool.com",
    overall_score: 8.5,
    rating_label: "Excellent",
    short_description:
      "The fastest way to build internal tools. Drag-and-drop UI components connected to any database or API, with JavaScript for custom logic.",
    is_featured: false,
    is_editors_pick: false,
    pricing_tiers: [
      { name: "Free", price: "$0 (5 users)" },
      { name: "Team", price: "$10/mo/user" },
      { name: "Business", price: "$50/mo/user" },
      { name: "Enterprise", price: "Custom" },
    ],
    metrics: [
      { label: "Speed to Build", value: 96 },
      { label: "Data Sources", value: 94 },
      { label: "Customization", value: 82 },
      { label: "Value", value: 78 },
    ],
  },
  {
    name: "Netlify",
    slug: "netlify",
    category: "DevTools",
    logo_url: "/logos/netlify.svg",
    official_url: "https://www.netlify.com",
    overall_score: 8.4,
    rating_label: "Very Good",
    short_description:
      "A composable web platform with broad framework support, form handling, edge functions, and a generous free tier for commercial projects.",
    is_featured: false,
    is_editors_pick: false,
    pricing_tiers: [
      { name: "Free", price: "$0 (commercial OK)" },
      { name: "Pro", price: "$19/mo/member" },
      { name: "Enterprise", price: "Custom" },
    ],
    metrics: [
      { label: "Framework Support", value: 94 },
      { label: "Free Tier", value: 96 },
      { label: "DX", value: 88 },
      { label: "Performance", value: 84 },
    ],
  },
  {
    name: "Railway",
    slug: "railway",
    category: "DevTools",
    logo_url: "/logos/railway.svg",
    official_url: "https://railway.app",
    overall_score: 8.6,
    rating_label: "Excellent",
    short_description:
      "Infrastructure made simple: deploy any app, database, or service with zero config. The modern Heroku alternative indie developers love.",
    is_featured: false,
    is_editors_pick: false,
    pricing_tiers: [
      { name: "Trial", price: "$0 ($5 credit)" },
      { name: "Hobby", price: "$5/mo" },
      { name: "Pro", price: "$20/mo/seat" },
      { name: "Enterprise", price: "Custom" },
    ],
    metrics: [
      { label: "Simplicity", value: 96 },
      { label: "DX", value: 94 },
      { label: "Database Support", value: 90 },
      { label: "Value", value: 88 },
    ],
  },

  // ── Customer Service ──────────────────────────────────────────────────
  {
    name: "Intercom",
    slug: "intercom",
    category: "Customer Service",
    logo_url: "/logos/intercom.svg",
    official_url: "https://www.intercom.com",
    overall_score: 8.7,
    rating_label: "Excellent",
    short_description:
      "AI-first customer service platform with the Fin AI agent, conversational support, proactive messaging, and deep product-led growth features.",
    is_featured: true,
    is_editors_pick: false,
    pricing_tiers: [
      { name: "Essential", price: "$29/mo/seat" },
      { name: "Advanced", price: "$85/mo/seat" },
      { name: "Expert", price: "$132/mo/seat" },
    ],
    metrics: [
      { label: "AI Support", value: 96 },
      { label: "Messaging", value: 94 },
      { label: "Integration", value: 84 },
      { label: "Value", value: 68 },
    ],
  },
  {
    name: "Zendesk",
    slug: "zendesk",
    category: "Customer Service",
    logo_url: "/logos/zendesk.svg",
    official_url: "https://www.zendesk.com",
    overall_score: 8.4,
    rating_label: "Very Good",
    short_description:
      "The enterprise help desk standard with omnichannel ticketing, AI automation, and deep customisation for high-volume support teams.",
    is_featured: false,
    is_editors_pick: false,
    pricing_tiers: [
      { name: "Support Team", price: "$19/mo/agent" },
      { name: "Suite Team", price: "$55/mo/agent" },
      { name: "Suite Pro", price: "$115/mo/agent" },
      { name: "Suite Enterprise", price: "$169/mo/agent" },
    ],
    metrics: [
      { label: "Ticketing", value: 96 },
      { label: "Omnichannel", value: 92 },
      { label: "Scalability", value: 94 },
      { label: "Ease of Use", value: 72 },
    ],
  },
  {
    name: "Freshdesk",
    slug: "freshdesk",
    category: "Customer Service",
    logo_url: "/logos/freshdesk.svg",
    official_url: "https://www.freshworks.com/freshdesk",
    overall_score: 8.2,
    rating_label: "Very Good",
    short_description:
      "Affordable, intuitive help desk software with AI ticketing, multi-channel support, and a generous free plan for small teams.",
    is_featured: false,
    is_editors_pick: false,
    pricing_tiers: [
      { name: "Free", price: "$0 (2 agents)" },
      { name: "Growth", price: "$19/mo/agent" },
      { name: "Pro", price: "$49/mo/agent" },
      { name: "Enterprise", price: "$79/mo/agent" },
    ],
    metrics: [
      { label: "Value", value: 94 },
      { label: "Ease of Use", value: 90 },
      { label: "AI Features", value: 80 },
      { label: "Customization", value: 76 },
    ],
  },
  {
    name: "Help Scout",
    slug: "help-scout",
    category: "Customer Service",
    logo_url: "/logos/helpscout.svg",
    official_url: "https://www.helpscout.com",
    overall_score: 8.5,
    rating_label: "Excellent",
    short_description:
      "A human-friendly help desk that feels like email, with shared inboxes, knowledge base, and beacon widget for customer self-service.",
    is_featured: false,
    is_editors_pick: false,
    pricing_tiers: [
      { name: "Free", price: "$0 (up to 50 contacts)" },
      { name: "Standard", price: "$25/mo/user" },
      { name: "Plus", price: "$50/mo/user" },
      { name: "Pro", price: "Custom" },
    ],
    metrics: [
      { label: "Simplicity", value: 96 },
      { label: "Email UX", value: 94 },
      { label: "Knowledge Base", value: 88 },
      { label: "Value", value: 86 },
    ],
  },

  // ── Communication ─────────────────────────────────────────────────────
  {
    name: "Slack",
    slug: "slack",
    category: "Communication",
    logo_url: "/logos/slack.svg",
    official_url: "https://slack.com",
    overall_score: 9.0,
    rating_label: "Exceptional",
    short_description:
      "The productivity hub that connects your people, tools, and knowledge with real-time messaging, AI-powered search, and 2,600+ integrations.",
    is_featured: true,
    is_editors_pick: true,
    pricing_tiers: [
      { name: "Free", price: "$0" },
      { name: "Pro", price: "$7.25/mo/user" },
      { name: "Business+", price: "$12.50/mo/user" },
      { name: "Enterprise Grid", price: "Custom" },
    ],
    metrics: [
      { label: "Integrations", value: 98 },
      { label: "UX", value: 94 },
      { label: "AI Features", value: 86 },
      { label: "Value", value: 82 },
    ],
  },
  {
    name: "Loom",
    slug: "loom",
    category: "Communication",
    logo_url: "/logos/loom.svg",
    official_url: "https://www.loom.com",
    overall_score: 8.4,
    rating_label: "Very Good",
    short_description:
      "Async video messaging that replaces meetings with quick screen recordings. AI-powered transcription, chapters, and task extraction included.",
    is_featured: false,
    is_editors_pick: false,
    pricing_tiers: [
      { name: "Starter", price: "$0 (25 videos)" },
      { name: "Business", price: "$15/mo/creator" },
      { name: "Enterprise", price: "Custom" },
    ],
    metrics: [
      { label: "Ease of Use", value: 96 },
      { label: "Async Value", value: 92 },
      { label: "AI Features", value: 84 },
      { label: "Integrations", value: 80 },
    ],
  },
  {
    name: "Zoom",
    slug: "zoom",
    category: "Communication",
    logo_url: "/logos/zoom.svg",
    official_url: "https://zoom.us",
    overall_score: 8.2,
    rating_label: "Very Good",
    short_description:
      "The video conferencing standard for businesses, now expanding into a full collaboration platform with Team Chat, Whiteboard, and AI Companion.",
    is_featured: false,
    is_editors_pick: false,
    pricing_tiers: [
      { name: "Basic", price: "$0 (40 min)" },
      { name: "Pro", price: "$13.33/mo/user" },
      { name: "Business", price: "$21.99/mo/user" },
      { name: "Enterprise", price: "Custom" },
    ],
    metrics: [
      { label: "Video Quality", value: 94 },
      { label: "Reliability", value: 92 },
      { label: "Features", value: 86 },
      { label: "Value", value: 80 },
    ],
  },
  {
    name: "Microsoft Teams",
    slug: "microsoft-teams",
    category: "Communication",
    logo_url: "/logos/teams.svg",
    official_url: "https://www.microsoft.com/en-us/microsoft-teams",
    overall_score: 8.0,
    rating_label: "Very Good",
    short_description:
      "Microsoft's all-in-one collaboration hub with chat, video, file sharing, and deep Microsoft 365 integration for enterprise teams.",
    is_featured: false,
    is_editors_pick: false,
    pricing_tiers: [
      { name: "Free", price: "$0" },
      { name: "Essentials", price: "$4/mo/user" },
      { name: "Business Basic", price: "$6/mo/user" },
      { name: "Enterprise", price: "$8.55/mo/user" },
    ],
    metrics: [
      { label: "M365 Integration", value: 98 },
      { label: "Video", value: 90 },
      { label: "Chat UX", value: 72 },
      { label: "Value", value: 92 },
    ],
  },

  // ── Design Systems ────────────────────────────────────────────────────
  {
    name: "Figma",
    slug: "figma",
    category: "Design Systems",
    logo_url: "/logos/figma.svg",
    official_url: "https://www.figma.com",
    overall_score: 9.5,
    rating_label: "Exceptional",
    short_description:
      "The industry-standard collaborative design platform with real-time multiplayer editing, Dev Mode, Variables, and the new Figma Sites for publishing.",
    is_featured: true,
    is_editors_pick: true,
    pricing_tiers: [
      { name: "Free", price: "$0 (3 projects)" },
      { name: "Professional", price: "$16/mo/seat" },
      { name: "Organization", price: "$55/mo/seat" },
      { name: "Enterprise", price: "$90/mo/seat" },
    ],
    metrics: [
      { label: "Collaboration", value: 99 },
      { label: "Design Tools", value: 96 },
      { label: "Dev Handoff", value: 92 },
      { label: "Value", value: 85 },
    ],
  },
  {
    name: "Framer",
    slug: "framer",
    category: "Design Systems",
    logo_url: "/logos/framer.svg",
    official_url: "https://www.framer.com",
    overall_score: 9.0,
    rating_label: "Exceptional",
    short_description:
      "A design-to-production website builder that lets creative teams ship stunning, high-performance marketing sites without writing code.",
    is_featured: false,
    is_editors_pick: false,
    pricing_tiers: [
      { name: "Free", price: "$0" },
      { name: "Mini", price: "$5/mo" },
      { name: "Basic", price: "$15/mo" },
      { name: "Pro", price: "$30/mo" },
    ],
    metrics: [
      { label: "Creativity", value: 99 },
      { label: "Performance", value: 92 },
      { label: "CMS", value: 84 },
      { label: "Ease of Use", value: 90 },
    ],
  },
  {
    name: "Webflow",
    slug: "webflow",
    category: "Design Systems",
    logo_url: "/logos/webflow.svg",
    official_url: "https://webflow.com",
    overall_score: 8.7,
    rating_label: "Excellent",
    short_description:
      "A visual web development platform that gives designers the power of code without writing it — HTML, CSS, and JS generated visually.",
    is_featured: false,
    is_editors_pick: false,
    pricing_tiers: [
      { name: "Free", price: "$0 (staging only)" },
      { name: "Basic", price: "$14/mo" },
      { name: "CMS", price: "$23/mo" },
      { name: "Business", price: "$39/mo" },
      { name: "Enterprise", price: "Custom" },
    ],
    metrics: [
      { label: "Visual Power", value: 96 },
      { label: "CMS", value: 92 },
      { label: "Code Quality", value: 88 },
      { label: "Learning Curve", value: 65 },
    ],
  },
  {
    name: "Canva",
    slug: "canva",
    category: "Design Systems",
    logo_url: "/logos/canva.svg",
    official_url: "https://www.canva.com",
    overall_score: 8.3,
    rating_label: "Very Good",
    short_description:
      "The democratised design platform with templates for everything — social media, presentations, documents, and video — used by 190M+ monthly actives.",
    is_featured: false,
    is_editors_pick: false,
    pricing_tiers: [
      { name: "Free", price: "$0" },
      { name: "Pro", price: "$15/mo" },
      { name: "Teams", price: "$10/mo/person" },
      { name: "Enterprise", price: "Custom" },
    ],
    metrics: [
      { label: "Ease of Use", value: 98 },
      { label: "Templates", value: 96 },
      { label: "Collaboration", value: 84 },
      { label: "Design Depth", value: 62 },
    ],
  },

  // ── Data Analytics / BI ───────────────────────────────────────────────
  {
    name: "Tableau",
    slug: "tableau",
    category: "Data Analytics",
    logo_url: "/logos/tableau.svg",
    official_url: "https://www.tableau.com",
    overall_score: 8.8,
    rating_label: "Excellent",
    short_description:
      "The gold standard in data visualisation with drag-and-drop exploration, advanced analytics, and a massive community of 2M+ analysts.",
    is_featured: true,
    is_editors_pick: false,
    pricing_tiers: [
      { name: "Viewer", price: "$15/mo/user" },
      { name: "Explorer", price: "$42/mo/user" },
      { name: "Creator", price: "$75/mo/user" },
    ],
    metrics: [
      { label: "Visualization", value: 98 },
      { label: "Exploration", value: 96 },
      { label: "Community", value: 92 },
      { label: "Value", value: 70 },
    ],
  },
  {
    name: "Metabase",
    slug: "metabase",
    category: "Data Analytics",
    logo_url: "/logos/metabase.svg",
    official_url: "https://www.metabase.com",
    overall_score: 8.6,
    rating_label: "Excellent",
    short_description:
      "Open-source business intelligence that makes asking questions of your data as simple as writing a sentence. No SQL required.",
    is_featured: false,
    is_editors_pick: true,
    pricing_tiers: [
      { name: "Open Source", price: "$0 (self-hosted)" },
      { name: "Starter", price: "$85/mo (5 users)" },
      { name: "Pro", price: "$500/mo (10 users)" },
      { name: "Enterprise", price: "Custom" },
    ],
    metrics: [
      { label: "Ease of Use", value: 96 },
      { label: "Value", value: 98 },
      { label: "Self-Host", value: 94 },
      { label: "Enterprise", value: 72 },
    ],
  },
  {
    name: "Power BI",
    slug: "power-bi",
    category: "Data Analytics",
    logo_url: "/logos/powerbi.svg",
    official_url: "https://powerbi.microsoft.com",
    overall_score: 9.0,
    rating_label: "Exceptional",
    short_description:
      "Microsoft's business analytics powerhouse at $10/user/month — the #1-ranked BI tool by Gartner for 16 consecutive years.",
    is_featured: false,
    is_editors_pick: false,
    pricing_tiers: [
      { name: "Free", price: "$0 (Desktop)" },
      { name: "Pro", price: "$10/mo/user" },
      { name: "Premium", price: "$20/mo/user" },
      { name: "Premium Capacity", price: "$4,995/mo" },
    ],
    metrics: [
      { label: "Value", value: 98 },
      { label: "M365 Integration", value: 96 },
      { label: "DAX Power", value: 92 },
      { label: "Visual Quality", value: 84 },
    ],
  },
  {
    name: "Looker",
    slug: "looker",
    category: "Data Analytics",
    logo_url: "/logos/looker.svg",
    official_url: "https://cloud.google.com/looker",
    overall_score: 8.4,
    rating_label: "Very Good",
    short_description:
      "Google Cloud's enterprise BI platform with a modelled semantic layer (LookML) that ensures consistent metric definitions across the organisation.",
    is_featured: false,
    is_editors_pick: false,
    pricing_tiers: [
      { name: "Standard", price: "$2,000/mo" },
      { name: "Enterprise", price: "$5,000/mo+" },
      { name: "Embed", price: "Custom" },
    ],
    metrics: [
      { label: "Data Governance", value: 96 },
      { label: "Semantic Layer", value: 98 },
      { label: "Enterprise", value: 92 },
      { label: "Value", value: 60 },
    ],
  },

  // ── AI Platforms ──────────────────────────────────────────────────────
  {
    name: "Claude",
    slug: "claude",
    category: "AI Platforms",
    logo_url: "/logos/claude.svg",
    official_url: "https://claude.ai",
    overall_score: 9.5,
    rating_label: "Exceptional",
    short_description:
      "Anthropic's frontier AI assistant with industry-leading reasoning, coding, and analysis capabilities. Known for thoughtful, nuanced responses and a 200K token context window.",
    is_featured: true,
    is_editors_pick: true,
    pricing_tiers: [
      { name: "Free", price: "$0 (Sonnet)" },
      { name: "Pro", price: "$20/mo" },
      { name: "Max 5x", price: "$100/mo" },
      { name: "Max 20x", price: "$200/mo" },
      { name: "Team", price: "$25/seat/mo" },
      { name: "Enterprise", price: "Custom" },
    ],
    metrics: [
      { label: "Reasoning", value: 97 },
      { label: "Coding", value: 96 },
      { label: "Writing Quality", value: 98 },
      { label: "Value", value: 88 },
    ],
  },
  {
    name: "ChatGPT",
    slug: "chatgpt",
    category: "AI Platforms",
    logo_url: "/logos/chatgpt.svg",
    official_url: "https://chat.openai.com",
    overall_score: 9.3,
    rating_label: "Exceptional",
    short_description:
      "OpenAI's flagship AI assistant powering 400M+ weekly users. The most versatile AI platform with GPT-4o, image generation, voice mode, and the largest third-party plugin ecosystem.",
    is_featured: true,
    is_editors_pick: false,
    pricing_tiers: [
      { name: "Free", price: "$0 (GPT-4o mini)" },
      { name: "Plus", price: "$20/mo" },
      { name: "Pro", price: "$200/mo" },
      { name: "Team", price: "$25/user/mo" },
      { name: "Enterprise", price: "Custom" },
    ],
    metrics: [
      { label: "Versatility", value: 98 },
      { label: "Ecosystem", value: 97 },
      { label: "Multimodal", value: 95 },
      { label: "Value", value: 82 },
    ],
  },
  {
    name: "Google Gemini",
    slug: "gemini",
    category: "AI Platforms",
    logo_url: "/logos/gemini.svg",
    official_url: "https://gemini.google.com",
    overall_score: 9.0,
    rating_label: "Exceptional",
    short_description:
      "Google's multimodal AI with the industry's largest 1M token context window, native Google Workspace integration, and Gemini 2.5 Pro's best-in-class speed.",
    is_featured: true,
    is_editors_pick: false,
    pricing_tiers: [
      { name: "Free", price: "$0 (Flash)" },
      { name: "Advanced", price: "$19.99/mo" },
      { name: "Ultra", price: "$249.99/mo" },
      { name: "Business", price: "$14/user/mo" },
      { name: "Enterprise", price: "$30/user/mo" },
    ],
    metrics: [
      { label: "Speed", value: 96 },
      { label: "Context Window", value: 99 },
      { label: "Google Integration", value: 98 },
      { label: "Value", value: 85 },
    ],
  },
  {
    name: "Perplexity AI",
    slug: "perplexity",
    category: "AI Platforms",
    logo_url: "/logos/perplexity.svg",
    official_url: "https://www.perplexity.ai",
    overall_score: 8.8,
    rating_label: "Excellent",
    short_description:
      "The AI-powered answer engine that combines real-time web search with LLM synthesis. Every answer is cited with sources, making it the most trustworthy AI for research.",
    is_featured: false,
    is_editors_pick: true,
    pricing_tiers: [
      { name: "Free", price: "$0 (5 Pro/day)" },
      { name: "Pro", price: "$20/mo" },
      { name: "Max", price: "$200/mo" },
      { name: "Enterprise Pro", price: "$40/seat/mo" },
    ],
    metrics: [
      { label: "Research", value: 98 },
      { label: "Accuracy", value: 94 },
      { label: "Citations", value: 99 },
      { label: "Value", value: 90 },
    ],
  },
  {
    name: "Grok",
    slug: "grok",
    category: "AI Platforms",
    logo_url: "/logos/grok.svg",
    official_url: "https://x.com/i/grok",
    overall_score: 8.2,
    rating_label: "Very Good",
    short_description:
      "xAI's unfiltered AI assistant with real-time X/Twitter integration, image generation via Aurora, and a refreshingly direct personality. Best for trend analysis and social intelligence.",
    is_featured: false,
    is_editors_pick: false,
    pricing_tiers: [
      { name: "Free", price: "$0 (basic)" },
      { name: "SuperGrok Lite", price: "$10/mo" },
      { name: "SuperGrok", price: "$30/mo" },
      { name: "SuperGrok Heavy", price: "$300/mo" },
    ],
    metrics: [
      { label: "Real-time Data", value: 96 },
      { label: "Personality", value: 90 },
      { label: "Reasoning", value: 82 },
      { label: "Value", value: 78 },
    ],
  },
  {
    name: "GitHub Copilot",
    slug: "github-copilot",
    category: "AI Platforms",
    logo_url: "/logos/copilot.svg",
    official_url: "https://github.com/features/copilot",
    overall_score: 9.1,
    rating_label: "Exceptional",
    short_description:
      "The AI pair programmer that lives in your IDE. Inline completions, chat, and multi-file editing powered by GPT-4o and Claude — used by 15M+ developers worldwide.",
    is_featured: false,
    is_editors_pick: false,
    pricing_tiers: [
      { name: "Free", price: "$0 (2K completions/mo)" },
      { name: "Pro", price: "$10/mo" },
      { name: "Pro+", price: "$39/mo" },
      { name: "Business", price: "$19/user/mo" },
      { name: "Enterprise", price: "$39/user/mo" },
    ],
    metrics: [
      { label: "Code Completion", value: 96 },
      { label: "IDE Integration", value: 99 },
      { label: "Multi-Language", value: 94 },
      { label: "Value", value: 92 },
    ],
  },
  {
    name: "Mistral AI",
    slug: "mistral",
    category: "AI Platforms",
    logo_url: "/logos/mistral.svg",
    official_url: "https://chat.mistral.ai",
    overall_score: 8.4,
    rating_label: "Very Good",
    short_description:
      "Europe's leading AI lab offering powerful open-weight models and Le Chat, a free assistant. Mistral Large 2 competes with GPT-4o at significantly lower API costs.",
    is_featured: false,
    is_editors_pick: false,
    pricing_tiers: [
      { name: "Le Chat Free", price: "$0" },
      { name: "Le Chat Pro", price: "$14.99/mo" },
      { name: "API (Mistral Large)", price: "$2/M input tokens" },
      { name: "Enterprise", price: "Custom" },
    ],
    metrics: [
      { label: "Open Source", value: 96 },
      { label: "API Value", value: 94 },
      { label: "Multilingual", value: 92 },
      { label: "Ecosystem", value: 72 },
    ],
  },
  {
    name: "DeepSeek",
    slug: "deepseek",
    category: "AI Platforms",
    logo_url: "/logos/deepseek.svg",
    official_url: "https://chat.deepseek.com",
    overall_score: 8.6,
    rating_label: "Excellent",
    short_description:
      "The Chinese AI disruptor that shocked the industry with R1's reasoning capabilities rivalling o1 at a fraction of the cost. Fully open-source with MIT licence.",
    is_featured: false,
    is_editors_pick: false,
    pricing_tiers: [
      { name: "Chat", price: "$0" },
      { name: "API (DeepSeek-V3)", price: "$0.27/M input tokens" },
      { name: "API (R1)", price: "$0.55/M input tokens" },
    ],
    metrics: [
      { label: "Reasoning", value: 92 },
      { label: "Value", value: 99 },
      { label: "Open Source", value: 98 },
      { label: "Reliability", value: 68 },
    ],
  },
];

// ---------------------------------------------------------------------------
// Main seed function
// ---------------------------------------------------------------------------
async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB at", MONGO_URI);

    // Drop existing collections
    const collections = ["categories", "tools", "reviews", "comparisons", "blogposts"];
    for (const name of collections) {
      try {
        await mongoose.connection.db!.dropCollection(name);
        console.log(`  Dropped collection: ${name}`);
      } catch {
        console.log(`  Collection ${name} does not exist, skipping drop.`);
      }
    }

    // Insert categories
    console.log("\nSeeding categories...");
    const insertedCategories = await Category.insertMany(categories);
    console.log(`  Inserted ${insertedCategories.length} categories.`);

    // Insert tools
    console.log("\nSeeding tools...");
    const insertedTools = await Tool.insertMany(tools);
    console.log(`  Inserted ${insertedTools.length} tools.`);

    // Insert reviews
    console.log("\nSeeding reviews...");
    const insertedReviews = await Review.insertMany(reviews);
    console.log(`  Inserted ${insertedReviews.length} reviews.`);

    // Insert comparisons
    console.log("\nSeeding comparisons...");
    const insertedComparisons = await Comparison.insertMany(comparisons);
    console.log(`  Inserted ${insertedComparisons.length} comparisons.`);

    // Insert blog posts
    console.log("\nSeeding blog posts...");
    const insertedBlogPosts = await BlogPost.insertMany(blogPosts);
    console.log(`  Inserted ${insertedBlogPosts.length} blog posts.`);

    // Summary
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("  SEED COMPLETE");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`  Categories:   ${insertedCategories.length}`);
    console.log(`  Tools:        ${insertedTools.length}`);
    console.log(`  Reviews:      ${insertedReviews.length}`);
    console.log(`  Comparisons:  ${insertedComparisons.length}`);
    console.log(`  Blog Posts:   ${insertedBlogPosts.length}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

seed();
