import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiError } from "@/lib/api";
import { getActivities, getSportTypes } from "@/lib/activityQueries";

const paramsSchema = z.object({
  search: z.string().trim().optional(),
  sport_type: z.string().trim().optional(),
  after: z.string().trim().optional(),
  before: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const params = paramsSchema.parse(searchParams);

    const [activities, sportTypes] = await Promise.all([
      getActivities({
        search: params.search || undefined,
        sportType: params.sport_type || undefined,
        after: params.after || undefined,
        before: params.before || undefined,
        limit: params.limit,
        offset: params.offset,
      }),
      getSportTypes(),
    ]);

    return NextResponse.json({
      activities,
      sportTypes,
      limit: params.limit,
      offset: params.offset,
    });
  } catch (error) {
    return apiError(error);
  }
}
