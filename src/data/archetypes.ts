import { AttachmentArchetype, ScoreBreakdown } from "@/types/assessment";

export const ARCHETYPE_PROFILES: Record<
  AttachmentArchetype,
  {
    archetypeTitle: string;
    shadowSubtype: string;
    shortSummary: string;
    deepDive: ScoreBreakdown["deepDive"];
  }
> = {
  "Anxious-Preoccupied": {
    archetypeTitle: "The Hyper-Vigilant Devotee",
    shadowSubtype: "The Abandonment Detective & Empathy Overloader",
    shortSummary:
      "You love with unmatched emotional depth, generosity, and intuition. However, your nervous system is wired to perceive microscopic shifts in attention as imminent abandonment. You spend immense mental energy calculating relationship safety, often forfeiting your own needs to secure connection.",
    deepDive: {
      coreFear:
        "Severe emotional abandonment and being deemed unlovable when your flaws or needs are revealed.",
      subconsciousDrive:
        "Compulsively merging with your partner to eliminate the agonizing uncertainty of emotional distance.",
      childhoodBlueprint:
        "Typically shaped by inconsistently available caregivers. Warmth and attention were unpredictable—sometimes abundant, sometimes suddenly withdrawn. This conditioned your subconscious to believe love requires constant surveillance, hyper-attunement, and persistent pursuit to avoid being forgotten.",
      romanticTrap:
        "The Anxious-Avoidant Magnet: You are magnetically pulled toward emotionally unavailable, aloof, or unpredictable partners because their lukewarm presence mirrors the intermittent reinforcement your nervous system confuses with passionate love.",
      toxicTriggers: [
        "Unanswered texts or ambiguous messages with flat punctuation.",
        "A partner needing unscheduled alone time or emotional solitude.",
        "Sudden subtle changes in eye contact, vocal cadence, or touch."
      ],
      communicationFixes: [
        {
          impulse:
            "Sending multi-paragraph texts, demanding immediate reassurance, or cold-shouldering to elicit a chase (Protest Behavior).",
          healthyReframe:
            "Direct vulnerability: 'I notice my nervous system is feeling anxious right now. I don't need you to fix it immediately, but a quick hug or word of reassurance would ground me.'"
        },
        {
          impulse:
            "Saying 'It's totally fine!' while secretly harboring quiet resentment and expecting mind-reading.",
          healthyReframe:
            "Clear boundary: 'I am happy to support you, but tonight I need downtime to replenish my own emotional cup.'"
        }
      ],
      compatibilityAnalysis: {
        withSecure:
          "Ideal healing environment. A Secure partner acts as an emotional anchor, desensitizing your alarm bells with consistent transparency.",
        withAnxious:
          "High empathy and intimacy, but prone to mutual codependency and escalating anxiety spirals without explicit grounding rituals.",
        withAvoidant:
          "High-risk rollercoaster ('The Anxious-Avoidant Trap'). Requires conscious de-escalation protocols and learning to tolerate space without panic.",
        withFearful:
          "Volatile and emotionally exhausting. Both partners trigger each other's abandonment and engulfment fears sequentially."
      },
      actionPlan30Days: [
        {
          phase: "Phase 1: Somatic Down-Regulation",
          days: "Days 1-7",
          focus: "Halting the Urgent Reaction Cycle",
          exercise:
            "Implement the '20-Minute Delay Rule': When feeling triggered to send an urgent text or demand clarity, set a 20-minute timer. Practice physiological sigh breathing (two quick inhales, one slow exhale) before sending any message."
        },
        {
          phase: "Phase 2: Self-Attunement & Boundary Retrieval",
          days: "Days 8-16",
          focus: "Re-anchoring Self-Worth",
          exercise:
            "Keep an 'Emotional Reality Journal'. Separate the objective fact ('He didn't text for 3 hours') from the catastrophic interpretation ('He has lost feelings for me')."
        },
        {
          phase: "Phase 3: Direct Non-Violent Communication",
          days: "Days 17-23",
          focus: "Replacing Protest Behaviors with Stated Needs",
          exercise:
            "Practice expressing vulnerable desires using the formula: 'When X happens, I feel Y. What would help me feel connected is Z.'"
        },
        {
          phase: "Phase 4: Autonomous Joy Cultivation",
          days: "Days 24-30",
          focus: "Eradicating Emotional Enmeshment",
          exercise:
            "Commit to 2 evenings per week dedicated exclusively to independent creative projects, solo hobbies, or non-romantic friendships without digital checking."
        }
      ]
    }
  },

  "Dismissive-Avoidant": {
    archetypeTitle: "The Fortress of Self-Reliance",
    shadowSubtype: "The Emotional Hermit & Independence Purist",
    shortSummary:
      "You pride yourself on autonomy, self-regulation, and unflinching mental resilience. Yet behind your calm exterior lies an automatic defense mechanism: shutting down intimacy when emotional demands feel suffocating or when vulnerability feels like an existential risk.",
    deepDive: {
      coreFear:
        "Loss of autonomy, helplessness, emotional engulfment, and being controlled or judged as inadequate.",
      subconsciousDrive:
        "Compulsive hyper-independence. Eliminating emotional reliance on others so you can never be blindsided, hurt, or disappointed.",
      childhoodBlueprint:
        "Often raised in environments where emotional distress was ignored, punished, or met with shaming ('Stop crying, you're fine'). You quickly learned that caregivers could not be counted on for comfort, so you turned inward and made yourself your sole protector.",
      romanticTrap:
        "The Phantom Ex & The Flaw Microscope: You unconsciously fixate on an idealized past lover or magnify tiny flaws in present partners as justifiable reasons to terminate intimacy and escape the impending threat of closeness.",
      toxicTriggers: [
        "Demands to talk about feelings or dissect relationship states.",
        "Emotional outbursts, crying, or perceived guilt-tripping from a partner.",
        "Conversations about cohabitation, financial merging, or marriage."
      ],
      communicationFixes: [
        {
          impulse:
            "Stonewalling, going silent for days, or escaping into work, video games, or exercise.",
          healthyReframe:
            "Stated space request: 'I value our conversation, but my system feels flooded right now. I need 45 minutes to cool down, and I will come back at 8:00 PM to talk.'"
        },
        {
          impulse:
            "Brushing off partner distress with logic, dismissal, or 'You are making a big deal out of nothing'.",
          healthyReframe:
            "Validating presence: 'I understand why this feels overwhelming for you. I am listening, even if I see it differently.'"
        }
      ],
      compatibilityAnalysis: {
        withSecure:
          "Transformative. A Secure partner gives you generous breathing space without passive aggression, showing you closeness is safe.",
        withAnxious:
          "Classic polarization. Your distance amplifies their panic, and their pursuit intensifies your urge to run.",
        withAvoidant:
          "Polite and low-conflict, but risks degenerating into cold roommates with no genuine emotional vulnerability or passion.",
        withFearful:
          "High drama. Their unpredictable switch between seeking closeness and pulling away disrupts your need for predictable boundaries."
      },
      actionPlan30Days: [
        {
          phase: "Phase 1: Emotional Sensation Recognition",
          days: "Days 1-7",
          focus: "Unfreezing the Somatic Defense",
          exercise:
            "Twice a day, pause and scan your body for 60 seconds without intellectualizing. Name one physical feeling (tightness in chest, clenched jaw, fatigue)."
        },
        {
          phase: "Phase 2: Micro-Disclosures of Vulnerability",
          days: "Days 8-16",
          focus: "Dismantling the Flaw Filter",
          exercise:
            "Share one uncurated, non-pragmatic truth with your partner or a close confidant each day (e.g., 'I felt stressed about my meeting today', 'I felt tired today')."
        },
        {
          phase: "Phase 3: The Structured Time-Out Practice",
          days: "Days 17-23",
          focus: "Eliminating Stonewalling",
          exercise:
            "Whenever you feel the urge to vanish during tension, state your return time before stepping away. Always return at that agreed time."
        },
        {
          phase: "Phase 4: Embracing Interdependence",
          days: "Days 24-30",
          focus: "Healthy Reliance",
          exercise:
            "Intentionally delegate an emotional or physical task to your partner and accept their help without micromanaging or re-doing it yourself."
        }
      ]
    }
  },

  "Fearful-Avoidant": {
    archetypeTitle: "The Disorganized Protector",
    shadowSubtype: "The Paradoxical Lover & Emotional Storm Walker",
    shortSummary:
      "You crave intoxicating, profound intimacy more than almost anyone, yet closeness activates immediate terror and suspicion. You oscillate between desperately pulling someone close and abruptly pushing them away when intimacy begins to feel real, creating a turbulent push-pull dynamic.",
    deepDive: {
      coreFear:
        "The double-bind terror: Utter terror of being abandoned combined with simultaneous terror of being trapped, violated, or consumed.",
      subconsciousDrive:
        "Testing partners relentlessly through emotional intensity to discover if they are resilient and trustworthy enough to withstand your chaos.",
      childhoodBlueprint:
        "Caregivers were often the source of both comfort and fear (trauma, volatile temperaments, substance issues, or severe neglect). The biological instinct to run toward the caregiver for safety clashed with the survival instinct to flee from them.",
      romanticTrap:
        "The High-Voltage Chaos Cycle: Calm, stable love feels boring or fake to you. You mistake chaotic emotional turbulence and anxiety for true soulmate passion, repeating turbulent cycles of reconciliation and rupture.",
      toxicTriggers: [
        "Experiencing a breakthrough of pure, peaceful intimacy (often followed by sudden self-sabotage the next morning).",
        "Feeling misunderstood, manipulated, or emotionally trapped.",
        "Perceiving unfair power imbalances or betrayal in loyalty."
      ],
      communicationFixes: [
        {
          impulse:
            "Abruptly breaking up, blocking, or starting an explosive fight to preemptively avoid being rejected first.",
          healthyReframe:
            "Acknowledging the paradox: 'I am experiencing a surge of fear because our closeness feels unfamiliar. Part of me wants to bolt, but I want to stay.'"
        },
        {
          impulse:
            "Testing loyalty through subtle provocations or cryptic silence to see if they fight for you.",
          healthyReframe:
            "Explicit reassurance request: 'I am feeling insecure about our connection right now. Can we spend 15 minutes checking in?'"
        }
      ],
      compatibilityAnalysis: {
        withSecure:
          "The most healing dynamic. Requires a patient, unshakeable partner whose consistency slowly recalibrates your fight-or-flight nervous system.",
        withAnxious:
          "Extremely triggering. You alternate between pulling them into intense intimacy and savagely pushing them away when triggered.",
        withAvoidant:
          "Painful stalemate. When you crave closeness, their avoidance triggers your rage; when they soften, your avoidant side flares up.",
        withFearful:
          "Extreme trauma bonding. Cycles of manic passion, mutual betrayal paranoia, and tearful reunions that exhaust both partners."
      },
      actionPlan30Days: [
        {
          phase: "Phase 1: Identifying the Pendulum Swing",
          days: "Days 1-7",
          focus: "Mapping Push vs Pull Cycles",
          exercise:
            "Keep a daily 'Tug-of-War' tracker. Rate your daily desire for closeness (1-10) vs desire to escape (1-10). Notice what triggered the shift."
        },
        {
          phase: "Phase 2: Decoupling Safety from Chaos",
          days: "Days 8-16",
          focus: "Rewiring Nervous System Baseline",
          exercise:
            "Practice sitting in peaceful, non-dramatic moments without scanning for hidden threats. Reassure your body: 'Quiet does not mean danger.'"
        },
        {
          phase: "Phase 3: Halting Preemptive Self-Sabotage",
          days: "Days 17-23",
          focus: "Surviving the Morning-After Closeness Vulnerability Hangover",
          exercise:
            "Write down a contract with yourself: No relationship decisions (breakups, ultimatums) can be made within 48 hours of feeling an intimacy surge."
        },
        {
          phase: "Phase 4: Inner Child Reparenting",
          days: "Days 24-30",
          focus: "Internalizing Self-Trust",
          exercise:
            "Spend 10 minutes nightly practicing visualization: reassuring your younger self that you are now an adult capable of setting boundaries and defending yourself without burning down the house."
        }
      ]
    }
  },

  "Secure": {
    archetypeTitle: "The Grounded Harmonizer",
    shadowSubtype: "The Empathetic Anchor & Boundaried Partner",
    shortSummary:
      "You have a resilient, trusting relationship with intimacy and independence. You communicate needs clearly without manipulation, navigate conflict constructively, and can offer consistent emotional support without sacrificing your fundamental self-respect.",
    deepDive: {
      coreFear:
        "Betrayal of core values or prolonged dishonesty in a partnership.",
      subconsciousDrive:
        "Building collaborative, emotionally nourishing, and mutually respectful partnerships where both individuals thrive.",
      childhoodBlueprint:
        "Caregivers were reliably attuned, validating, and safe. You learned that vulnerability produces comfort, mistakes can be repaired through open conversation, and boundaries are respected.",
      romanticTrap:
        "The Caretaker Trap: Because you are naturally patient and grounded, you risk staying too long in relationships with wounded partners, attempting to 'heal' them at the expense of your own vitality.",
      toxicTriggers: [
        "Chronic gaslighting or refusal to engage in collaborative repair.",
        "Partners repeatedly weaponizing silence or drama as manipulation.",
        "Severe boundary violations without remorse."
      ],
      communicationFixes: [
        {
          impulse:
            "Over-explaining yourself to appease an unregulated partner's anxiety or avoidance.",
          healthyReframe:
            "Affirming boundaries with love: 'I love you and want to resolve this, but I will not engage while insults or cold shoulders are being used.'"
        },
        {
          impulse:
            "Assuming every broken relationship can be redeemed with enough patience and compassion.",
          healthyReframe:
            "Honoring reality: 'Love alone is not enough; capacity for mutual repair is equally essential.'"
        }
      ],
      compatibilityAnalysis: {
        withSecure:
          "High harmony, smooth conflict resolution, and deep mutual emotional growth. The benchmark of conscious relationship.",
        withAnxious:
          "Naturally therapeutic for the anxious partner. As long as firm boundaries are held, the anxious partner softens into security.",
        withAvoidant:
          "Respects their need for space without taking detachment personally. Can bridge the gap if the avoidant partner desires growth.",
        withFearful:
          "Can anchor them if the fearful partner is committed to trauma work; however, unmanaged volatility can wear down the secure partner over time."
      },
      actionPlan30Days: [
        {
          phase: "Phase 1: Emotional Hygiene & Boundary Check",
          days: "Days 1-7",
          focus: "Preventing Compassion Fatigue",
          exercise:
            "Audit your energy investments. Ensure you are receiving an equitable return on emotional effort in your closest relationships."
        },
        {
          phase: "Phase 2: Deepening Intimacy & Vulnerability",
          days: "Days 8-16",
          focus: "Expressing Unfiltered Desires",
          exercise:
            "Challenge yourself to ask for what you desire without softening or moderating it for the comfort of others."
        },
        {
          phase: "Phase 3: Shadow Integration",
          days: "Days 17-23",
          focus: "Honoring Anger and Disappointment",
          exercise:
            "Give yourself explicit permission to feel irritation or indignation without immediately shifting into 'peacekeeper' mode."
        },
        {
          phase: "Phase 4: Relational Mastery Leadership",
          days: "Days 24-30",
          focus: "Co-creating Long-Term Relationship Vision",
          exercise:
            "Engage your partner in a structured 'Relationship State of the Union' to align long-term values, shared projects, and emotional goals."
        }
      ]
    }
  }
};
