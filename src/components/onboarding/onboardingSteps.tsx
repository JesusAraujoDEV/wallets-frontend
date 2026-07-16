import { LayoutDashboard, WalletCards, ArrowLeftRight, TrendingUp, PiggyBank, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

export type OnboardingStep = {
  icon: ReactNode;
  titleKey: string;
  descriptionKey: string;
};

export const ONBOARDING_STEPS: OnboardingStep[] = [
  { icon: <Sparkles className="h-8 w-8" />, titleKey: "onboarding.step1Title", descriptionKey: "onboarding.step1Desc" },
  { icon: <WalletCards className="h-8 w-8" />, titleKey: "onboarding.step2Title", descriptionKey: "onboarding.step2Desc" },
  { icon: <ArrowLeftRight className="h-8 w-8" />, titleKey: "onboarding.step3Title", descriptionKey: "onboarding.step3Desc" },
  { icon: <TrendingUp className="h-8 w-8" />, titleKey: "onboarding.step4Title", descriptionKey: "onboarding.step4Desc" },
  { icon: <PiggyBank className="h-8 w-8" />, titleKey: "onboarding.step5Title", descriptionKey: "onboarding.step5Desc" },
  { icon: <LayoutDashboard className="h-8 w-8" />, titleKey: "onboarding.step6Title", descriptionKey: "onboarding.step6Desc" },
];
