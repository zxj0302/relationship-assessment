import { NextRequest } from "next/server";

const SAFE_FALLBACK_PRODUCTION_URL = "https://relationship-assessment-apv.pages.dev";
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

  // Allow explicitly configured app URL hosts (runtime APP_URL and build/public NEXT_PUBLIC_APP_URL)
  const configuredEnvUrls = [process.env.APP_URL, process.env.NEXT_PUBLIC_APP_URL];
  for (const rawConfig of configuredEnvUrls) {
    const configured = rawConfig?.trim();
    if (!configured) continue;
    try {
      const parsedConfig = configured.startsWith("http") ? new URL(configured) : new URL(`https://${configured}`);
      const configuredHost = parsedConfig.hostname.toLowerCase();
      if (isProduction && isPrivateOrLocalIp(configuredHost)) {
        continue;
      }
      if (hostname === configuredHost || hostname.endsWith(`.${configuredHost}`)) {
        return true;
      }
    } catch {
      // Ignore URL parse error
    }
  }

  // Allow project-specific Vercel and Cloudflare Pages deployment hosts from environment
  // (never multi-tenant wildcard *.vercel.app or *.pages.dev)
  const platformEnvUrls = [
    process.env.VERCEL_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_BRANCH_URL,
    process.env.CF_PAGES_URL,
  ];
  for (const envUrl of platformEnvUrls) {
    if (!envUrl) continue;
    const trimmedEnv = envUrl.trim();
    if (!trimmedEnv) continue;
    try {
      const normalized = trimmedEnv.startsWith("http") ? trimmedEnv : `https://${trimmedEnv}`;
      const parsedEnv = new URL(normalized);
      const envHost = parsedEnv.hostname.toLowerCase();
      if (envHost && (hostname === envHost || hostname.endsWith(`.${envHost}`))) {
        return true;
      }
    } catch {
      const fallbackHost = trimmedEnv.replace(/^https?:\/\//, "").split("/")[0].split(":")[0].toLowerCase();
      if (fallbackHost && (hostname === fallbackHost || hostname.endsWith(`.${fallbackHost}`))) {
        return true;
      }
    }
  }

  // Allow canonical domain, verified subdomains, and project-specific Cloudflare Pages domains
  if (
    hostname === "attachmentshadow.com" ||
    hostname.endsWith(".attachmentshadow.com") ||
    hostname === "relationship-assessment-apv.pages.dev" ||
    hostname.endsWith(".relationship-assessment-apv.pages.dev") ||
    hostname === "relationship-assessment.pages.dev" ||
    hostname.endsWith(".relationship-assessment.pages.dev")
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

  // 1. Prioritize explicitly configured runtime APP_URL or NEXT_PUBLIC_APP_URL if valid
  // In production, ignore localhost/127.0.0.1 values (e.g. baked in from .env.local during build) and fall back to request host
  const configuredCandidates = [process.env.APP_URL?.trim(), process.env.NEXT_PUBLIC_APP_URL?.trim()];
  for (const configuredUrl of configuredCandidates) {
    if (!configuredUrl) continue;
    try {
      const normalizedConfig = configuredUrl.startsWith("http") ? configuredUrl : `https://${configuredUrl}`;
      const parsed = new URL(normalizedConfig);
      if (isProduction && isPrivateOrLocalIp(parsed.hostname)) {
        continue;
      }
      const isAllowedProto = isProduction ? parsed.protocol === "https:" : parsed.protocol === "http:" || parsed.protocol === "https:";
      if (isAllowedProto && isValidHost(parsed.host, isProduction)) {
        return normalizedConfig.replace(/\/+$/, "");
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
