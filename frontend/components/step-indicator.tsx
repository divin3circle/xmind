import { IconCheck } from "@tabler/icons-react";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  onStepClick: (stepNumber: number) => void;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  const getStepBorderColor = (step: number) => {
    if (step < currentStep) {
      return "border-green-500/50";
    }
    if (step === currentStep) {
      return "border-green-500/50";
    }
    return "border-green-500/10";
  };

  const getStepTextColor = (step: number) => {
    if (step < currentStep || step === currentStep) {
      return "";
    }
    return "text-muted-foreground";
  };

  const getDividerColor = (step: number) => {
    return step < currentStep ? "border-green-500/50" : "border-green-500/10";
  };

  return (
    <div className="flex mt-4 items-center justify-between">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center">
          <button
            onClick={() => {}}
            className={`border border-dashed w-6 h-6 flex items-center justify-center text-xs font-semibold cursor-pointer transition-colors hover:opacity-80 ${getStepBorderColor(
              step,
            )} ${getStepTextColor(step)}`}
            type="button"
          >
            {step < currentStep ? <IconCheck size={14} /> : step}
          </button>

          {index < steps.length - 1 && (
            <hr
              className={`md:w-24 w-10 border-t border-dashed inline-block ${getDividerColor(
                step,
              )}`}
              style={{ verticalAlign: "middle" }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
