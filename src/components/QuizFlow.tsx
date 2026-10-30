"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { QUESTION_BANK } from "@/data/questions";
import { calculateAssessmentScores } from "@/lib/scoring";
import {
  ArrowLeft,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Lock,
} from "lucide-react";

export function QuizFlow() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatingStep, setCalculatingStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Transition and debounce lock to prevent rapid clicks skipping questions
  const isTransitioningRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const totalQuestions = QUESTION_BANK.length;
  const currentQuestion = QUESTION_BANK[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  const selectedValue = answers[currentQuestion.id];

  const handleSelectOption = (value: number) => {
    // If already processing next question or submitting, ignore duplicate clicks
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
    isTransitioningRef.current = false;
    setIsTransitioning(false);

    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const finishAssessment = async (finalAnswers: Record<number, number>) => {
    setIsSubmitting(true);

    // Trigger calculating phases for high anticipation / Barnum psychological hook
    const calculationPhases = [
      "Calculating anxiety & avoidance dimensions...",
      "Detecting nervous system protest behaviors...",
      "Mapping childhood attachment conditioning...",
      "Synthesizing your subconscious shadow blueprint...",
      "Generating your personalized report teaser...",
    ];

    for (let i = 0; i < calculationPhases.length; i++) {
      setCalculatingStep(i);
      await new Promise((res) => setTimeout(res, 650));
    }

    // Compute scores
    const breakdown = calculateAssessmentScores(finalAnswers);

    // Persist scores locally to support teaser page
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("assessment_scores", JSON.stringify(breakdown));
        localStorage.setItem("latest_assessment_scores", JSON.stringify(breakdown));
      } catch (storageErr) {
        console.warn("Local storage write failed (e.g. Safari private browsing or storage quota exceeded):", storageErr);
      }
    }

    router.push("/results/teaser");
  };

  if (isSubmitting) {
    const steps = [
      "Calibrating ECR-R Psychometric Dimensions...",
      "Analyzing Subconscious Threat Triggers...",
      "Mapping Romantic Attraction Patterns...",
      "Formulating Shadow Defense Profile...",
      "Finalizing Free Teaser Report...",
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
          Analyzing Your Psychological Blueprint
        </h2>
        <p className="text-sm font-medium text-stone-500 max-w-sm mx-auto h-8 transition-all">
          {steps[calculatingStep] || "Processing responses..."}
        </p>

        <div className="w-64 bg-stone-200 h-1.5 rounded-full mt-6 overflow-hidden">
          <motion.div
            className="h-full bg-rose-700"
            initial={{ width: "10%" }}
            animate={{ width: `${((calculatingStep + 1) / steps.length) * 100}%` }}
            transition={{ ease: "easeInOut", duration: 0.5 }}
          />
        </div>
      </div>
    );
  }

  const options = [
    { value: 1, label: "Strongly Disagree", short: "1" },
    { value: 2, label: "Disagree", short: "2" },
    { value: 3, label: "Neutral / Unsure", short: "3" },
    { value: 4, label: "Agree", short: "4" },
    { value: 5, label: "Strongly Agree", short: "5" },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      {/* Quiz Header & Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-semibold text-stone-500 mb-2">
          <span>Question {currentIndex + 1} of {totalQuestions}</span>
          <span className="text-rose-800 font-bold">{progressPercent}% Completed</span>
        </div>
        <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
          <motion.div
            className="bg-rose-800 h-full rounded-full"
            initial={false}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question Card Slide Transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-sm"
        >
          {/* Category Tag */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs uppercase tracking-wider font-bold text-stone-400 bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
              Dimension: {currentQuestion.category}
            </span>
            <div className="flex items-center gap-1 text-xs text-stone-400">
              <Lock className="w-3 h-3" />
              <span>Private & Untracked</span>
            </div>
          </div>

          {/* Prompt */}
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 leading-snug mb-3">
            &ldquo;{currentQuestion.prompt}&rdquo;
          </h2>

          {currentQuestion.subtext && (
            <p className="text-xs sm:text-sm text-stone-500 mb-8 italic flex items-start gap-1.5">
              <HelpCircle className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
              <span>{currentQuestion.subtext}</span>
            </p>
          )}

          {/* Options Grid */}
          <div className="space-y-3">
            {options.map((opt) => {
              const isSelected = selectedValue === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  disabled={isTransitioning || isSubmitting}
                  onClick={() => handleSelectOption(opt.value)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group active:scale-[0.99] disabled:cursor-not-allowed ${
                    isSelected
                      ? "border-rose-800 bg-rose-50/50 text-rose-950 font-semibold ring-2 ring-rose-800/20"
                      : "border-stone-200 hover:border-stone-300 hover:bg-stone-50/80 text-stone-800"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        isSelected
                          ? "bg-rose-800 text-white"
                          : "bg-stone-100 text-stone-600 group-hover:bg-stone-200"
                      }`}
                    >
                      {opt.short}
                    </span>
                    <span className="text-sm sm:text-base">{opt.label}</span>
                  </div>

                  {isSelected && (
                    <CheckCircle className="w-5 h-5 text-rose-800 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-stone-100">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0 || isSubmitting}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition ${
                currentIndex === 0 || isSubmitting
                  ? "opacity-30 cursor-not-allowed text-stone-400"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="text-xs text-stone-400">
              Select an answer to proceed automatically
            </span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
