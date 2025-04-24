// src/components/onboarding/FormFilling.tsx
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Database,
  Edit3,
  FileText,
  Upload,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AiChatAssistant } from "./ai-chat-assistant/AiChatAssistant";
import { FormUpload } from "./form-upload/FormUpload";
import { IdLookup } from "./id-lookup/IdLookup";
import { ManualFormFilling } from "./manual-form-filling/Manual-Form-Filling";

// Define types
interface FormFillingProps {
  onNext: () => void;
  onPrevious: () => void;
  step: "form-type" | "form-method";
  setStep: (step: "form-type" | "form-method") => void;
}

interface FormType {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
}

interface FormMethod {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
}

// Form types
const formTypes: FormType[] = [
  {
    id: "modelo100",
    name: "Modelo 100",
    description: "Declaración de la Renta (IRPF)",
    icon: FileText,
  },
  {
    id: "modelo303",
    name: "Modelo 303",
    description: "Declaración de IVA",
    icon: FileText,
  },
  {
    id: "modelo349",
    name: "Modelo 349",
    description: "Operaciones intracomunitarias",
    icon: FileText,
  },
  {
    id: "modelo390",
    name: "Modelo 390",
    description: "Resumen anual de IVA",
    icon: FileText,
  },
];

// Form methods
const formMethods: FormMethod[] = [
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

export function FormFilling({
  onNext,
  onPrevious,
  step,
  setStep,
}: FormFillingProps): React.ReactElement {
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [showAiChat, setShowAiChat] = useState<boolean>(false);
  const [showManualForm, setShowManualForm] = useState<boolean>(false);
  const [showUploadForm, setShowUploadForm] = useState<boolean>(false);
  const [showIdLookup, setShowIdLookup] = useState<boolean>(false);

  // Get selected form details
  const selectedFormDetails = formTypes.find(
    (form) => form.id === selectedForm
  );

  const handleFormTypeSelect = (formId: string): void => {
    setSelectedForm(formId);
  };

  const handleMethodSelect = (methodId: string): void => {
    setSelectedMethod(methodId);

    // Reset all component visibility
    setShowAiChat(false);
    setShowManualForm(false);
    setShowUploadForm(false);
    setShowIdLookup(false);

    // Show the appropriate component based on the selected method
    switch (methodId) {
      case "ai":
        setShowAiChat(true);
        break;
      case "manual":
        setShowManualForm(true);
        break;
      case "upload":
        setShowUploadForm(true);
        break;
      case "lookup":
        setShowIdLookup(true);
        break;
      default:
        break;
    }
  };

  const handleContinue = (): void => {
    if (step === "form-type" && selectedForm) {
      setStep("form-method");
      // Reset method selection when changing form type
      setSelectedMethod(null);
      setShowAiChat(false);
      setShowManualForm(false);
      setShowUploadForm(false);
      setShowIdLookup(false);
    } else if (step === "form-method" && selectedMethod) {
      if (selectedMethod === "ai") {
        toast.success("AI assistant activated", {
          description:
            "Please complete your conversation with the AI assistant.",
        });
      } else {
        onNext();
      }
    }
  };

  const handleCancel = (): void => {
    // Reset the selected method and hide all components
    setSelectedMethod(null);
    setShowAiChat(false);
    setShowManualForm(false);
    setShowUploadForm(false);
    setShowIdLookup(false);
  };

  const handleComplete = (): void => {
    // This function is called when a form filling method is completed
    toast.success("Form completed successfully", {
      description: "Your tax information has been saved.",
    });
    onNext();
  };

  // If any of the specific form methods are showing, don't show the main card
  if (showManualForm) {
    return (
      <ManualFormFilling
        onComplete={handleComplete}
        onCancel={handleCancel}
        formType={selectedForm || ""}
      />
    );
  }

  if (showUploadForm) {
    return (
      <FormUpload
        onComplete={handleComplete}
        onCancel={handleCancel}
        formType={selectedForm || ""}
      />
    );
  }

  if (showIdLookup) {
    return (
      <IdLookup
        onComplete={handleComplete}
        onCancel={handleCancel}
        formType={selectedForm || ""}
      />
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {step === "form-type" ? "Select Form Type" : "Select Method"}
        </CardTitle>
        <CardDescription>
          {step === "form-type"
            ? "Choose the tax form you need to file"
            : `Select how you'd like to complete your ${
                selectedFormDetails?.name || "tax form"
              }`}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {step === "form-type" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formTypes.map((type) => (
              <Card
                key={type.id}
                className={cn(
                  "cursor-pointer hover:border-primary transition-all",
                  selectedForm === type.id &&
                    "border-primary ring-1 ring-primary"
                )}
                onClick={() => handleFormTypeSelect(type.id)}
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
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formMethods.map((method) => (
                <Card
                  key={method.id}
                  className={cn(
                    "cursor-pointer hover:border-primary transition-all",
                    selectedMethod === method.id &&
                      "border-primary ring-1 ring-primary"
                  )}
                  onClick={() => handleMethodSelect(method.id)}
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

            {/* Render AI Chat Assistant when AI method is selected */}
            {showAiChat && (
              <div className="mt-8">
                <AiChatAssistant taxFormType={selectedFormDetails?.name} />
              </div>
            )}
          </>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        {step === "form-type" ? (
          <Button
            variant="outline"
            onClick={onPrevious}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => {
              setStep("form-type");
              setShowAiChat(false);
              setShowManualForm(false);
              setShowUploadForm(false);
              setShowIdLookup(false);
            }}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Form Types
          </Button>
        )}

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
      </CardFooter>
    </Card>
  );
}
