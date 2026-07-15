import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ONBOARDING_STEPS } from "./onboardingSteps";

export function OnboardingTour({ open, onOpenChange, onFinish }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFinish: () => void;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const step = ONBOARDING_STEPS[stepIndex];
  const isLast = stepIndex === ONBOARDING_STEPS.length - 1;

  const handleClose = () => {
    onFinish();
    onOpenChange(false);
    setStepIndex(0);
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) handleClose(); }}>
      <DialogContent className="max-w-md overflow-hidden rounded-2xl p-0">
        <button
          onClick={handleClose}
          aria-label="Cerrar recorrido"
          className="absolute right-4 top-4 z-10 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-center gap-4 px-8 pb-6 pt-10 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={stepIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                {step.icon}
              </div>
              <h2 className="text-xl font-semibold text-foreground">{step.title}</h2>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center gap-1.5 pt-2">
            {ONBOARDING_STEPS.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === stepIndex ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/30",
                )}
              />
            ))}
          </div>

          <div className="mt-2 flex w-full items-center justify-between gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStepIndex((i) => i - 1)}
              className={cn("gap-1", stepIndex === 0 && "invisible")}
            >
              <ArrowLeft className="h-4 w-4" /> Atrás
            </Button>
            {isLast ? (
              <Button size="sm" onClick={handleClose} className="gap-1">
                Empezar
              </Button>
            ) : (
              <Button size="sm" onClick={() => setStepIndex((i) => i + 1)} className="gap-1">
                Siguiente <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
