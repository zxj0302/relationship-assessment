export type AttachmentDimension = "anxious" | "avoidant" | "conflict" | "childhood";

export type QuestionCategory = 
  | "Intimacy" 
  | "Independence" 
  | "Reassurance" 
  | "Vulnerability" 
  | "Conflict" 
  | "ChildhoodWound";

export interface Question {
  id: number;
  dimension: AttachmentDimension;
  reversed: boolean;
  prompt: string;
  subtext?: string;
  category: QuestionCategory;
}

export type AttachmentArchetype = 
  | "Secure"
  | "Anxious-Preoccupied"
  | "Dismissive-Avoidant"
  | "Fearful-Avoidant";

export type RelationshipStatus = 
  | "single" 
  | "dating" 
  | "in_relationship" 
  | "complicated" 
  | "healing";

export interface ConflictShadowProfile {
  shadowType: "Fight" | "Flight" | "Freeze" | "Fawn" | "Secure";
  title: string;
  trigger: string;
  defaultReaction: string;
  nervousSystemReframe: string;
}

export interface ChildhoodWoundProfile {
  title: string;
  subconsciousContract: string;
  coreFear: string;
  healingMantra: string;
}

export interface PartnerAttractionWarning {
  drawnToType: string;
  whyAttracted: string;
  theBreakingPoint: string;
  antidote: string;
}

export interface ScoreBreakdown {
  anxiousRaw: number;
  anxiousPercent: number; // 0 - 100
  avoidantRaw: number;
  avoidantPercent: number; // 0 - 100
  conflictRaw: number;
  childhoodRaw: number;
  relationshipStatus?: RelationshipStatus;
  answers?: Record<number, number>;
  archetype: AttachmentArchetype;
  archetypeTitle: string;
  shadowSubtype: string;
  shortSummary: string;
  conflictShadow: ConflictShadowProfile;
  childhoodWound: ChildhoodWoundProfile;
  partnerAttractionWarning: PartnerAttractionWarning;
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
  relationshipStatus?: RelationshipStatus;
  answers?: Record<number, number>;
  isUnlocked: boolean;
  createdAt: number;
}
