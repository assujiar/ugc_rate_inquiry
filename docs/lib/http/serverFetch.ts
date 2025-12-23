import "server-only";
import { headers } from "next/headers";

export async function getRequestOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";

  if (host) return `${proto}://${host}`;
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function serverFetch(path: string, params?: Record<string, string | undefined>) {
  const origin = await getRequestOrigin();
  const url = new URL(path, origin);

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v) url.searchParams.set(k, v);
    }
  }

  const h = await headers();
  const cookie = h.get("cookie") ?? "";

  return fetch(url.toString(), {
    cache: "no-store",
    headers: cookie ? { cookie } : {},
  });
}
