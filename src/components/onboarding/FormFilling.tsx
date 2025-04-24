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
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { taxFormTypes } from "@/pages/Onboarding";
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
  selectedForm: string | null;
  onFormSelect: (formId: string) => void;
  selectedMethod: string | null;
  onMethodSelect: (methodId: string) => void;
}

interface FormMethod {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
}

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
    title: "Fill via API lookup with your DNI/NIE",
    description: "Quickly import your information using your ID",
  },
];

export function FormFilling({
  onNext,
  onPrevious,
  step,
  setStep,
  selectedForm,
  onFormSelect,
  selectedMethod,
  onMethodSelect,
}: FormFillingProps): React.ReactElement {
  const [showAiChat, setShowAiChat] = useState<boolean>(false);
  const [showManualForm, setShowManualForm] = useState<boolean>(false);
  const [showUploadForm, setShowUploadForm] = useState<boolean>(false);
  const [showIdLookup, setShowIdLookup] = useState<boolean>(false);

  // Get selected form details
  const selectedFormDetails = taxFormTypes.find(
    (form) => form.id === selectedForm
  );

  const handleFormTypeSelect = (formId: string): void => {
    onFormSelect(formId);
  };

  const handleMethodSelect = (methodId: string): void => {
    onMethodSelect(methodId);

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
      onMethodSelect("");
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
    onMethodSelect("");
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
          {step === "form-type"
            ? "Seleccione Tipo de Formulario"
            : "Seleccione Método"}
        </CardTitle>
        <CardDescription>
          {step === "form-type"
            ? "Elija el formulario fiscal que necesita completar"
            : `Seleccione cómo desea completar su ${
                selectedFormDetails?.name || "formulario fiscal"
              }`}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {step === "form-type" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {taxFormTypes.map((type) => (
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
                    <FileText className="h-6 w-6 text-primary" />
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

            {/* Information about selected form */}
            {selectedFormDetails && (
              <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                <h3 className="font-medium text-lg mb-2">
                  {selectedFormDetails.name} - Información
                </h3>
                <Separator className="mb-3" />
                <div className="space-y-2">
                  {selectedFormDetails.id === "modelo100" && (
                    <>
                      <p className="text-sm">
                        El <strong>Modelo 100</strong> es la declaración anual
                        del IRPF (Impuesto sobre la Renta de las Personas
                        Físicas) que deben presentar los contribuyentes
                        residentes en España.
                      </p>
                      <p className="text-sm">
                        <strong>Plazo de presentación:</strong> Generalmente
                        entre abril y junio del año siguiente al ejercicio
                        fiscal.
                      </p>
                      <p className="text-sm">
                        <strong>Información necesaria:</strong> Ingresos por
                        trabajo, rendimientos de capital, ganancias
                        patrimoniales, deducciones aplicables.
                      </p>
                    </>
                  )}

                  {selectedFormDetails.id === "modelo303" && (
                    <>
                      <p className="text-sm">
                        El <strong>Modelo 303</strong> es la declaración
                        trimestral del IVA (Impuesto sobre el Valor Añadido) que
                        deben presentar autónomos y empresas.
                      </p>
                      <p className="text-sm">
                        <strong>Plazo de presentación:</strong> Trimestral
                        (abril, julio, octubre y enero)
                      </p>
                      <p className="text-sm">
                        <strong>Información necesaria:</strong> IVA repercutido,
                        IVA soportado, operaciones intracomunitarias.
                      </p>
                    </>
                  )}

                  {selectedFormDetails.id === "modelo130" && (
                    <>
                      <p className="text-sm">
                        El <strong>Modelo 130</strong> es el pago fraccionado
                        del IRPF para autónomos y profesionales en estimación
                        directa.
                      </p>
                      <p className="text-sm">
                        <strong>Plazo de presentación:</strong> Trimestral
                        (abril, julio, octubre y enero)
                      </p>
                      <p className="text-sm">
                        <strong>Información necesaria:</strong> Ingresos y
                        gastos trimestrales, retenciones soportadas.
                      </p>
                    </>
                  )}

                  {selectedFormDetails.id === "modelo714" && (
                    <>
                      <p className="text-sm">
                        El <strong>Modelo 714</strong> es la declaración del
                        Impuesto sobre el Patrimonio para personas con bienes
                        superiores a cierto umbral.
                      </p>
                      <p className="text-sm">
                        <strong>Plazo de presentación:</strong> Mismos plazos
                        que el IRPF (generalmente abril-junio)
                      </p>
                      <p className="text-sm">
                        <strong>Información necesaria:</strong> Bienes
                        inmuebles, cuentas bancarias, inversiones, vehículos,
                        obras de arte, etc.
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}

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
            Anterior
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
            Volver a Tipos de Formulario
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
          Continuar
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
