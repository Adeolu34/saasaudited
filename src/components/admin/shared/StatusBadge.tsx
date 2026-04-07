const statusStyles: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  approved: "bg-green-100 text-green-800",
  published: "bg-green-100 text-green-800",
  pending: "bg-amber-100 text-amber-800",
  rejected: "bg-red-100 text-red-800",
  spam: "bg-red-100 text-red-800",
  revoked: "bg-red-100 text-red-800",
  inactive: "bg-gray-100 text-gray-600",
  draft: "bg-gray-100 text-gray-600",
};

export default function StatusBadge({ status }: { status: string }) {
  const style = statusStyles[status.toLowerCase()] || "bg-gray-100 text-gray-600";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${style}`}
    >
      {status}
    </span>
  );
}
