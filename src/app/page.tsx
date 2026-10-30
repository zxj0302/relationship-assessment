import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Award,
  Flame,
  Clock,
  Compass,
  FileCheck2,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Decorative Warm Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[480px] bg-gradient-to-b from-orange-100/50 via-rose-50/30 to-transparent pointer-events-none -z-10 blur-3xl" />

      {/* Hero Section */}
      <section className="pt-12 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-6 max-w-5xl mx-auto text-center">
        {/* Social Proof Pill */}
        <div className="inline-flex items-center gap-2 bg-stone-100 border border-stone-200/80 rounded-full px-4 py-1.5 mb-8 shadow-sm">
          <div className="flex -space-x-1.5 overflow-hidden">
            <span className="inline-block h-5 w-5 rounded-full ring-2 ring-white bg-rose-300" />
            <span className="inline-block h-5 w-5 rounded-full ring-2 ring-white bg-amber-300" />
            <span className="inline-block h-5 w-5 rounded-full ring-2 ring-white bg-emerald-300" />
          </div>
          <span className="text-xs font-medium text-stone-700">
            Over <strong className="font-semibold text-stone-900">120,000+</strong> assessments taken
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        {/* Headline */}
        <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-stone-900 leading-[1.15] mb-6">
          Discover Your Attachment Style <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-rose-800 via-orange-800 to-amber-900 bg-clip-text text-transparent">
            & Hidden Relationship Blindspots
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-stone-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          A 3-minute evidence-based clinical assessment to uncover why you love, pull away, or react the way you do — and how to break exhausting relationship cycles.
        </p>

        {/* Big Sticky CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-10">
          <Link
            href="/quiz"
            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-stone-900 hover:bg-stone-800 text-white font-medium text-lg px-8 py-4 rounded-xl shadow-lg shadow-stone-900/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Start Free Assessment</span>
            <ArrowRight className="w-5 h-5 text-rose-300" />
          </Link>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-stone-500 font-medium">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-stone-400" />
            <span>Takes ~3 minutes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Confidential & Anonymous</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-600" />
            <span>ECR-R Clinical Psychometrics</span>
          </div>
        </div>
      </section>

      {/* 4 Archetypes Preview Grid */}
      <section className="py-12 bg-stone-100/70 border-y border-stone-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mb-3">
              The 4 Relational Blueprints
            </h2>
            <p className="text-sm text-stone-600">
              Your unconscious attachment pattern dictates 80% of your partner attraction, anxiety triggers, and subconscious conflict responses.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                title: "Anxious-Preoccupied",
                subtitle: "The Hyper-Vigilant Devotee",
                desc: "High intimacy drive, hyper-attuned to shifts in connection, prone to sudden panic when space is taken.",
                tag: "High Anxiety • Low Avoidance",
                color: "bg-rose-50 border-rose-200 text-rose-900",
              },
              {
                title: "Dismissive-Avoidant",
                subtitle: "The Fortress of Autonomy",
                desc: "Values fierce independence, retreats from intense emotional vulnerability, shuts down during conflict.",
                tag: "Low Anxiety • High Avoidance",
                color: "bg-sky-50 border-sky-200 text-sky-900",
              },
              {
                title: "Fearful-Avoidant",
                subtitle: "The Disorganized Protector",
                desc: "Craves profound intimacy but instinctively fears engulfment or abandonment. Oscillates between pull & push.",
                tag: "High Anxiety • High Avoidance",
                color: "bg-purple-50 border-purple-200 text-purple-900",
              },
              {
                title: "Secure",
                subtitle: "The Grounded Harmonizer",
                desc: "Comfortable with vulnerability and space, communicates boundaries calmly, regulates distress collaboratively.",
                tag: "Low Anxiety • Low Avoidance",
                color: "bg-emerald-50 border-emerald-200 text-emerald-900",
              },
            ].map((arch, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <span
                    className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full border mb-3 ${arch.color}`}
                  >
                    {arch.tag}
                  </span>
                  <h3 className="font-serif text-lg font-bold text-stone-900">{arch.title}</h3>
                  <h4 className="text-xs font-medium text-stone-500 mb-3 italic">{arch.subtitle}</h4>
                  <p className="text-xs text-stone-600 leading-relaxed">{arch.desc}</p>
                </div>
                <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400">
                  <span>Dimension Profile</span>
                  <Compass className="w-3.5 h-3.5 text-stone-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why This Test is Different */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-widest font-semibold text-rose-800">
            Psychological Depth
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mt-2 mb-4">
            Beyond Generic Personality Quizzes
          </h2>
          <p className="text-stone-600 text-sm sm:text-base">
            Most online tests give you surface labels. We analyze your childhood imprint, somatic triggers, and relational shadow habits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-7 rounded-2xl border border-stone-200 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700 mb-5">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-stone-900 mb-2">
              Unconscious Shadow Archetype
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Uncover the defensive armor you put on when feeling threatened: protest behaviors, emotional stonewalling, or preemptive self-sabotage.
            </p>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-stone-200 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 mb-5">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-stone-900 mb-2">
              The Attraction Magnet Formula
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Understand why you are magnetically pulled toward specific partners who trigger your deepest wounds, and how to rewire this pattern.
            </p>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-stone-200 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 mb-5">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-stone-900 mb-2">
              30-Day Rewiring Roadmap
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Get somatic grounding exercises, communication scripts, and concrete weekly habits to build lasting relational security.
            </p>
          </div>
        </div>

        {/* Bottom Banner CTA */}
        <div className="mt-16 bg-gradient-to-br from-stone-900 to-stone-800 text-white rounded-3xl p-8 sm:p-12 text-center shadow-xl">
          <h3 className="font-serif text-2xl sm:text-3xl font-bold mb-4">
            Ready to uncover your relationship blindspots?
          </h3>
          <p className="text-stone-300 text-sm max-w-xl mx-auto mb-8">
            Join over 120,000+ individuals who have taken this test to transform how they navigate love, intimacy, and conflict.
          </p>
          <Link
            href="/quiz"
            className="inline-flex items-center gap-2 bg-white text-stone-900 font-semibold px-8 py-4 rounded-xl hover:bg-stone-100 transition shadow-md hover:scale-105 active:scale-95"
          >
            <span>Begin Free Assessment</span>
            <ArrowRight className="w-4 h-4 text-stone-900" />
          </Link>
        </div>
      </section>
    </div>
  );
}
