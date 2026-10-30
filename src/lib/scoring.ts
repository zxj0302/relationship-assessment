import { QUESTION_BANK } from "@/data/questions";
import { ARCHETYPE_PROFILES } from "@/data/archetypes";
import {
  AttachmentArchetype,
  RelationshipStatus,
  ScoreBreakdown,
  ConflictShadowProfile,
  ChildhoodWoundProfile,
  PartnerAttractionWarning,
} from "@/types/assessment";

export function calculateAssessmentScores(
  answers: Record<number, number>,
  relationshipStatus?: RelationshipStatus
): ScoreBreakdown {
  let anxiousSum = 0;
  let anxiousCount = 0;
  let avoidantSum = 0;
  let avoidantCount = 0;
  let conflictSum = 0;
  let conflictCount = 0;
  let childhoodSum = 0;
  let childhoodCount = 0;

  QUESTION_BANK.forEach((q) => {
    const rawVal = answers[q.id] ?? 3; // Default neutral if unanswered
    const scoredVal = q.reversed ? 6 - rawVal : rawVal;

    switch (q.dimension) {
      case "anxious":
        anxiousSum += scoredVal;
        anxiousCount += 1;
        break;
      case "avoidant":
        avoidantSum += scoredVal;
        avoidantCount += 1;
        break;
      case "conflict":
        conflictSum += scoredVal;
        conflictCount += 1;
        break;
      case "childhood":
        childhoodSum += scoredVal;
        childhoodCount += 1;
        break;
    }
  });

  const anxiousRaw = Number((anxiousSum / (anxiousCount || 1)).toFixed(2));
  const avoidantRaw = Number((avoidantSum / (avoidantCount || 1)).toFixed(2));
  const conflictRaw = Number((conflictSum / (conflictCount || 1)).toFixed(2));
  const childhoodRaw = Number((childhoodSum / (childhoodCount || 1)).toFixed(2));

  // Scale 1 to 5 to 0 to 100% with strict bounds clamping [0, 100]
  const anxiousPercent = Math.min(100, Math.max(0, Math.round(((anxiousRaw - 1) / 4) * 100)));
  const avoidantPercent = Math.min(100, Math.max(0, Math.round(((avoidantRaw - 1) / 4) * 100)));

  // ECR-R Quadrant Classification
  // Cutoff threshold: 3.0 out of 5 (50% mark)
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

  // Determine Conflict Shadow Type
  // Q14 = Fight, Q13 = Flight/Shut down, Q18 = Freeze/Dissociate, Q15 = Fawn/Over-apologize
  const fightScore = answers[14] ?? 3;
  const flightScore = answers[13] ?? 3;
  const fawnScore = answers[15] ?? 3;
  const freezeScore = answers[18] ?? 3;

  let conflictShadow: ConflictShadowProfile;

  if (fawnScore >= Math.max(fightScore, flightScore, freezeScore) && fawnScore >= 3) {
    conflictShadow = {
      shadowType: "Fawn",
      title: "The Appeasing Peacemaker (Fawn Response)",
      trigger: "Anger, disapproval, or sudden emotional coldness in your partner.",
      defaultReaction: "You instinctively surrender your boundaries, apologize even when not at fault, and hyper-accommodate to neutralize tension.",
      nervousSystemReframe: "Safety does not come from being universally pleasing; you must teach your nervous system that experiencing another person's disappointment is survivable."
    };
  } else if (fightScore >= Math.max(flightScore, freezeScore) && fightScore >= 3) {
    conflictShadow = {
      shadowType: "Fight",
      title: "The Urgent Pursuer (Fight Response)",
      trigger: "Delayed communication, ambiguity, or someone walking away mid-disagreement.",
      defaultReaction: "You experience an overwhelming physical adrenaline spike that demands immediate resolution, often turning into barrage texting, cross-examination, or protest outbursts.",
      nervousSystemReframe: "Urgency is rarely clarity. True emotional safety requires learning to sit with the silence without confusing delay with abandonment."
    };
  } else if (flightScore >= freezeScore && flightScore >= 3) {
    conflictShadow = {
      shadowType: "Flight",
      title: "The Fortified Evader (Flight Response)",
      trigger: "Intense emotional confrontations, tearful pleas, or demands for immediate disclosure.",
      defaultReaction: "Your system floods into sensory overload; you shut down, become stony, or physically leave the room to protect your nervous system from short-circuiting.",
      nervousSystemReframe: "Withdrawing keeps you safe in childhood, but starves adult intimacy. Practice signaling: 'I need 20 minutes to regulate, but I promise to return to you.'"
    };
  } else {
    conflictShadow = {
      shadowType: "Freeze",
      title: "The Dissociated Watcher (Freeze Response)",
      trigger: "Overwhelming chaos, loud arguments, or threats of relational collapse.",
      defaultReaction: "You go emotionally numb, feel disconnected from your physical body, and watch the conflict happen like a detached movie spectator.",
      nervousSystemReframe: "Numbness is a shock absorber. Gently bring sensations back into your hands and feet before attempting to speak your feelings."
    };
  }

  // Determine Childhood Wound Blueprint
  // Q19 = Good kid/People Pleaser, Q21 = Parentification, Q22 = Emotional self-reliance, Q20 = Chaos
  let childhoodWound: ChildhoodWoundProfile;

  if (answers[21] >= 4) {
    childhoodWound = {
      title: "The Emotionally Parentified Child",
      subconsciousContract: "I must be the therapist, caretaker, and stabilizer for others to be allowed in their life.",
      coreFear: "If I am not actively fixing someone's pain, I have zero value and will be discarded.",
      healingMantra: "I am allowed to receive love without having to earn it through emotional labor."
    };
  } else if (answers[19] >= 4) {
    childhoodWound = {
      title: "The Invisible Achiever",
      subconsciousContract: "I am only lovable when I am successful, well-behaved, and completely low-maintenance.",
      coreFear: "Having emotional needs or showing messy vulnerability will make me a burden.",
      healingMantra: "My worth is inherent; my imperfections are the doorway to true intimacy."
    };
  } else if (answers[22] >= 4) {
    childhoodWound = {
      title: "The Self-Reliant Fortress",
      subconsciousContract: "Nobody will be there when it truly matters, so I must never need anyone.",
      coreFear: "Entrusting my survival or peace to another human being will inevitably lead to devastating betrayal.",
      healingMantra: "Letting down my guard is not surrender; it is the courage to connect."
    };
  } else {
    childhoodWound = {
      title: "The Chaos Navigator",
      subconsciousContract: "Love is synonymous with unpredictability, emotional storms, and dramatic highs and lows.",
      coreFear: "Peace and stability feel like boredom or pending disaster.",
      healingMantra: "Calm love is not dangerous; calm love is where my nervous system truly heals."
    };
  }

  // Determine Partner Attraction Warning based on Archetype
  let partnerAttractionWarning: PartnerAttractionWarning;

  switch (archetype) {
    case "Anxious-Preoccupied":
      partnerAttractionWarning = {
        drawnToType: "The Emotionally Inconsistent / Avoidant Ghost",
        whyAttracted: "Their intermittent attention and subtle aloofness subconsciously feel like home. Your brain mistakes the adrenaline of chasing for 'passionate chemistry'.",
        theBreakingPoint: "You offer more and more emotional labor; they pull further back into their shell, triggering your chronic abandonment panic loop.",
        antidote: "Recognize that calm, predictable partners are not 'boring'—they are safe. Re-wire your dopamine system away from the highs and lows of the pursuit."
      };
      break;
    case "Dismissive-Avoidant":
      partnerAttractionWarning = {
        drawnToType: "The High-Demanding / Anxious Rescuer",
        whyAttracted: "Initially, their intense emotional availability feels flattering and removes the pressure of you having to initiate connection.",
        theBreakingPoint: "Once they ask for mutual vulnerability, you feel trapped and suffocated, confirming your subconscious belief that partners are needy and draining.",
        antidote: "Stop viewing intimacy as an invasion of autonomy. Safe partners don't want to conquer you; they want to know you."
      };
      break;
    case "Fearful-Avoidant":
      partnerAttractionWarning = {
        drawnToType: "The Hot-and-Cold Enigma / Wounded Soul",
        whyAttracted: "You are pulled toward individuals who mirror your own inner contradiction: deep intensity paired with sudden retreats.",
        theBreakingPoint: "The Anxious-Avoidant roller coaster: you chase when they pull away, and panic when they step closer, burning out both nervous systems.",
        antidote: "Cultivate an internal 'Center of Gravity'. You cannot find safety in a partner until you stop abandoning yourself when fear surfaces."
      };
      break;
    case "Secure":
      partnerAttractionWarning = {
        drawnToType: "Emotionally Available, Grounded Partners",
        whyAttracted: "You naturally seek consistency, clear communication, and mutual respect.",
        theBreakingPoint: "You have healthy immune defenses: when someone plays toxic games or stonewalls, you lose attraction rather than doubling down.",
        antidote: "Maintain your clear boundaries and continue modeling calm vulnerability for your partner."
      };
      break;
  }

  const profile = ARCHETYPE_PROFILES[archetype];

  return {
    anxiousRaw,
    anxiousPercent,
    avoidantRaw,
    avoidantPercent,
    conflictRaw,
    childhoodRaw,
    relationshipStatus,
    archetype,
    archetypeTitle: profile.archetypeTitle,
    shadowSubtype: profile.shadowSubtype,
    shortSummary: profile.shortSummary,
    conflictShadow,
    childhoodWound,
    partnerAttractionWarning,
    deepDive: profile.deepDive,
  };
}
