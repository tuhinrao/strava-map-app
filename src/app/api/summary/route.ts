import { NextResponse } from "next/server";
import { apiError } from "@/lib/api";
import { getSummary } from "@/lib/activityQueries";

export async function GET() {
  try {
    return NextResponse.json(await getSummary());
  } catch (error) {
    return apiError(error);
  }
}
