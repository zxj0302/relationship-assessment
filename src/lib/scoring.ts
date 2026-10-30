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

export function getPartnerAttractionWarning(archetype: AttachmentArchetype): PartnerAttractionWarning {
  switch (archetype) {
    case "Anxious-Preoccupied":
      return {
        drawnToType: "The Emotionally Inconsistent / Avoidant Ghost",
        whyAttracted: "Their intermittent attention and subtle aloofness subconsciously feel like home. Your brain mistakes the adrenaline of chasing for 'passionate chemistry'.",
        theBreakingPoint: "You offer more and more emotional labor; they pull further back into their shell, triggering your chronic abandonment panic loop.",
        antidote: "Recognize that calm, predictable partners are not 'boring'—they are safe. Re-wire your dopamine system away from the highs and lows of the pursuit."
      };
    case "Dismissive-Avoidant":
      return {
        drawnToType: "The High-Demanding / Anxious Rescuer",
        whyAttracted: "Initially, their intense emotional availability feels flattering and removes the pressure of you having to initiate connection.",
        theBreakingPoint: "Once they ask for mutual vulnerability, you feel trapped and suffocated, confirming your subconscious belief that partners are needy and draining.",
        antidote: "Stop viewing intimacy as an invasion of autonomy. Safe partners don't want to conquer you; they want to know you."
      };
    case "Fearful-Avoidant":
      return {
        drawnToType: "The Hot-and-Cold Enigma / Wounded Soul",
        whyAttracted: "You are pulled toward individuals who mirror your own inner contradiction: deep intensity paired with sudden retreats.",
        theBreakingPoint: "The Anxious-Avoidant roller coaster: you chase when they pull away, and panic when they step closer, burning out both nervous systems.",
        antidote: "Cultivate an internal 'Center of Gravity'. You cannot find safety in a partner until you stop abandoning yourself when fear surfaces."
      };
    case "Secure":
    default:
      return {
        drawnToType: "Emotionally Available, Grounded Partners",
        whyAttracted: "You naturally seek consistency, clear communication, and mutual respect.",
        theBreakingPoint: "You have healthy immune defenses: when someone plays toxic games or stonewalls, you lose attraction rather than doubling down.",
        antidote: "Maintain your clear boundaries and continue modeling calm vulnerability for your partner."
      };
  }
}

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
  // Q14 = Fight, Q13 = Flight/Shut down, Q18 = Freeze/Dissociate, Q15 = Fawn/Over-apologize, Q16 = Secure co-regulation
  const fightScore = answers[14] ?? 3;
  const flightScore = answers[13] ?? 3;
  const fawnScore = answers[15] ?? 3;
  const freezeScore = answers[18] ?? 3;
  const secureRegulationScore = answers[16] ?? 3;

  const maxConflictScore = Math.max(fightScore, flightScore, fawnScore, freezeScore);
  let conflictShadow: ConflictShadowProfile;

  // If all defensive responses are low, or user exhibits strong secure regulation, assign healthy profile
  if (maxConflictScore < 3 || (archetype === "Secure" && maxConflictScore <= 3 && secureRegulationScore >= 4)) {
    conflictShadow = {
      shadowType: "Secure",
      title: "The Secure Regulator (Calm Co-Regulation)",
      trigger: "Interpersonal tension, heated discussions, or partner distress.",
      defaultReaction: "You remain emotionally centered, listen actively without immediate defensiveness, and foster collaborative repair rather than falling into rigid autonomic fight/flight/freeze/fawn reflexes.",
      nervousSystemReframe: "Healthy co-regulation is your relational superpower; protect your emotional battery by sustaining clear, loving boundaries."
    };
  } else if (fightScore === maxConflictScore) {
    conflictShadow = {
      shadowType: "Fight",
      title: "The Urgent Pursuer (Fight Response)",
      trigger: "Delayed communication, ambiguity, or someone walking away mid-disagreement.",
      defaultReaction: "You experience an overwhelming physical adrenaline spike that demands immediate resolution, often turning into barrage texting, cross-examination, or protest outbursts.",
      nervousSystemReframe: "Urgency is rarely clarity. True emotional safety requires learning to sit with the silence without confusing delay with abandonment."
    };
  } else if (flightScore === maxConflictScore) {
    conflictShadow = {
      shadowType: "Flight",
      title: "The Fortified Evader (Flight Response)",
      trigger: "Intense emotional confrontations, tearful pleas, or demands for immediate disclosure.",
      defaultReaction: "Your system floods into sensory overload; you shut down, become stony, or physically leave the room to protect your nervous system from short-circuiting.",
      nervousSystemReframe: "Withdrawing keeps you safe in childhood, but starves adult intimacy. Practice signaling: 'I need 20 minutes to regulate, but I promise to return to you.'"
    };
  } else if (freezeScore === maxConflictScore) {
    conflictShadow = {
      shadowType: "Freeze",
      title: "The Dissociated Watcher (Freeze Response)",
      trigger: "Overwhelming chaos, loud arguments, or threats of relational collapse.",
      defaultReaction: "You go emotionally numb, feel disconnected from your physical body, and watch the conflict happen like a detached movie spectator.",
      nervousSystemReframe: "Numbness is a shock absorber. Gently bring sensations back into your hands and feet before attempting to speak your feelings."
    };
  } else {
    conflictShadow = {
      shadowType: "Fawn",
      title: "The Appeasing Peacemaker (Fawn Response)",
      trigger: "Anger, disapproval, or sudden emotional coldness in your partner.",
      defaultReaction: "You instinctively surrender your boundaries, apologize even when not at fault, and hyper-accommodate to neutralize tension.",
      nervousSystemReframe: "Safety does not come from being universally pleasing; you must teach your nervous system that experiencing another person's disappointment is survivable."
    };
  }

  // Determine Childhood Wound Blueprint
  // Q19 = Good kid/Achiever, Q20 = Chaos, Q21 = Parentification, Q22 = Self-reliance, Q23 = Caregiver validation, Q24 = Core defectiveness
  const parentifiedScore = answers[21] ?? 3;
  const achieverScore = answers[19] ?? 3;
  const fortressScore = answers[22] ?? 3;
  const chaosScore = answers[20] ?? 3;
  const defectivenessScore = answers[24] ?? 3;
  const secureCareScore = answers[23] ?? 3;

  const maxWoundScore = Math.max(parentifiedScore, achieverScore, fortressScore, chaosScore, defectivenessScore);
  let childhoodWound: ChildhoodWoundProfile;

  // When all trauma/defense markers are low, or caregivers provided consistent validation, assign healthy family foundation
  if (maxWoundScore < 3 || (secureCareScore >= 4 && maxWoundScore <= 3)) {
    childhoodWound = {
      title: "The Secure Relational Blueprint (Healthy Family Foundation)",
      subconsciousContract: "I am inherently worthy of love, emotional safety, and acceptance without having to prove my value or hide my humanity.",
      coreFear: "Relational disconnection, tempered by the inner confidence that ruptures can be repaired and healthy boundaries respected.",
      healingMantra: "My nervous system knows peace; I can welcome genuine closeness and trust without fear of losing myself."
    };
  } else if (parentifiedScore === maxWoundScore) {
    childhoodWound = {
      title: "The Emotionally Parentified Child",
      subconsciousContract: "I must be the therapist, caretaker, and stabilizer for others to be allowed in their life.",
      coreFear: "If I am not actively fixing someone's pain, I have zero value and will be discarded.",
      healingMantra: "I am allowed to receive love without having to earn it through emotional labor."
    };
  } else if (fortressScore === maxWoundScore) {
    childhoodWound = {
      title: "The Self-Reliant Fortress",
      subconsciousContract: "Nobody will be there when it truly matters, so I must never need anyone.",
      coreFear: "Entrusting my survival or peace to another human being will inevitably lead to devastating betrayal.",
      healingMantra: "Letting down my guard is not surrender; it is the courage to connect."
    };
  } else if (achieverScore === maxWoundScore) {
    childhoodWound = {
      title: "The Invisible Achiever",
      subconsciousContract: "I am only lovable when I am successful, well-behaved, and completely low-maintenance.",
      coreFear: "Having emotional needs or showing messy vulnerability will make me a burden.",
      healingMantra: "My worth is inherent; my imperfections are the doorway to true intimacy."
    };
  } else if (chaosScore === maxWoundScore) {
    childhoodWound = {
      title: "The Chaos Navigator",
      subconsciousContract: "Love is synonymous with unpredictability, emotional storms, and dramatic highs and lows.",
      coreFear: "Peace and stability feel like boredom or pending disaster.",
      healingMantra: "Calm love is not dangerous; calm love is where my nervous system truly heals."
    };
  } else {
    childhoodWound = {
      title: "The Unseen & Flawed Child (Defectiveness Wound)",
      subconsciousContract: "I carry an inner defectiveness that must be concealed, or people will reject me once they truly know me.",
      coreFear: "Being deeply seen and judged as unworthy of genuine love.",
      healingMantra: "I am inherently worthy of love; vulnerability is the bridge to authentic belonging."
    };
  }

  const partnerAttractionWarning = getPartnerAttractionWarning(archetype);
  const profile = ARCHETYPE_PROFILES[archetype];

  return {
    anxiousRaw,
    anxiousPercent,
    avoidantRaw,
    avoidantPercent,
    conflictRaw,
    childhoodRaw,
    relationshipStatus,
    answers,
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
