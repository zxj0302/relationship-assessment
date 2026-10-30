import { Question } from "@/types/assessment";

export const QUESTION_BANK: Question[] = [
  {
    id: 1,
    dimension: "anxious",
    reversed: false,
    category: "Reassurance",
    prompt: "I frequently worry that romantic partners don't truly care about me as much as I care about them.",
    subtext: "Think about how you feel during periods of ordinary silence or delayed texts."
  },
  {
    id: 2,
    dimension: "avoidant",
    reversed: false,
    category: "Independence",
    prompt: "I feel suffocated or uneasy when a romantic partner starts wanting deep emotional closeness.",
    subtext: "Pay attention to your instinct to pull back when conversations turn intensely serious."
  },
  {
    id: 3,
    dimension: "anxious",
    reversed: false,
    category: "Vulnerability",
    prompt: "I need constant reassurance, confirmation, and explicit validation to feel safe in a relationship.",
    subtext: "Consider whether one loving gesture is enough or if your doubt quickly resurfaces."
  },
  {
    id: 4,
    dimension: "avoidant",
    reversed: false,
    category: "Intimacy",
    prompt: "I strongly prefer relying solely on myself rather than asking a partner for emotional help.",
    subtext: "Notice if depending on someone else feels dangerous, weak, or burdensome."
  },
  {
    id: 5,
    dimension: "anxious",
    reversed: false,
    category: "Conflict",
    prompt: "When my partner pulls away or seems distant, my immediate reaction is panic, urgency, or obsessing over what went wrong.",
    subtext: "Reflect on physical sensations like racing heartbeat or obsessive message checking."
  },
  {
    id: 6,
    dimension: "avoidant",
    reversed: false,
    category: "Intimacy",
    prompt: "I find it uncomfortable to express my deepest vulnerabilities and private feelings to anyone.",
    subtext: "Notice whether you keep private emotional walls even with those you cherish."
  },
  {
    id: 7,
    dimension: "anxious",
    reversed: false,
    category: "Reassurance",
    prompt: "I often abandon or compromise my personal boundaries just to prevent someone from leaving me.",
    subtext: "Think about times you said 'yes' when every fiber in you wanted to say 'no'."
  },
  {
    id: 8,
    dimension: "avoidant",
    reversed: false,
    category: "Conflict",
    prompt: "When relationship conflict arises, my default instinct is to shut down, go silent, or physically walk away.",
    subtext: "This includes the urge to isolate yourself until the emotional storm clears."
  },
  {
    id: 9,
    dimension: "anxious",
    reversed: false,
    category: "Vulnerability",
    prompt: "My mood for the entire day is intensely dictated by the current status of my romantic connection.",
    subtext: "If things feel 'off', it becomes difficult to focus on work, friends, or rest."
  },
  {
    id: 10,
    dimension: "avoidant",
    reversed: false,
    category: "Independence",
    prompt: "I often find flaws in partners or reminisce about 'the phantom ex' or independence as an escape route.",
    subtext: "The 'one flaw' syndrome: hyper-focusing on small quirks to rationalize detachment."
  },
  {
    id: 11,
    dimension: "anxious",
    reversed: true, // Secure buffer: "I am confident partner loves me even when busy"
    category: "Intimacy",
    prompt: "I feel calm, secure, and confident that my partner values me even when they are busy or physically apart.",
    subtext: "Reflect on whether time apart feels restorative or deeply threatening."
  },
  {
    id: 12,
    dimension: "avoidant",
    reversed: true, // Secure buffer: "I enjoy mutual dependence"
    category: "Intimacy",
    prompt: "I find it easy and fulfilling to share my innermost fears and depend on my partner for genuine comfort.",
    subtext: "Consider whether letting someone hold your grief feels natural."
  },
  {
    id: 13,
    dimension: "anxious",
    reversed: false,
    category: "Reassurance",
    prompt: "I often test my partner or send indirect signals just to see how fast and hard they will pursue me.",
    subtext: "Includes protest behaviors: withdrawing to provoke attention or asking leading questions."
  },
  {
    id: 14,
    dimension: "avoidant",
    reversed: false,
    category: "Independence",
    prompt: "Whenever someone gets very close to my true self, I feel an uncontrollable instinct to regain my freedom.",
    subtext: "The sudden claustrophobia that hits right after meaningful intimacy or commitment."
  },
  {
    id: 15,
    dimension: "anxious",
    reversed: false,
    category: "Conflict",
    prompt: "I find myself frequently replaying past arguments, analyzing micro-expressions, and expecting sudden abandonment.",
    subtext: "Hyper-vigilance to subtle changes in tone, punctuation, or body language."
  }
];
