// FormFilling.tsx - For the Tax Form Filling section
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Bot,
  Database,
  Edit3,
  FileText,
  Upload,
} from "lucide-react";
import { useState } from "react";

const formTypes = [
  {
    id: "modelo100",
    name: "Modelo 100",
    description: "Income tax return",
    icon: FileText,
  },
  {
    id: "modelo303",
    name: "Modelo 303",
    description: "VAT return",
    icon: FileText,
  },
  {
    id: "modelo349",
    name: "Modelo 349",
    description: "EC Sales List",
    icon: FileText,
  },
  {
    id: "modelo390",
    name: "Modelo 390",
    description: "Annual VAT summary",
    icon: FileText,
  },
];

const formMethods = [
  {
    id: "manual",
    icon: Edit3,
    title: "Fill by hand",
    description: "Manually enter your tax information",
  },
  {
    id: "ai",
    icon: Bot,
    title: "Fill by friendly Q&A chat with AI",
    description: "Let our AI assistant guide you through the form",
  },
  {
    id: "upload",
    icon: Upload,
    title: "Fill by uploading filled old form",
    description: "Upload your previous tax form",
  },
  {
    id: "lookup",
    icon: Database,
    title: "Fill by lookup info from govt website (API) via ID",
    description: "Quickly import your information using your ID",
  },
];

interface FormFillingProps {
  onNext: () => void;
  onPrevious?: () => void;
  step: "form-type" | "form-method";
  setStep: (step: "form-type" | "form-method") => void;
}

export function FormFilling({ onNext, step, setStep }: FormFillingProps) {
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const handleContinue = () => {
    if (step === "form-type" && selectedForm) {
      setStep("form-method");
    } else if (step === "form-method" && selectedMethod) {
      onNext(); // Move to the next main step
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {step === "form-type" ? "Select Form Type" : "Select Method"}
        </CardTitle>
        <CardDescription>
          {step === "form-type"
            ? "Choose the tax form you need to file"
            : "Select how you'd like to complete your tax form"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === "form-type" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formTypes.map((type) => (
              <Card
                key={type.id}
                className={cn(
                  "cursor-pointer hover:border-primary transition-colors",
                  selectedForm === type.id &&
                    "border-primary ring-1 ring-primary"
                )}
                onClick={() => setSelectedForm(type.id)}
              >
                <CardContent className="flex items-center p-4">
                  <div className="bg-primary/10 p-3 rounded-full mr-4">
                    <type.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{type.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {type.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formMethods.map((method) => (
              <Card
                key={method.id}
                className={cn(
                  "cursor-pointer hover:border-primary transition-colors",
                  selectedMethod === method.id &&
                    "border-primary ring-1 ring-primary"
                )}
                onClick={() => setSelectedMethod(method.id)}
              >
                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                  <method.icon className="h-12 w-12 mb-4 text-gray-600" />
                  <h3 className="font-medium">{method.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    {method.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="flex justify-end mt-6">
          <Button
            onClick={handleContinue}
            disabled={
              (step === "form-type" && !selectedForm) ||
              (step === "form-method" && !selectedMethod)
            }
            className="flex items-center gap-2"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
