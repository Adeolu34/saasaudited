import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import AuditLog from "@/lib/models/AuditLog";
import { requireApiRole } from "@/lib/auth/api-auth";

export async function GET() {
  const { error } = await requireApiRole("editor");
  if (error) return error;

  await dbConnect();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [recentErrors, recentLogs, dailyUsage] = await Promise.all([
    AuditLog.find({ type: "error" })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean(),
    AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean(),
    AuditLog.aggregate([
      { $match: { type: "api_request", createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  return NextResponse.json({ recentErrors, recentLogs, dailyUsage });
}
