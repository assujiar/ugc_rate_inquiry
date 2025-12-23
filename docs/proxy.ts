import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

function getKeys() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  return { url, key };
}

export default async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Proxy hanya berjalan untuk /app/*
  const isApp = pathname.startsWith("/app");
  if (!isApp) return NextResponse.next();

  const isAppApi = pathname === "/app/api" || pathname.startsWith("/app/api/");

  const res = NextResponse.next();

  try {
    const { url, key } = getKeys();

    // Jangan hard-crash: kalau env belum ada, kembalikan JSON error untuk /app/api/*
    if (!url || !key) {
      if (isAppApi) {
        return NextResponse.json(
          {
            error: "missing_env",
            required: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"],
          },
          { status: 500 }
        );
      }
      return res;
    }

    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // hanya set ke response cookies (jangan mutasi request cookies)
          for (const { name, value, options } of cookiesToSet) {
            res.cookies.set(name, value, options);
          }
        },
      },
    });

    const { data } = await supabase.auth.getUser();
    const user = data?.user ?? null;

    // API di bawah /app/api/*: jika belum login, return 401 JSON (bukan redirect)
    if (isAppApi) {
      if (!user) return NextResponse.json({ user: null }, { status: 401 });
      return res;
    }

    // Page di bawah /app/* (selain /app/api): jika belum login, redirect ke /login
    if (!user) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("redirectTo", pathname + search);
      return NextResponse.redirect(loginUrl);
    }

    return res;
  } catch (e) {
    if (isAppApi) {
      return NextResponse.json(
        {
          error: "proxy_failed",
          message: e instanceof Error ? e.message : String(e),
        },
        { status: 500 }
      );
    }
    throw e;
  }
}

export const config = {
  matcher: ["/app/:path*"],
};
