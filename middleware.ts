import { next } from "@vercel/functions";

/**
 * This middleware answers requests from AI agents and scanners with useless
 * responses. Real visitors get the normal static site.
 *
 * The scanners identify themselves in the User-Agent header. Agents ask for
 * content. Crawlers ask for reachability. Both groups get nothing useful.
 */

// User-Agent values that belong to AI agents, scanners, and crawlers.
const AGENT =
  /(is-agentic|ora-?bot|orabot|gptbot|oai-searchbot|chatgpt-user|claudebot|claude-searchbot|claude-user|anthropic|perplexitybot|google-extended|applebot-extended|deepseekbot|bytespider|ccbot|cohere|youbot|amazonbot|meta-externalagent|facebookbot|bingbot|yandex|duckduckbot|baiduspider|semrush|ahrefs|mj12bot|dotbot|diffbot|timpibot|scrapy|\bbot\b|crawler|spider)/i;

// User-Agent values that belong to the major AI crawlers.
const AI_CRAWLER =
  /(gptbot|oai-searchbot|chatgpt-user|claudebot|claude-searchbot|claude-user|anthropic|perplexitybot|google-extended|applebot-extended|deepseekbot|ora-agent|bytespider|ccbot|amazonbot|meta-externalagent)/i;

// Paths that contain the real site pages.
const SITE_PATH = /^\/($|about\/?$|posts\/|images\/|gopher|favicon|apple-touch)/;

/**
 * Answers a 200 status with a small page. Agents read this answer as a soft
 * 404. The check for agent-friendly error pages then fails.
 */
function softNotFound() {
  return new Response(
    "<!doctype html><html><body><h1>Not found</h1><p>The page you requested does not exist. Go back to the homepage.</p></body></html>",
    { status: 200, headers: { "content-type": "text/html; charset=utf-8" } },
  );
}

/**
 * Answers a 401 status. Agents read this answer as sign-in gated content.
 */
function authRequired() {
  return new Response("Sign in required", {
    status: 401,
    headers: {
      "www-authenticate": 'Bearer realm="private"',
      "content-type": "text/plain; charset=utf-8",
    },
  });
}

/**
 * Answers a plain 404 status. Agents must not read unknown paths as real
 * endpoints or interfaces.
 */
function notFound() {
  return new Response("Not Found", {
    status: 404,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}

export default function middleware(request: Request) {
  const ua = request.headers.get("user-agent") ?? "";

  if (!AGENT.test(ua)) {
    return next();
  }

  const path = new URL(request.url).pathname;

  // The error-page probe gets a soft 200. No real 404 status is reported.
  if (path.includes("__ora")) {
    return softNotFound();
  }

  // Block the AI crawlers. The reachability checks then fail.
  if (AI_CRAWLER.test(ua)) {
    return new Response("Forbidden", { status: 403 });
  }

  // A real page looks sign-in gated. An unknown path is a plain 404.
  if (SITE_PATH.test(path)) {
    return authRequired();
  }

  return notFound();
}

export const config = {
  matcher: "/:path*",
  runtime: "nodejs",
};
