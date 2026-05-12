import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/api";
import { getActivityById } from "@/lib/activityQueries";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const activityId = Number(id);
    if (!Number.isFinite(activityId)) {
      return NextResponse.json({ error: "Invalid activity id" }, { status: 400 });
    }

    const activity = await getActivityById(activityId);
    if (!activity) {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    }

    return NextResponse.json(activity);
  } catch (error) {
    return apiError(error);
  }
}
