import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  ArrowRight,
  FormInputIcon,
  HelpCircle,
  History,
  User,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Onboarding() {
  const [activeTab, setActiveTab] = useState("form");
  const [progress, setProgress] = useState(25);

  const handleNext = () => {
    const tabs = ["form", "history", "profile", "support"];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      const nextTab = tabs[currentIndex + 1];
      setActiveTab(nextTab);
      setProgress((currentIndex + 2) * 25);
    }
  };

  const handlePrevious = () => {
    const tabs = ["form", "history", "profile", "support"];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) {
      const prevTab = tabs[currentIndex - 1];
      setActiveTab(prevTab);
      setProgress(currentIndex * 25);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Welcome to Asistente Fiscal</h1>
        <p className="text-muted-foreground mt-2">
          Complete your onboarding to get started with our tax assistance
          services.
        </p>

        <div className="mt-6">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>Getting Started</span>
            <span>Completed</span>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="form" className="flex items-center gap-2">
            <FormInputIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Tax Form</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">History</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="support" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Support</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="form">
          <Card>
            <CardHeader>
              <CardTitle>Tax Form Information</CardTitle>
              <CardDescription>
                Please provide basic information about your tax situation to
                help us get started.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Replace with your actual form inputs */}
              <div className="p-8 bg-gray-50 rounded-md border border-dashed border-gray-300 text-center">
                <p className="text-muted-foreground">
                  Form inputs will go here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Tax Filing History</CardTitle>
              <CardDescription>
                Review your previous tax filings and documents.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 bg-gray-50 rounded-md border border-dashed border-gray-300 text-center">
                <p className="text-muted-foreground">
                  Tax history information will appear here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Personal Profile</CardTitle>
              <CardDescription>
                Complete your personal information for accurate tax processing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 bg-gray-50 rounded-md border border-dashed border-gray-300 text-center">
                <p className="text-muted-foreground">
                  Profile information will go here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support">
          <Card>
            <CardHeader>
              <CardTitle>Support Options</CardTitle>
              <CardDescription>
                Learn how to get help with your tax questions and concerns.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 bg-gray-50 rounded-md border border-dashed border-gray-300 text-center">
                <p className="text-muted-foreground">
                  Support information will appear here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={activeTab === "form"}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button>
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>

        <Button
          onClick={handleNext}
          disabled={activeTab === "support"}
          className="flex items-center gap-2"
        >
          {activeTab === "support" ? "Complete" : "Next"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
