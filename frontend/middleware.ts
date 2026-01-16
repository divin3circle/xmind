import { NextRequest, NextResponse } from "next/server";

// Optional: Add middleware for protected routes
// This runs before route handlers for specified paths
export function middleware(req: NextRequest) {
  // Example: Check authentication for protected routes
  const walletAddress = req.headers.get("x-wallet-address");

  // Add your authentication logic here
  // For now, just pass through
  return NextResponse.next();
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    // Add protected routes here
    "/api/agent/:path*",
    "/dashboard/:path*",
  ],
};
