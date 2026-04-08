export interface Author {
  name: string;
  bio: string;
  image: string;
}

export const AUTHORS: Author[] = [
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

export function getRandomAuthor(): Author {
  return AUTHORS[Math.floor(Math.random() * AUTHORS.length)];
}
