import { QuizFlow } from "@/components/QuizFlow";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Assessment - Attachment Style & Relationship Shadow Test",
  description: "Complete the 15-question ECR-R relational psychometric inventory.",
};

export default function QuizPage() {
  return (
    <div className="py-6 sm:py-10">
      <QuizFlow />
    </div>
  );
}
