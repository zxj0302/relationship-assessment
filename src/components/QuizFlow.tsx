"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { QUESTION_BANK } from "@/data/questions";
import { calculateAssessmentScores } from "@/lib/scoring";
import { RelationshipStatus } from "@/types/assessment";
import {
  ArrowLeft,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Lock,
  Compass,
} from "lucide-react";

export function QuizFlow() {
  const router = useRouter();
  const [relationshipStatus, setRelationshipStatus] = useState<RelationshipStatus | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatingStep, setCalculatingStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [milestoneNotice, setMilestoneNotice] = useState<string | null>(null);

  // Transition and debounce lock to prevent rapid clicks skipping questions
  const isTransitioningRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const milestoneTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (milestoneTimerRef.current) {
        clearTimeout(milestoneTimerRef.current);
      }
    };
  }, []);

  const totalQuestions = QUESTION_BANK.length;
  const currentQuestion = QUESTION_BANK[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  const selectedValue = currentQuestion ? answers[currentQuestion.id] : undefined;

  const handleSelectStatus = (status: RelationshipStatus) => {
    setRelationshipStatus(status);
  };

  const handleSelectOption = (value: number) => {
    if (isTransitioningRef.current || isSubmitting) {
      return;
    }

    isTransitioningRef.current = true;
    setIsTransitioning(true);

    const updated = { ...answers, [currentQuestion.id]: value };
    setAnswers(updated);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (milestoneTimerRef.current) {
      clearTimeout(milestoneTimerRef.current);
    }

    // Micro-milestone triggers
    if (currentIndex === 7) {
      setMilestoneNotice("Baseline Calibration Complete: Your intimacy & attachment radar is mapped.");
      milestoneTimerRef.current = setTimeout(() => setMilestoneNotice(null), 2500);
    } else if (currentIndex === 15) {
      setMilestoneNotice("Deep Pattern Detected: Calibrating your conflict response and defensive armor.");
      milestoneTimerRef.current = setTimeout(() => setMilestoneNotice(null), 2500);
    }

    // Auto-advance after small tactile delay for smooth UX
    timerRef.current = setTimeout(() => {
      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex((prev) => prev + 1);
        isTransitioningRef.current = false;
        setIsTransitioning(false);
      } else {
        finishAssessment(updated);
      }
    }, 250);
  };

  const handlePrev = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (milestoneTimerRef.current) {
      clearTimeout(milestoneTimerRef.current);
    }
    isTransitioningRef.current = false;
    setIsTransitioning(false);

    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      setRelationshipStatus(null);
    }
  };

  const finishAssessment = async (finalAnswers: Record<number, number>) => {
    setIsSubmitting(true);

    const calculationPhases = [
      "Calibrating 24 behavioral and somatic attachment markers...",
      "Cross-referencing ECR-R benchmark database (120,000+ profiles)...",
      "Analyzing nervous system conflict responses (Fight / Flight / Freeze / Fawn)...",
      "Decoding subconscious childhood conditioning & partner attraction loops...",
      "Generating your personalized 12-page recovery & shadow report...",
    ];

    for (let i = 0; i < calculationPhases.length; i++) {
      setCalculatingStep(i);
      await new Promise((res) => setTimeout(res, 600));
    }

    // Compute scores
    const breakdown = calculateAssessmentScores(finalAnswers, relationshipStatus || "single");

    // Persist scores and raw answers locally to support teaser page and checkout
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("assessment_scores", JSON.stringify(breakdown));
        sessionStorage.setItem("assessment_answers", JSON.stringify(finalAnswers));
        sessionStorage.setItem("assessment_relationship_status", relationshipStatus || "single");
        localStorage.setItem("latest_assessment_scores", JSON.stringify(breakdown));
        localStorage.setItem("latest_assessment_answers", JSON.stringify(finalAnswers));
        localStorage.setItem("latest_relationship_status", relationshipStatus || "single");
      } catch (storageErr) {
        console.warn("Local storage write failed:", storageErr);
      }
    }

    router.push("/results/teaser");
  };

  // Step 0: Relationship status pre-qualification onboarding screen
  if (!relationshipStatus) {
    const statusOptions: { id: RelationshipStatus; title: string; desc: string; icon: string }[] = [
      { id: "single", title: "Single & Reflecting", desc: "Understanding past relationship loops before dating again.", icon: "🌱" },
      { id: "dating", title: "Dating / Early Stage", desc: "Navigating new connections and early attachment triggers.", icon: "✨" },
      { id: "in_relationship", title: "In a Committed Partnership", desc: "Deepening emotional intimacy and resolving recurring friction.", icon: "💍" },
      { id: "complicated", title: "It's Complicated / On-and-Off", desc: "Trapped in an anxious-avoidant cycle or mixed signals.", icon: "🌪️" },
      { id: "healing", title: "Healing from a Recent Breakup", desc: "Making sense of what went wrong and reclaiming your power.", icon: "❤️‍🩹" },
    ];

    return (
      <div className="max-w-xl mx-auto px-4 py-8 sm:py-12">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200 mb-3">
            <Compass className="w-3.5 h-3.5" />
            Step 1 of 2: Personal Context
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mb-2">
            What is your current relationship status?
          </h1>
          <p className="text-sm text-stone-600 max-w-md mx-auto">
            This personalizes your analysis report, shadow patterns, and custom 30-day action plan.
          </p>
        </div>

        <div className="space-y-3">
          {statusOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelectStatus(opt.id)}
              className="w-full text-left p-4 sm:p-5 rounded-2xl border-2 border-stone-200 bg-white hover:border-rose-600 hover:bg-rose-50/40 transition-all flex items-start gap-4 shadow-sm hover:shadow-md group active:scale-[0.99]"
            >
              <span className="text-2xl shrink-0 p-2 bg-stone-50 rounded-xl group-hover:scale-110 transition-transform">
                {opt.icon}
              </span>
              <div>
                <h3 className="font-semibold text-stone-900 group-hover:text-rose-950 text-base">
                  {opt.title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 mt-0.5 leading-relaxed">
                  {opt.desc}
                </p>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 text-center text-xs text-stone-400 flex items-center justify-center gap-2">
          <Lock className="w-3 h-3" />
          <span>Anonymous & confidential • 24 questions • Takes ~3 minutes</span>
        </div>
      </div>
    );
  }

  if (isSubmitting) {
    const steps = [
      "Calibrating 24 behavioral and somatic attachment markers...",
      "Cross-referencing ECR-R benchmark database (120,000+ profiles)...",
      "Analyzing nervous system conflict responses (Fight / Flight / Freeze / Fawn)...",
      "Decoding subconscious childhood conditioning & partner attraction loops...",
      "Compiling your personalized 12-page recovery & shadow report...",
    ];

    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-20 h-20 relative mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-rose-200 animate-ping opacity-30" />
          <div className="w-20 h-20 rounded-full border-4 border-stone-200 border-t-rose-700 animate-spin flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-rose-700 animate-pulse" />
          </div>
        </div>

        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mb-3">
          Analyzing Your Relational Architecture
        </h2>
        <p className="text-sm font-medium text-stone-500 max-w-md mx-auto h-10 transition-all">
          {steps[calculatingStep] || "Processing responses..."}
        </p>

        <div className="w-72 bg-stone-200 h-2 rounded-full mt-6 overflow-hidden shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-rose-600 to-amber-600 rounded-full"
            initial={{ width: "10%" }}
            animate={{ width: `${((calculatingStep + 1) / steps.length) * 100}%` }}
            transition={{ ease: "easeInOut", duration: 0.5 }}
          />
        </div>

        <div className="mt-8 flex items-center gap-3 text-xs text-stone-400">
          <span className="flex items-center gap-1 text-emerald-600 font-semibold">
            <CheckCircle className="w-3.5 h-3.5" /> ECR-R Standard
          </span>
          <span>•</span>
          <span>Somatic Markers</span>
          <span>•</span>
          <span>Attachment Matrix</span>
        </div>
      </div>
    );
  }

  const options = [
    { value: 1, label: "Strongly Disagree", hint: "Never reflects my pattern" },
    { value: 2, label: "Disagree", hint: "Rarely true for me" },
    { value: 3, label: "Neutral / Unsure", hint: "Depends on context" },
    { value: 4, label: "Agree", hint: "Frequently resonates" },
    { value: 5, label: "Strongly Agree", hint: "Deeply describes my reflex" },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
      {/* Top Header & Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1 -ml-1 text-stone-400 hover:text-stone-800 transition rounded-lg hover:bg-stone-100"
              aria-label="Previous question"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span>
              Question {currentIndex + 1} of {totalQuestions}
            </span>
          </div>

          <span className="text-rose-700 font-bold">{progressPercent}% Completed</span>
        </div>

        {/* Progress Bar with Milestone Markers */}
        <div className="relative w-full bg-stone-200 h-2.5 rounded-full overflow-hidden shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-rose-600 to-amber-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ ease: "easeOut", duration: 0.25 }}
          />
        </div>

        {/* Category Pill */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-md border border-stone-200">
            Dimension: {currentQuestion.category}
          </span>
          <span className="text-[11px] text-stone-400">
            Select the rating that feels most intuitive
          </span>
        </div>
      </div>

      {/* Milestone Floating Alert */}
      <AnimatePresence>
        {milestoneNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs px-3.5 py-2 rounded-xl mb-4 flex items-center gap-2 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{milestoneNotice}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question Card Screen */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -15 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/90 shadow-sm mb-6"
        >
          <div className="min-h-[110px] sm:min-h-[120px] flex flex-col justify-center mb-8">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 leading-snug sm:leading-relaxed">
              &ldquo;{currentQuestion.prompt}&rdquo;
            </h2>

            {currentQuestion.subtext && (
              <p className="text-xs sm:text-sm text-stone-500 mt-3 flex items-start gap-1.5 leading-relaxed bg-stone-50/80 p-2.5 rounded-xl border border-stone-200/50">
                <HelpCircle className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                <span>{currentQuestion.subtext}</span>
              </p>
            )}
          </div>

          {/* Options: 5-Point Scale with Contextual Subtitles */}
          <div className="space-y-2.5">
            {options.map((opt) => {
              const isSelected = selectedValue === opt.value;

              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelectOption(opt.value)}
                  disabled={isTransitioning}
                  className={`w-full flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? "border-rose-600 bg-rose-50/80 text-rose-950 font-semibold shadow-sm ring-2 ring-rose-600/20"
                      : "border-stone-200 hover:border-rose-300 hover:bg-stone-50/80 text-stone-700"
                  } ${isTransitioning ? "opacity-75 cursor-wait" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition ${
                        isSelected
                          ? "bg-rose-700 text-white"
                          : "bg-stone-100 text-stone-500 border border-stone-300"
                      }`}
                    >
                      {opt.value}
                    </div>
                    <div>
                      <span className="text-sm sm:text-base font-medium">{opt.label}</span>
                      <span className="hidden sm:inline-block ml-2 text-xs text-stone-400 font-normal">
                        — {opt.hint}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <CheckCircle className="w-4 h-4 text-rose-700 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Security & Confidentiality Tagline */}
      <div className="flex items-center justify-between text-xs text-stone-400 px-2">
        <div className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5" />
          <span>Responses are encrypted & confidential</span>
        </div>
        <span>Based on ECR-R Psychological Standard</span>
      </div>
    </div>
  );
}
