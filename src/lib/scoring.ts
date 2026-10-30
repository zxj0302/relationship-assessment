import { QUESTION_BANK } from "@/data/questions";
import { ARCHETYPE_PROFILES } from "@/data/archetypes";
import { AttachmentArchetype, ScoreBreakdown } from "@/types/assessment";

export function calculateAssessmentScores(answers: Record<number, number>): ScoreBreakdown {
  let anxiousSum = 0;
  let anxiousCount = 0;
  let avoidantSum = 0;
  let avoidantCount = 0;

  QUESTION_BANK.forEach((q) => {
    const rawVal = answers[q.id] ?? 3; // Default neutral if unanswered
    const scoredVal = q.reversed ? 6 - rawVal : rawVal;

    if (q.dimension === "anxious") {
      anxiousSum += scoredVal;
      anxiousCount += 1;
    } else {
      avoidantSum += scoredVal;
      avoidantCount += 1;
    }
  });

  const anxiousRaw = Number((anxiousSum / (anxiousCount || 1)).toFixed(2));
  const avoidantRaw = Number((avoidantSum / (avoidantCount || 1)).toFixed(2));

  // Scale 1 to 5 to 0 to 100% with strict bounds clamping [0, 100]
  const anxiousPercent = Math.min(100, Math.max(0, Math.round(((anxiousRaw - 1) / 4) * 100)));
  const avoidantPercent = Math.min(100, Math.max(0, Math.round(((avoidantRaw - 1) / 4) * 100)));

  // ECR-R Quadrant Classification
  // Standard psychometric cutoff threshold: 3.0 out of 5 (corresponds exactly to 50%)
  // Scores strictly greater than 3.0 designate high dimension endorsement,
  // preventing neutral responses (all 3s) from falsely categorizing as Fearful-Avoidant.
  const ANXIOUS_THRESHOLD = 3.0;
  const AVOIDANT_THRESHOLD = 3.0;

  const isAnxiousHigh = anxiousRaw > ANXIOUS_THRESHOLD;
  const isAvoidantHigh = avoidantRaw > AVOIDANT_THRESHOLD;

  let archetype: AttachmentArchetype = "Secure";

  if (!isAnxiousHigh && !isAvoidantHigh) {
    archetype = "Secure";
  } else if (isAnxiousHigh && !isAvoidantHigh) {
    archetype = "Anxious-Preoccupied";
  } else if (!isAnxiousHigh && isAvoidantHigh) {
    archetype = "Dismissive-Avoidant";
  } else {
    archetype = "Fearful-Avoidant";
  }

  const profile = ARCHETYPE_PROFILES[archetype];

  return {
    anxiousRaw,
    anxiousPercent,
    avoidantRaw,
    avoidantPercent,
    archetype,
    archetypeTitle: profile.archetypeTitle,
    shadowSubtype: profile.shadowSubtype,
    shortSummary: profile.shortSummary,
    deepDive: profile.deepDive,
  };
}
