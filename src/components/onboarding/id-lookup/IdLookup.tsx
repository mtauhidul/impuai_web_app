// src/components/onboarding/IdLookup.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Edit,
  Search,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

interface IdLookupProps {
  onComplete: () => void;
  onCancel: () => void;
  formType: string;
}

// Schema for ID verification
const verificationSchema = z.object({
  documentNumber: z
    .string()
    .min(9, "Document number must be at least 9 characters")
    .max(9, "Document number must be exactly 9 characters")
    .refine((value) => {
      // Simple validation for Spanish DNI/NIE
      const dniRegex = /^[0-9]{8}[a-zA-Z]$/;
      const nieRegex = /^[XYZ][0-9]{7}[a-zA-Z]$/;
      return dniRegex.test(value) || nieRegex.test(value);
    }, "Please enter a valid DNI (8 numbers + letter) or NIE (X/Y/Z + 7 numbers + letter)"),
  dateOfBirth: z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, "Please enter a valid date of birth"),
});

// Define the type for the tax data returned from the API
interface TaxData {
  personalInfo: {
    fullName: string;
    documentNumber: string;
    dateOfBirth: string;
    address: string;
    postalCode: string;
    city: string;
    province: string;
    phone: string;
    email: string;
  };
  taxInfo: {
    employmentIncome: string;
    capitalIncome: string;
    propertyIncome: string;
    businessIncome: string;
    withholdings: string;
    deductions: {
      socialSecurity: string;
      personalAllowance: string;
      pensionContributions: string;
      mortgageDeduction: string;
    };
  };
}

export function IdLookup({
  onComplete,
  onCancel,
  formType,
}: IdLookupProps): React.ReactElement {
  const [lookupState, setLookupState] = useState<
    "initial" | "loading" | "success" | "error"
  >("initial");
  const [taxData, setTaxData] = useState<TaxData | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);

  // Form for ID verification
  const verificationForm = useForm<z.infer<typeof verificationSchema>>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      documentNumber: "",
      dateOfBirth: "",
    },
  });

  const simulateApiCall = async (data: z.infer<typeof verificationSchema>) => {
    setLookupState("loading");

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Random success or failure (80% success rate)
    const isSuccessful = Math.random() < 0.8;

    if (isSuccessful) {
      // Mock data that would be returned from the API
      const mockTaxData: TaxData = {
        personalInfo: {
          fullName: "Juan García López",
          documentNumber: data.documentNumber,
          dateOfBirth: data.dateOfBirth,
          address: "Calle Mayor 1, 3º Izq",
          postalCode: "28001",
          city: "Madrid",
          province: "Madrid",
          phone: "600123456",
          email: "juan.garcia@example.com",
        },
        taxInfo: {
          employmentIncome: "42000.00",
          capitalIncome: "1200.00",
          propertyIncome: "0.00",
          businessIncome: "0.00",
          withholdings: "7560.00",
          deductions: {
            socialSecurity: "2688.00",
            personalAllowance: "5550.00",
            pensionContributions: "3000.00",
            mortgageDeduction: "1500.00",
          },
        },
      };

      setTaxData(mockTaxData);
      setLookupState("success");
      toast.success("Information retrieved successfully", {
        description: "We've found your tax information in the system.",
      });
    } else {
      setLookupState("error");
      toast.error("Information retrieval failed", {
        description:
          "We couldn't find your information. Please check your DNI/NIE and date of birth.",
      });
    }
  };

  const handleVerificationSubmit = async (
    data: z.infer<typeof verificationSchema>
  ) => {
    await simulateApiCall(data);
  };

  const handleTaxDataUpdate = () => {
    // In a real app, this would send the updated data to an API
    setEditMode(false);
    toast.success("Information updated", {
      description: "Your changes have been saved.",
    });
  };

  const handleTryAgain = () => {
    setLookupState("initial");
    setTaxData(null);
    verificationForm.reset();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          Retrieve {formType === "modelo100" ? "Modelo 100" : formType} Data via
          ID Lookup
        </CardTitle>
        <CardDescription>
          We'll search for your existing tax information in the official
          government database
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {lookupState === "initial" && (
          <Form {...verificationForm}>
            <form
              onSubmit={verificationForm.handleSubmit(handleVerificationSubmit)}
              className="space-y-6"
            >
              <div className="space-y-4">
                <FormField
                  control={verificationForm.control}
                  name="documentNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DNI/NIE Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. 12345678A or X1234567A"
                          {...field}
                          autoComplete="off"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={verificationForm.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="bg-muted/30 p-4 rounded-lg border text-sm">
                <h4 className="font-medium mb-2">Security Note</h4>
                <p className="text-muted-foreground">
                  This information is required to verify your identity with the
                  Spanish Tax Agency (Agencia Tributaria). Your data is
                  transmitted securely and in compliance with GDPR regulations.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={verificationForm.formState.isSubmitting}
              >
                <Search className="mr-2 h-4 w-4" />
                Retrieve Tax Information
              </Button>
            </form>
          </Form>
        )}

        {lookupState === "loading" && (
          <div className="text-center py-12">
            <Spinner className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-medium">Retrieving Your Information</h3>
            <p className="text-sm text-muted-foreground mt-2">
              We're securely connecting to the tax authority database...
            </p>
          </div>
        )}

        {lookupState === "error" && (
          <div className="text-center py-8">
            <div className="bg-destructive/10 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-destructive" />
            </div>
            <h3 className="text-lg font-medium">Lookup Failed</h3>
            <p className="text-sm text-muted-foreground mt-2 mb-6">
              We couldn't find your information in the system. This could be due
              to:
            </p>
            <ul className="text-sm text-muted-foreground text-left list-disc pl-6 mb-6">
              <li>Incorrect DNI/NIE number or date of birth</li>
              <li>You haven't filed taxes in Spain before</li>
              <li>Technical issues with the connection to the tax authority</li>
            </ul>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={handleTryAgain}>
                Try Again
              </Button>
              <Button variant="outline" onClick={onCancel}>
                Try Another Method
              </Button>
            </div>
          </div>
        )}

        {lookupState === "success" && taxData && (
          <div className="space-y-8">
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-center">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <h3 className="font-medium text-green-800">
                Information Retrieved Successfully
              </h3>
              <p className="text-sm text-green-700 mt-1">
                We've found your tax information in the system.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Personal Information</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditMode(!editMode)}
                  className="flex items-center gap-1.5"
                >
                  <Edit className="h-4 w-4" />
                  {editMode ? "Cancel Editing" : "Edit Information"}
                </Button>
              </div>
              <Separator />

              {!editMode ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(taxData.personalInfo).map(([key, value]) => (
                    <div key={key} className="p-3 bg-muted/30 rounded-md">
                      <span className="text-xs text-muted-foreground block capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(taxData.personalInfo).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <label className="text-xs text-muted-foreground block capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </label>
                      <Input
                        defaultValue={value}
                        className="h-9"
                        disabled={
                          key === "documentNumber" || key === "dateOfBirth"
                        }
                      />
                    </div>
                  ))}

                  <div className="md:col-span-2">
                    <Button onClick={handleTaxDataUpdate} className="w-full">
                      Update Personal Information
                    </Button>
                  </div>
                </div>
              )}

              <h3 className="text-lg font-medium mt-6">Tax Information</h3>
              <Separator />

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    Income
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(taxData.taxInfo)
                      .filter(
                        ([key]) =>
                          !key.includes("deductions") &&
                          !key.includes("withholdings")
                      )
                      .map(([key, value]) => (
                        <div key={key} className="p-3 bg-muted/30 rounded-md">
                          <span className="text-xs text-muted-foreground block capitalize">
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </span>
                          <span className="font-medium">
                            {typeof value === "string" ? `${value}€` : ""}
                          </span>
                        </div>
                      ))}
                    <div className="p-3 bg-muted/30 rounded-md">
                      <span className="text-xs text-muted-foreground block">
                        Withholdings
                      </span>
                      <span className="font-medium">
                        {taxData.taxInfo.withholdings}€
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    Deductions
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(taxData.taxInfo.deductions).map(
                      ([key, value]) => (
                        <div key={key} className="p-3 bg-muted/30 rounded-md">
                          <span className="text-xs text-muted-foreground block capitalize">
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </span>
                          <span className="font-medium">{value}€</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>

              <Button onClick={onComplete} className="w-full mt-6">
                Continue with Retrieved Data
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancel
        </Button>
      </CardFooter>
    </Card>
  );
}
