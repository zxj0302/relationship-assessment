import { QuizFlow } from "@/components/QuizFlow";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Assessment - Attachment Style & Relationship Shadow Test",
  description: "Complete the 24-question ECR-R relational psychometric inventory to uncover your attachment archetype and subconscious shadow patterns.",
};

export default function QuizPage() {
  return (
    <div className="py-6 sm:py-10">
      <QuizFlow />
    </div>
  );
}
