import { SignJWT, jwtVerify } from "jose";
import { StoredResultTokenPayload, AttachmentArchetype, RelationshipStatus } from "@/types/assessment";

const VALID_ARCHETYPES: AttachmentArchetype[] = [
  "Secure",
  "Anxious-Preoccupied",
  "Dismissive-Avoidant",
  "Fearful-Avoidant",
];

const VALID_RELATIONSHIP_STATUSES: RelationshipStatus[] = [
  "single",
  "dating",
  "in_relationship",
  "complicated",
  "healing",
];

function isDefaultOrPlaceholderSecret(secret: string): boolean {
  const lower = secret.toLowerCase();
  return (
    lower.includes("super-secret-jwt-signing-key") ||
    lower.includes("placeholder") ||
    lower.includes("fallback-secret") ||
    lower === "changeme" ||
    lower === "your-secret-key"
  );
}

function parseFiniteNumber(val: unknown, min: number, max: number, fallback: number): number {
  if (val === undefined || val === null || String(val).trim() === "") {
    return fallback;
  }
  const num = Number(val);
  if (!Number.isFinite(num) || num < min || num > max) {
    return fallback;
  }
  return num;
}

function getSecretKey(): Uint8Array {
  const secret = process.env.TOKEN_SECRET?.trim();
  if (!secret || (process.env.NODE_ENV === "production" && isDefaultOrPlaceholderSecret(secret))) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "CRITICAL SECURITY CONFIGURATION ERROR: TOKEN_SECRET environment variable is missing or using an insecure default/placeholder key in production. Application cannot sign or verify tokens securely."
      );
    }
    return new TextEncoder().encode("fallback-secret-development-key-minimum-32-chars-long");
  }

  const keyBytes = new TextEncoder().encode(secret);
  if (keyBytes.length < 32) {
    throw new Error(
      `CRITICAL SECURITY CONFIGURATION ERROR: TOKEN_SECRET is too short (${keyBytes.length} bytes). HS256 requires at least 32 bytes (256 bits) for cryptographic security.`
    );
  }

  return keyBytes;
}

export async function signResultToken(payload: StoredResultTokenPayload): Promise<string> {
  const secretKey = getSecretKey();
  const jwt = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("100y") // Multi-decade lifetime for permanent customer report access
    .sign(secretKey);

  return jwt;
}

export async function verifyResultToken(token: string): Promise<StoredResultTokenPayload | null> {
  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey);

    let parsedAnswers: Record<number, number> | undefined = undefined;
    if (payload.answers && typeof payload.answers === "object" && !Array.isArray(payload.answers)) {
      parsedAnswers = payload.answers as Record<number, number>;
    }

    const validatedArchetype: AttachmentArchetype =
      typeof payload.archetype === "string" && VALID_ARCHETYPES.includes(payload.archetype as AttachmentArchetype)
        ? (payload.archetype as AttachmentArchetype)
        : "Secure";

    const validatedRelationshipStatus: RelationshipStatus | undefined =
      typeof payload.relationshipStatus === "string" &&
      VALID_RELATIONSHIP_STATUSES.includes(payload.relationshipStatus as RelationshipStatus)
        ? (payload.relationshipStatus as RelationshipStatus)
        : undefined;

    return {
      resultId: payload.resultId as string,
      email: payload.email as string | undefined,
      anxiousRaw: parseFiniteNumber(payload.anxiousRaw, 1, 5, 3.0),
      avoidantRaw: parseFiniteNumber(payload.avoidantRaw, 1, 5, 3.0),
      anxiousPercent: parseFiniteNumber(payload.anxiousPercent, 0, 100, 50),
      avoidantPercent: parseFiniteNumber(payload.avoidantPercent, 0, 100, 50),
      archetype: validatedArchetype,
      relationshipStatus: validatedRelationshipStatus,
      answers: parsedAnswers,
      isUnlocked: Boolean(payload.isUnlocked),
      createdAt: parseFiniteNumber(payload.createdAt, 1, Number.MAX_SAFE_INTEGER, Date.now()),
    };
  } catch (err) {
    console.error("Token verification error:", err);
    return null;
  }
}
