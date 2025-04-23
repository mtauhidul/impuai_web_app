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
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="container max-w-3xl py-10 px-4 mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Privacy Policy</CardTitle>
          <CardDescription>Last updated: April 24, 2025</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-medium text-lg">1. Information We Collect</h3>
            <p className="text-sm text-muted-foreground">
              We collect information you provide directly to us when you create
              an account, use our tax assistance services, or contact customer
              support. This includes your name, email address, and tax-related
              information necessary to process your tax forms.
            </p>
          </div>
          <Separator />
          <div className="space-y-2">
            <h3 className="font-medium text-lg">
              2. How We Use Your Information
            </h3>
            <p className="text-sm text-muted-foreground">
              We use the information we collect to provide, maintain, and
              improve our services, including processing your tax forms,
              providing customer support, and sending you service-related
              notifications. We do not sell your personal information to third
              parties.
            </p>
          </div>
          <Separator />
          <div className="space-y-2">
            <h3 className="font-medium text-lg">
              3. Data Storage and Security
            </h3>
            <p className="text-sm text-muted-foreground">
              Your information is stored securely using industry-standard
              encryption and security practices. We implement appropriate
              technical and organizational measures to protect your personal
              data against unauthorized access, alteration, or destruction.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
