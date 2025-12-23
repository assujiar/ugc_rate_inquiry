import { NextResponse } from 'next/server';

/**
 * Simple health endpoint used for liveness checks. Returns a JSON
 * response with a status of `ok` and the current timestamp. This
 * endpoint does not require authentication.
 */
export async function GET() {
  return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
}