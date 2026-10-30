import { Question } from "@/types/assessment";

export const QUESTION_BANK: Question[] = [
  // ==========================================
  // Dimension 1: Attachment Anxiety & Abandonment Fear (6 Questions)
  // ==========================================
  {
    id: 1,
    dimension: "anxious",
    reversed: false,
    category: "Reassurance",
    prompt: "When a romantic partner takes hours to reply while active on social media, my immediate internal reaction is panic or catastrophizing.",
    subtext: "Notice whether your nervous system registers silence as an impending sign of rejection or abandonment."
  },
  {
    id: 2,
    dimension: "anxious",
    reversed: false,
    category: "Reassurance",
    prompt: "I constantly need verbal confirmation and explicit signs that my partner still loves me and isn't losing interest.",
    subtext: "Consider whether a loving text from yesterday feels reassuring today, or if your anxiety resets by morning."
  },
  {
    id: 3,
    dimension: "anxious",
    reversed: false,
    category: "Vulnerability",
    prompt: "My emotional mood for an entire day is intensely dictated by the subtle warmth or coolness in my partner's voice.",
    subtext: "If things feel slightly 'off', it becomes difficult to focus on work, hobbies, or peaceful sleep."
  },
  {
    id: 4,
    dimension: "anxious",
    reversed: false,
    category: "Intimacy",
    prompt: "I often abandon my personal boundaries or say yes to things I dislike just to keep my partner pleased and prevent distance.",
    subtext: "Think about times you swallowed your own needs to preserve harmony or stop them from walking away."
  },
  {
    id: 5,
    dimension: "anxious",
    reversed: true, // Secure buffer: reverse scored
    category: "Reassurance",
    prompt: "I feel grounded and calm knowing my partner cares for me, even during extended periods when we are physically apart or busy.",
    subtext: "Reflect on whether independent time apart feels like peaceful restoration or an uncomfortable threat."
  },
  {
    id: 6,
    dimension: "anxious",
    reversed: false,
    category: "Vulnerability",
    prompt: "I catch myself engaging in 'protest behaviors'—like sending guilt-inducing texts, cold-shouldering, or testing their reaction—when feeling neglected.",
    subtext: "Unconsciously trying to provoke an intense reaction to prove they still care."
  },

  // ==========================================
  // Dimension 2: Intimacy Avoidance & Excessive Self-Reliance (6 Questions)
  // ==========================================
  {
    id: 7,
    dimension: "avoidant",
    reversed: false,
    category: "Independence",
    prompt: "When a partner begins asking for deeper emotional disclosure or talks about future commitments, I feel a sudden suffocating urge to pull back.",
    subtext: "The claustrophobic sensation that whispers: 'I am losing my freedom and autonomy.'"
  },
  {
    id: 8,
    dimension: "avoidant",
    reversed: false,
    category: "Intimacy",
    prompt: "I strongly prefer relying entirely on myself; depending on a partner for emotional soothing feels unsafe or weak.",
    subtext: "Notice your reflex to handle crisis or grief in complete solitude rather than letting someone hold space for you."
  },
  {
    id: 9,
    dimension: "avoidant",
    reversed: false,
    category: "Independence",
    prompt: "I frequently fixate on small flaws or irritating habits in a partner as a subconscious reason to justify stepping back.",
    subtext: "The 'flaw-magnifier': searching for reasons why this person isn't 'the one' when intimacy deepens."
  },
  {
    id: 10,
    dimension: "avoidant",
    reversed: false,
    category: "Vulnerability",
    prompt: "I keep a private emotional fortress; even people I love rarely know what I am genuinely wrestling with inside.",
    subtext: "Showing only your composed, competent side while keeping deep pain tucked away."
  },
  {
    id: 11,
    dimension: "avoidant",
    reversed: true, // Secure buffer: reverse scored
    category: "Intimacy",
    prompt: "I find it natural and relieving to express my raw vulnerabilities, fears, and tears directly in front of a romantic partner.",
    subtext: "Consider whether being seen in your broken moments feels like a warm embrace or terrifying exposure."
  },
  {
    id: 12,
    dimension: "avoidant",
    reversed: false,
    category: "Independence",
    prompt: "Whenever a relationship feels exceptionally close and happy, a subconscious voice starts anticipating betrayal or planning an exit strategy.",
    subtext: "The defensive reflex: preparing for the fall before the other person can hurt you first."
  },

  // ==========================================
  // Dimension 3: Conflict Shadow & Stress Response (6 Questions)
  // ==========================================
  {
    id: 13,
    dimension: "conflict",
    reversed: false,
    category: "Conflict",
    prompt: "During relationship disagreements, my instinct is to immediately shut down, go mute, or physically leave the room.",
    subtext: "The Flight/Freeze response: complete emotional paralysis to prevent an overwhelming nervous system crash."
  },
  {
    id: 14,
    dimension: "conflict",
    reversed: false,
    category: "Conflict",
    prompt: "When I sense distance or unresolved tension, I become relentless—demanding we solve it immediately, even if it's 2 AM.",
    subtext: "The Fight response: an urgent intolerance of emotional ambiguity where unresolved silence feels unbearable."
  },
  {
    id: 15,
    dimension: "conflict",
    reversed: false,
    category: "Conflict",
    prompt: "During arguments, I automatically over-apologize and take all blame upon myself just to make the anger or tension stop.",
    subtext: "The Fawn response: appeasing the other person at the expense of your own truth to maintain perceived safety."
  },
  {
    id: 16,
    dimension: "conflict",
    reversed: true, // Secure buffer: reverse scored
    category: "Conflict",
    prompt: "I can sit with a partner during tough conversations, listen without getting defensive, and take time to pause before responding.",
    subtext: "The ability to stay connected without collapsing inward or lashing out."
  },
  {
    id: 17,
    dimension: "conflict",
    reversed: false,
    category: "Conflict",
    prompt: "After a conflict, I hold silent grudges or emotionally punish my partner for days rather than speaking my hurt directly.",
    subtext: "Using cold withdrawal as a defensive armor to protect your bruised vulnerability."
  },
  {
    id: 18,
    dimension: "conflict",
    reversed: false,
    category: "Conflict",
    prompt: "In heated moments, I mentally check out (dissociate) and feel like an outside observer watching a movie rather than being present.",
    subtext: "The nervous system numbing out to shield you from emotional overwhelm."
  },

  // ==========================================
  // Dimension 4: Subconscious Childhood Blueprint (6 Questions)
  // ==========================================
  {
    id: 19,
    dimension: "childhood",
    reversed: false,
    category: "ChildhoodWound",
    prompt: "Growing up, I felt I had to be 'the good kid'—high-achieving, quiet, or helpful—to earn love and avoid being a burden.",
    subtext: "The Good Child Contract: believing that your natural, messy self is unlovable unless you provide utility."
  },
  {
    id: 20,
    dimension: "childhood",
    reversed: false,
    category: "ChildhoodWound",
    prompt: "In my childhood home, emotions were either explosive and unpredictable or completely ignored and swept under the rug.",
    subtext: "Growing up in an emotional climate where vulnerability was met with shame, criticism, or chaos."
  },
  {
    id: 21,
    dimension: "childhood",
    reversed: false,
    category: "ChildhoodWound",
    prompt: "I often felt responsible for managing the mood, anger, or sadness of one or both of my caregivers.",
    subtext: "Emotional parentification: hyper-tuning your radar to adult emotional volatility at an early age."
  },
  {
    id: 22,
    dimension: "childhood",
    reversed: false,
    category: "ChildhoodWound",
    prompt: "When I needed genuine comforting as a child, I learned that crying or complaining only made things worse or drew coldness.",
    subtext: "The foundation of avoidant defense: learning that nobody is coming to comfort you, so you must self-rely."
  },
  {
    id: 23,
    dimension: "childhood",
    reversed: true, // Secure buffer: reverse scored
    category: "ChildhoodWound",
    prompt: "My caregivers consistently validated my feelings and apologized when they made mistakes or hurt me.",
    subtext: "Experiencing healthy relational repair and emotional predictability growing up."
  },
  {
    id: 24,
    dimension: "childhood",
    reversed: false,
    category: "ChildhoodWound",
    prompt: "Deep down, I carry an underlying fear that if someone truly saw all of my hidden darkness, they would leave in disgust.",
    subtext: "The core shadow wound of defectiveness and unconditional unworthiness."
  }
];
