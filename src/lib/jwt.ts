import { SignJWT, jwtVerify } from "jose";
import { StoredResultTokenPayload, AttachmentArchetype, RelationshipStatus } from "@/types/assessment";

function getSecretKey(): Uint8Array {
  const secret = process.env.TOKEN_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "CRITICAL SECURITY CONFIGURATION ERROR: TOKEN_SECRET environment variable is missing in production. Application cannot sign or verify tokens securely."
      );
    }
    return new TextEncoder().encode("fallback-secret-development-key-minimum-32-chars-long");
  }
  return new TextEncoder().encode(secret);
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
    if (payload.answers && typeof payload.answers === "object") {
      parsedAnswers = payload.answers as Record<number, number>;
    }

    return {
      resultId: payload.resultId as string,
      email: payload.email as string | undefined,
      anxiousRaw: Number(payload.anxiousRaw),
      avoidantRaw: Number(payload.avoidantRaw),
      anxiousPercent: Number(payload.anxiousPercent),
      avoidantPercent: Number(payload.avoidantPercent),
      archetype: payload.archetype as AttachmentArchetype,
      relationshipStatus: payload.relationshipStatus as RelationshipStatus | undefined,
      answers: parsedAnswers,
      isUnlocked: Boolean(payload.isUnlocked),
      createdAt: Number(payload.createdAt || Date.now()),
    };
  } catch (err) {
    console.error("Token verification error:", err);
    return null;
  }
}
