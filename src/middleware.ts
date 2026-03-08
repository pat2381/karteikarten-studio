export { default } from "next-auth/middleware";

export const config = {
  // Protect all routes EXCEPT the auth pages, NextAuth API, and static assets
  matcher: [
    "/((?!api/auth|auth/login|auth/register|_next/static|_next/image|favicon\\.ico).*)",
  ],
};
