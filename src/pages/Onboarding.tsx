import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Clock,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import { FormFilling } from "@/components/onboarding/FormFilling";
import { History } from "@/components/onboarding/History";
import { Profile } from "@/components/onboarding/Profile";
import { Support } from "@/components/onboarding/Support";
import { toast } from "sonner";

// Define the sidebar items with proper typing
interface SidebarItem {
  id: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
}

const sidebarItems: SidebarItem[] = [
  { id: "form", icon: FileText, label: "Tax Form Filling" },
  { id: "profile", icon: User, label: "Profile" },
  { id: "history", icon: Clock, label: "History" },
  { id: "support", icon: HelpCircle, label: "Support" },
];

// Define the form steps with proper typing
interface FormStep {
  id: string;
  label: string;
  description?: string;
}

// Define tax form types
interface TaxFormType {
  id: string;
  name: string;
  description: string;
}

// Spanish tax form types
// eslint-disable-next-line react-refresh/only-export-components
export const taxFormTypes: TaxFormType[] = [
  {
    id: "modelo100",
    name: "Modelo 100",
    description: "Declaración de la Renta (IRPF)",
  },
  {
    id: "modelo303",
    name: "Modelo 303",
    description: "Impuesto sobre el Valor Añadido (IVA)",
  },
  {
    id: "modelo130",
    name: "Modelo 130",
    description: "Pago fraccionado empresarios y profesionales",
  },
  {
    id: "modelo714",
    name: "Modelo 714",
    description: "Impuesto sobre el Patrimonio",
  },
];

const formSteps: FormStep[] = [
  {
    id: "select-type",
    label: "Select Form Type",
    description: "Choose the tax form you need to complete",
  },
  {
    id: "select-method",
    label: "Select Method",
    description: "Choose how you want to fill out your form",
  },
  {
    id: "fill-form",
    label: "Fill Form",
    description: "Enter your tax information",
  },
  {
    id: "review",
    label: "Review & Edit",
    description: "Check your information for accuracy",
  },
  {
    id: "confirm",
    label: "Confirm",
    description: "Verify all information is correct",
  },
  {
    id: "generate",
    label: "Generate PDF",
    description: "Create your final tax document",
  },
];

export default function EnhancedOnboarding() {
  // Main state management
  const [activeSection, setActiveSection] = useState<string>("form");
  const [activeStep, setActiveStep] = useState<string>("select-type");
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  // Save session data
  const [sessionSaved, setSessionSaved] = useState<boolean>(false);

  // Find the current step index for progress calculation
  const currentStepIndex = formSteps.findIndex(
    (step) => step.id === activeStep
  );

  // Update progress when step changes
  useEffect(() => {
    // Calculate progress percentage based on current step
    const newProgress = Math.round(
      ((currentStepIndex + 1) / formSteps.length) * 100
    );
    setProgress(newProgress);
  }, [currentStepIndex, activeStep]);

  // Function to handle moving to the next step
  const handleNextStep = () => {
    const currentIndex = formSteps.findIndex((step) => step.id === activeStep);
    if (currentIndex < formSteps.length - 1) {
      const nextStep = formSteps[currentIndex + 1].id;
      setActiveStep(nextStep);

      // Show toast notification for step change
      toast.success(`Moved to ${formSteps[currentIndex + 1].label}`, {
        description: formSteps[currentIndex + 1].description,
      });

      // Save session automatically when progressing
      if (!sessionSaved) {
        saveSession();
      }
    }
  };

  // Function to handle moving to the previous step
  const handlePreviousStep = () => {
    const currentIndex = formSteps.findIndex((step) => step.id === activeStep);
    if (currentIndex > 0) {
      const prevStep = formSteps[currentIndex - 1].id;
      setActiveStep(prevStep);

      // Also show toast for previous step
      toast.info(`Volviendo a ${formSteps[currentIndex - 1].label}`);

      // Recalculate progress when stepping back
      const newProgress = Math.round((currentIndex / formSteps.length) * 100);
      setProgress(newProgress);
    }
  };

  // Function to handle form selection
  const handleFormSelection = (formId: string) => {
    setSelectedForm(formId);
    // If we're on select-type, automatically go to select-method when form is selected
    if (activeStep === "select-type") {
      handleNextStep();
    }
  };

  // Function to handle method selection
  const handleMethodSelection = (methodId: string) => {
    setSelectedMethod(methodId);
    // After method is selected, we can proceed to fill-form step
    if (activeStep === "select-method") {
      handleNextStep();
    }
  };

  // Simulate saving session
  const saveSession = () => {
    // This would save to localStorage or backend in a real app
    setSessionSaved(true);
    toast.success("Progress saved", {
      description: "You can continue later from where you left off",
    });
  };

  // Component for the sidebar
  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div
      className={cn(
        "flex flex-col border-r bg-white",
        mobile ? "w-full" : "w-64"
      )}
    >
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">Asistente Fiscal</h2>
        {mobile && (
          <p className="text-sm text-muted-foreground mt-1">
            Spanish Tax Assistant
          </p>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveSection(item.id);
              if (mobile) {
                setIsMenuOpen(false);
              }
            }}
            className={cn(
              "flex items-center w-full gap-3 px-3 py-2 text-sm rounded-md font-medium transition-colors",
              activeSection === item.id
                ? "bg-primary text-primary-foreground"
                : "text-gray-700 hover:bg-gray-100"
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <HelpCircle className="h-5 w-5" />
          </Button>
          {!sessionSaved && activeStep !== "select-type" && (
            <Button variant="outline" className="flex-1" onClick={saveSession}>
              Save Progress
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  // Function to render the main content based on the active section
  const renderMainContent = () => {
    switch (activeSection) {
      case "form":
        return (
          <FormFilling
            onNext={handleNextStep}
            onPrevious={handlePreviousStep}
            step={activeStep === "select-type" ? "form-type" : "form-method"}
            setStep={(newStep) =>
              setActiveStep(
                newStep === "form-type" ? "select-type" : "select-method"
              )
            }
            selectedForm={selectedForm}
            onFormSelect={handleFormSelection}
            selectedMethod={selectedMethod}
            onMethodSelect={handleMethodSelection}
          />
        );
      case "profile":
        return <Profile />;
      case "history":
        return <History />;
      case "support":
        return <Support />;
      default:
        return (
          <FormFilling
            onNext={handleNextStep}
            onPrevious={handlePreviousStep}
            step={activeStep === "select-type" ? "form-type" : "form-method"}
            setStep={(newStep) =>
              setActiveStep(
                newStep === "form-type" ? "select-type" : "select-method"
              )
            }
            selectedForm={selectedForm}
            onFormSelect={handleFormSelection}
            selectedMethod={selectedMethod}
            onMethodSelect={handleMethodSelection}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar using Sheet component */}
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden absolute top-4 left-4 z-10"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <SidebarContent mobile />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b py-4 px-6 flex items-center justify-between">
          <div className="flex items-center">
            {/* Empty div to maintain spacing with mobile menu button */}
            <div className="w-8 md:hidden"></div>

            <h1 className="text-xl font-bold mx-auto md:mx-0">
              {activeSection === "form"
                ? `Tax Filing: ${
                    formSteps[currentStepIndex]?.label || "Onboarding"
                  }`
                : sidebarItems.find((item) => item.id === activeSection)
                    ?.label || "Onboarding"}
            </h1>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src="https://github.com/shadcn.png"
                    alt="User avatar"
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src="https://github.com/shadcn.png"
                      alt="User avatar"
                    />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-medium">Juan García</p>
                  <p className="text-xs text-gray-500">
                    juan.garcia@example.com
                  </p>
                </div>
              </div>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => setActiveSection("profile")}
              >
                <User className="mr-2 h-4 w-4" />
                <span>My Profile</span>
              </DropdownMenuItem>

              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Breadcrumb */}
          <div className="mb-4 md:mb-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <Link to="/onboarding" className="flex items-center">
                    <LayoutDashboard className="h-4 w-4 mr-1" />
                    Onboarding
                  </Link>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    {
                      sidebarItems.find((item) => item.id === activeSection)
                        ?.label
                    }
                  </BreadcrumbPage>
                </BreadcrumbItem>
                {activeSection === "form" && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>
                        {
                          formSteps.find((step) => step.id === activeStep)
                            ?.label
                        }
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Progress Steps (Only show for form filling section) */}
          {activeSection === "form" && (
            <div className="mb-6 bg-white p-4 rounded-lg border shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Form Completion Progress</h3>
                <span className="text-sm text-muted-foreground">
                  {progress}% Complete
                </span>
              </div>

              <Progress value={progress} className="h-2 mb-4" />

              {/* Step indicators */}
              <div className="hidden md:flex items-center justify-between text-sm mb-2">
                {formSteps.map((step, index) => (
                  <div
                    key={step.id}
                    className={cn(
                      "flex flex-col items-center",
                      index <= currentStepIndex
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    <div
                      className={cn(
                        "h-6 w-6 rounded-full flex items-center justify-center mb-1 text-xs",
                        index < currentStepIndex
                          ? "bg-primary text-primary-foreground"
                          : index === currentStepIndex
                          ? "border-2 border-primary text-primary"
                          : "border text-muted-foreground"
                      )}
                    >
                      {index + 1}
                    </div>
                    <span
                      className={cn(
                        "text-xs whitespace-nowrap",
                        index <= currentStepIndex && "font-medium"
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Mobile step list */}
              <div className="flex md:hidden items-center space-x-2 text-xs overflow-x-auto py-1">
                {formSteps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    {index > 0 && (
                      <ChevronRight className="h-3 w-3 mx-1 text-gray-400 flex-shrink-0" />
                    )}
                    <span
                      className={cn(
                        "whitespace-nowrap",
                        index <= currentStepIndex
                          ? "text-primary font-medium"
                          : "text-gray-500"
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current step info if applicable */}
          {activeSection === "form" && (
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {formSteps[currentStepIndex]?.label}
                </h2>

                {/* Navigation buttons for desktop */}
                <div className="hidden md:flex items-center gap-2">
                  {currentStepIndex > 0 && (
                    <Button
                      variant="outline"
                      onClick={handlePreviousStep}
                      className="flex items-center"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                  )}

                  {currentStepIndex < formSteps.length - 1 && (
                    <Button
                      onClick={handleNextStep}
                      disabled={
                        (activeStep === "select-type" && !selectedForm) ||
                        (activeStep === "select-method" && !selectedMethod)
                      }
                    >
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {formSteps[currentStepIndex]?.description && (
                <p className="text-muted-foreground text-sm">
                  {formSteps[currentStepIndex].description}
                </p>
              )}
            </div>
          )}

          {/* Main Content Component */}
          {renderMainContent()}

          {/* Navigation buttons for mobile - fixed at bottom */}
          {activeSection === "form" && (
            <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex items-center justify-between">
              {currentStepIndex > 0 ? (
                <Button
                  variant="outline"
                  onClick={handlePreviousStep}
                  className="flex items-center"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
              ) : (
                <div></div> // Empty div for spacing
              )}

              {currentStepIndex < formSteps.length - 1 && (
                <Button
                  onClick={handleNextStep}
                  disabled={
                    (activeStep === "select-type" && !selectedForm) ||
                    (activeStep === "select-method" && !selectedMethod)
                  }
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
