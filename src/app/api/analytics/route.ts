import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const path = body.path || "/";

    await prisma.pageView.create({
      data: {
        path,
        userId: userId || null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error tracking page view:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalViews, todayViews, topPaths, viewsByDay, uniqueUsers] = await Promise.all([
      prisma.pageView.count(),
      prisma.pageView.count({
        where: { timestamp: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      }),
      prisma.pageView.groupBy({
        by: ["path"],
        _count: true,
        orderBy: { _count: { path: "desc" } },
        take: 10,
      }),
      prisma.$queryRaw`
        SELECT DATE(timestamp) as day, COUNT(*) as views
        FROM page_views
        WHERE timestamp >= ${thirtyDaysAgo}
        GROUP BY DATE(timestamp)
        ORDER BY day ASC
      `,
      prisma.pageView.groupBy({
        by: ["userId"],
        _count: true,
      }),
    ]);

    return NextResponse.json({
      totalViews,
      todayViews,
      uniqueUsers: uniqueUsers.length,
      topPaths: topPaths.map((p) => ({ path: p.path, views: p._count })),
      viewsByDay: JSON.parse(JSON.stringify(viewsByDay)),
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
