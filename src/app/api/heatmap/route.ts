import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiError } from "@/lib/api";
import { getHeatmapRoutes, getSportTypes } from "@/lib/activityQueries";

const paramsSchema = z.object({
  sport_type: z.string().trim().optional(),
  after: z.string().trim().optional(),
  before: z.string().trim().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const params = paramsSchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const [routes, sportTypes] = await Promise.all([
      getHeatmapRoutes({
        sportType: params.sport_type || undefined,
        after: params.after || undefined,
        before: params.before || undefined,
      }),
      getSportTypes(),
    ]);

    return NextResponse.json({ routes, sportTypes });
  } catch (error) {
    return apiError(error);
  }
}
