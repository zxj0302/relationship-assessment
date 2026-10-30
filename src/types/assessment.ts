export type AttachmentDimension = "anxious" | "avoidant";

export interface Question {
  id: number;
  dimension: AttachmentDimension;
  reversed: boolean;
  prompt: string;
  subtext?: string;
  category: "Intimacy" | "Independence" | "Reassurance" | "Vulnerability" | "Conflict";
}

export type AttachmentArchetype = 
  | "Secure"
  | "Anxious-Preoccupied"
  | "Dismissive-Avoidant"
  | "Fearful-Avoidant";

export interface ScoreBreakdown {
  anxiousRaw: number;
  anxiousPercent: number; // 0 - 100
  avoidantRaw: number;
  avoidantPercent: number; // 0 - 100
  archetype: AttachmentArchetype;
  archetypeTitle: string;
  shadowSubtype: string;
  shortSummary: string;
  deepDive: {
    coreFear: string;
    subconsciousDrive: string;
    childhoodBlueprint: string;
    romanticTrap: string;
    toxicTriggers: string[];
    communicationFixes: {
      impulse: string;
      healthyReframe: string;
    }[];
    compatibilityAnalysis: {
      withSecure: string;
      withAnxious: string;
      withAvoidant: string;
      withFearful: string;
    };
    actionPlan30Days: {
      phase: string;
      days: string;
      focus: string;
      exercise: string;
    }[];
  };
}

export interface StoredResultTokenPayload {
  resultId: string;
  email?: string;
  anxiousRaw: number;
  avoidantRaw: number;
  anxiousPercent: number;
  avoidantPercent: number;
  archetype: AttachmentArchetype;
  isUnlocked: boolean;
  createdAt: number;
}
