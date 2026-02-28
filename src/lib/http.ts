import { NextResponse } from "next/server";
import type { ApiError } from "@/types/contracts";

export function errorResponse(
  code: string,
  message: string,
  status: number
): NextResponse<ApiError> {
  return NextResponse.json({ code, message }, { status });
}
