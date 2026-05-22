import { NextResponse, type NextRequest } from "next/server";

const REALM = "Hatshelf Admin";

function unauthorized() {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": `Basic realm="${REALM}", charset="UTF-8"` },
  });
}

export function proxy(request: NextRequest) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return new NextResponse("ADMIN_PASSWORD not configured", { status: 503 });
  }

  const header = request.headers.get("authorization") ?? "";
  if (!header.toLowerCase().startsWith("basic ")) return unauthorized();

  let decoded: string;
  try {
    decoded = atob(header.slice(6).trim());
  } catch {
    return unauthorized();
  }
  const sep = decoded.indexOf(":");
  if (sep < 0) return unauthorized();
  const password = decoded.slice(sep + 1);
  if (password !== expected) return unauthorized();

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin", "/api/admin/:path*"],
};
