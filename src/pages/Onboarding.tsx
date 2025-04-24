import {
  ChevronRight,
  Clock,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  User,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { cn } from "@/lib/utils";

import { FormFilling } from "@/components/onboarding/FormFilling";
import { History } from "@/components/onboarding/History";
import { Profile } from "@/components/onboarding/Profile";
import { Support } from "@/components/onboarding/Support";

const sidebarItems = [
  { id: "form", icon: FileText, label: "Tax Form Filling" },
  { id: "profile", icon: User, label: "Profile" },
  { id: "history", icon: Clock, label: "History" },
  { id: "support", icon: HelpCircle, label: "Support" },
];

const formSteps = [
  { id: "select-type", label: "Select Form Type" },
  { id: "select-method", label: "Select Method" },
  { id: "fill-form", label: "Fill Form" },
  { id: "review", label: "Review & Edit" },
  { id: "confirm", label: "Confirm" },
  { id: "generate", label: "Generate PDF" },
];

export default function EnhancedOnboarding() {
  const [activeSection, setActiveSection] = useState("form");
  const [activeStep, setActiveStep] = useState("select-method");
  // Removed unused selectedMethod state
  const [progress, setProgress] = useState(Math.round(100 / formSteps.length)); // For 6 steps (100/6)

  // Find the current step index for breadcrumb progress
  const currentStepIndex = formSteps.findIndex(
    (step) => step.id === activeStep
  );

  const handleNextStep = () => {
    const currentIndex = formSteps.findIndex((step) => step.id === activeStep);
    if (currentIndex < formSteps.length - 1) {
      const nextStep = formSteps[currentIndex + 1].id;
      setActiveStep(nextStep);
      setProgress(((currentIndex + 2) / formSteps.length) * 100);
    }
  };

  const handlePreviousStep = () => {
    const currentIndex = formSteps.findIndex((step) => step.id === activeStep);
    if (currentIndex > 0) {
      const prevStep = formSteps[currentIndex - 1].id;
      setActiveStep(prevStep);
      setProgress((currentIndex / formSteps.length) * 100);
    }
  };

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
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 flex-col border-r bg-white">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Asistente Fiscal</h2>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
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
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b py-4 px-6 flex items-center justify-between">
          <div className="md:hidden">
            <Button variant="ghost" size="sm">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </div>

          <h1 className="text-xl font-bold">Onboarding</h1>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-medium">shadcn</p>
                  <p className="text-xs text-gray-500">m@example.com</p>
                </div>
              </div>

              <DropdownMenuSeparator />

              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Account</span>
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

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Breadcrumb */}
          <div className="mb-6">
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
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Progress Steps (Only show for form filling section) */}
          {activeSection === "form" && (
            <div className="mb-6">
              <div className="flex items-center space-x-2 text-sm mb-2 overflow-x-auto">
                {formSteps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    {index > 0 && (
                      <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
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
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Main Content Component */}
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
}
