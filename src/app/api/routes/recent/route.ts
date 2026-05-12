import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiError } from "@/lib/api";
import { getRecentRoutes } from "@/lib/activityQueries";

const paramsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

export async function GET(request: NextRequest) {
  try {
    const params = paramsSchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    return NextResponse.json({ routes: await getRecentRoutes(params.limit) });
  } catch (error) {
    return apiError(error);
  }
}
