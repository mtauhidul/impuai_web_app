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

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="container max-w-3xl py-10 px-4 mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Terms and Conditions</CardTitle>
          <CardDescription>Last updated: April 24, 2025</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-medium text-lg">1. Introduction</h3>
            <p className="text-sm text-muted-foreground">
              Welcome to Asistente Fiscal. By using our services, you agree to
              comply with and be bound by the following terms and conditions.
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="font-medium text-lg">2. User Accounts</h3>
            <p className="text-sm text-muted-foreground">
              When you create an account with us, you must provide accurate and
              complete information. You are responsible for maintaining the
              confidentiality of your account.
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="font-medium text-lg">3. Privacy</h3>
            <p className="text-sm text-muted-foreground">
              Our Privacy Policy describes how we handle the information you
              provide to us when you use our services. You understand that
              through your use of the services, you consent to the collection
              and use of this information.
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="font-medium text-lg">5. Changes to Terms</h3>
            <p className="text-sm text-muted-foreground">
              We reserve the right to modify these terms at any time. If we make
              changes, we will provide notice of such changes, such as by
              updating the date at the top of these terms or by providing
              additional notice.
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
