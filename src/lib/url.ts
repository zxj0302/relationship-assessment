import { NextRequest } from "next/server";

const SAFE_FALLBACK_PRODUCTION_URL = "https://attachmentshadow.com";
const SAFE_FALLBACK_DEV_URL = "http://localhost:3000";

// Strict RFC-compliant hostname & optional port regex (no CRLF, no @, no slashes, no control characters)
const HOST_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*(?::[0-9]{1,5})?$/;

function isPrivateOrLocalIp(hostname: string): boolean {
  const hostOnly = hostname.split(":")[0].toLowerCase();
  if (
    hostOnly === "localhost" ||
    hostOnly === "127.0.0.1" ||
    hostOnly === "0.0.0.0" ||
    hostOnly === "::1" ||
    hostOnly.endsWith(".local")
  ) {
    return true;
  }

  // IPv4 private ranges
  if (/^10\./.test(hostOnly) || /^192\.168\./.test(hostOnly) || /^169\.254\./.test(hostOnly)) {
    return true;
  }
  const match172 = hostOnly.match(/^172\.(\d+)\./);
  if (match172) {
    const octet = parseInt(match172[1], 10);
    if (octet >= 16 && octet <= 31) return true;
  }

  return false;
}

export function isValidHost(host: string, isProduction: boolean): boolean {
  if (!host || typeof host !== "string") return false;
  const trimmed = host.trim();
  if (!HOST_REGEX.test(trimmed)) return false;

  const hostname = trimmed.split(":")[0].toLowerCase();

  if (!isProduction) {
    // In development/test, allow localhost and local IPs
    if (isPrivateOrLocalIp(hostname)) return true;
  } else {
    // In production, strictly reject localhost and internal IPs
    if (isPrivateOrLocalIp(hostname)) return false;
  }

  // Allow explicitly configured public app URL host
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) {
    try {
      const configuredHost = new URL(configured).hostname.toLowerCase();
      if (hostname === configuredHost || hostname.endsWith(`.${configuredHost}`)) {
        return true;
      }
    } catch {
      // Ignore URL parse error
    }
  }

  // Allow Vercel deployment hosts (e.g. *.vercel.app)
  const vercelEnv = process.env.VERCEL_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelEnv) {
    const vHost = vercelEnv.replace(/^https?:\/\//, "").split("/")[0].split(":")[0].toLowerCase();
    if (hostname === vHost || hostname.endsWith(".vercel.app")) {
      return true;
    }
  }

  // Allow canonical domain and subdomains
  if (
    hostname === "attachmentshadow.com" ||
    hostname.endsWith(".attachmentshadow.com") ||
    hostname.endsWith(".vercel.app")
  ) {
    return true;
  }

  // Allow dev hosts in non-production
  if (!isProduction) {
    return true;
  }

  return false;
}

export function getAppUrl(req?: NextRequest | Request, metadataUrl?: string): string {
  const isProduction = process.env.NODE_ENV === "production";

  // 1. Prioritize explicitly configured NEXT_PUBLIC_APP_URL if valid
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configuredUrl) {
    try {
      const parsed = new URL(configuredUrl);
      if (isValidHost(parsed.host, isProduction)) {
        return configuredUrl.replace(/\/+$/, "");
      }
    } catch {
      // Ignore invalid configured URL
    }
  }

  // 2. If valid metadataUrl passed (e.g. from Stripe session metadata), validate against trusted host list
  if (metadataUrl) {
    const trimmed = metadataUrl.trim();
    try {
      const parsed = new URL(trimmed);
      const isAllowedProto = isProduction ? parsed.protocol === "https:" : parsed.protocol === "http:" || parsed.protocol === "https:";
      if (isAllowedProto && isValidHost(parsed.host, isProduction)) {
        return trimmed.replace(/\/+$/, "");
      }
    } catch {
      // Ignore invalid metadataUrl
    }
  }

  // 3. Derive dynamically from validated reverse proxy / request headers if available
  if (req) {
    const forwardedHost = req.headers.get("x-forwarded-host");
    const rawProto = req.headers.get("x-forwarded-proto");
    const forwardedProto = isProduction
      ? "https"
      : rawProto === "http" || rawProto === "https"
      ? rawProto
      : "http";

    if (forwardedHost) {
      const hostCandidate = forwardedHost.split(",")[0].trim();
      if (isValidHost(hostCandidate, isProduction)) {
        return `${forwardedProto}://${hostCandidate}`.replace(/\/+$/, "");
      }
    }

    const host = req.headers.get("host");
    if (host) {
      const hostCandidate = host.trim();
      if (isValidHost(hostCandidate, isProduction)) {
        const proto = isProduction ? "https" : hostCandidate.includes("localhost") ? "http" : "https";
        return `${proto}://${hostCandidate}`.replace(/\/+$/, "");
      }
    }

    if ("nextUrl" in req && (req as NextRequest).nextUrl?.origin && (req as NextRequest).nextUrl.origin !== "null") {
      try {
        const originUrl = new URL((req as NextRequest).nextUrl.origin);
        if (isValidHost(originUrl.host, isProduction)) {
          return (req as NextRequest).nextUrl.origin.replace(/\/+$/, "");
        }
      } catch {
        // Safe ignore
      }
    }
  }

  // 4. Absolute safe canonical fallback
  return isProduction ? SAFE_FALLBACK_PRODUCTION_URL : SAFE_FALLBACK_DEV_URL;
}
