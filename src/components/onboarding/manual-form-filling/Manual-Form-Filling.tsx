// src/components/onboarding/ManualFormFilling.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface ManualFormFillingProps {
  onComplete: () => void;
  onCancel: () => void;
  formType: string;
}

// Schema for personal information
const personalInfoSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  nif: z.string().min(9, "NIF/NIE must be valid").max(9),
  birthDate: z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, "Please enter a valid date"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(9, "Please enter a valid phone number"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  postalCode: z.string().min(5, "Postal code must be 5 digits").max(5),
  city: z.string().min(2, "City name must be at least 2 characters"),
  province: z.string().min(2, "Province name must be at least 2 characters"),
});

// Schema for income information
const incomeInfoSchema = z.object({
  salaryIncome: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)), "Must be a valid number"),
  selfEmploymentIncome: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)), "Must be a valid number"),
  capitalGainsIncome: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)), "Must be a valid number"),
  rentalIncome: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)), "Must be a valid number"),
  otherIncome: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)), "Must be a valid number"),
});

// Schema for deductions information
const deductionsInfoSchema = z.object({
  socialSecurity: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)), "Must be a valid number"),
  pensionContributions: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)), "Must be a valid number"),
  mortgageInterest: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)), "Must be a valid number"),
  donations: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)), "Must be a valid number"),
  otherDeductions: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)), "Must be a valid number"),
});

type SectionData = {
  personal: z.infer<typeof personalInfoSchema>;
  income: z.infer<typeof incomeInfoSchema>;
  deductions: z.infer<typeof deductionsInfoSchema>;
};

export function ManualFormFilling({
  onComplete,
  onCancel,
  formType,
}: ManualFormFillingProps): React.ReactElement {
  const [activeTab, setActiveTab] = useState<string>("personal");
  const [formData, setFormData] = useState<Partial<SectionData>>({
    personal: {
      firstName: "",
      lastName: "",
      nif: "",
      birthDate: "",
      email: "",
      phone: "",
      address: "",
      postalCode: "",
      city: "",
      province: "",
    },
    income: {
      salaryIncome: "0",
      selfEmploymentIncome: "0",
      capitalGainsIncome: "0",
      rentalIncome: "0",
      otherIncome: "0",
    },
    deductions: {
      socialSecurity: "0",
      pensionContributions: "0",
      mortgageInterest: "0",
      donations: "0",
      otherDeductions: "0",
    },
  });

  // Form for personal information
  const personalForm = useForm<z.infer<typeof personalInfoSchema>>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: formData.personal,
  });

  // Form for income information
  const incomeForm = useForm<z.infer<typeof incomeInfoSchema>>({
    resolver: zodResolver(incomeInfoSchema),
    defaultValues: formData.income,
  });

  // Form for deductions information
  const deductionsForm = useForm<z.infer<typeof deductionsInfoSchema>>({
    resolver: zodResolver(deductionsInfoSchema),
    defaultValues: formData.deductions,
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const saveProgress = () => {
    // In a real application, you would save this to localStorage, a database, or an API
    toast.success("Progress saved", {
      description: "Your form data has been saved successfully.",
    });
  };

  const handlePersonalSubmit = (data: z.infer<typeof personalInfoSchema>) => {
    setFormData({
      ...formData,
      personal: data,
    });
    setActiveTab("income");
    toast.success("Personal information saved");
  };

  const handleIncomeSubmit = (data: z.infer<typeof incomeInfoSchema>) => {
    setFormData({
      ...formData,
      income: data,
    });
    setActiveTab("deductions");
    toast.success("Income information saved");
  };

  const handleDeductionsSubmit = (
    data: z.infer<typeof deductionsInfoSchema>
  ) => {
    setFormData({
      ...formData,
      deductions: data,
    });

    // In a real application, you would save all the data here
    toast.success("Form completed successfully", {
      description: "Your information has been saved.",
    });

    // Call the onComplete callback to proceed
    onComplete();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          Manually Fill {formType === "modelo100" ? "Modelo 100" : formType}{" "}
          Form
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Personal Information</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="deductions">Deductions</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="mt-6">
            <Form {...personalForm}>
              <form
                onSubmit={personalForm.handleSubmit(handlePersonalSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={personalForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Juan" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={personalForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. García" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={personalForm.control}
                    name="nif"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>NIF/NIE</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 12345678A" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={personalForm.control}
                    name="birthDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Birth Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={personalForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. example@email.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={personalForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 612345678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={personalForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Calle Mayor 1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={personalForm.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 28001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={personalForm.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Madrid" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={personalForm.control}
                    name="province"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Province</FormLabel>
                        <FormControl>
                          <div>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select province" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="madrid">Madrid</SelectItem>
                                <SelectItem value="barcelona">
                                  Barcelona
                                </SelectItem>
                                <SelectItem value="valencia">
                                  Valencia
                                </SelectItem>
                                <SelectItem value="sevilla">Sevilla</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit">
                    Continue to Income
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="income" className="mt-6">
            <Form {...incomeForm}>
              <form
                onSubmit={incomeForm.handleSubmit(handleIncomeSubmit)}
                className="space-y-6"
              >
                <h3 className="text-lg font-medium">
                  Income Information for Tax Year 2023
                </h3>
                <Separator />

                <div className="space-y-4">
                  <FormField
                    control={incomeForm.control}
                    name="salaryIncome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salary Income (€)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={incomeForm.control}
                    name="selfEmploymentIncome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Self-Employment Income (€)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={incomeForm.control}
                    name="capitalGainsIncome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capital Gains Income (€)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={incomeForm.control}
                    name="rentalIncome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rental Income (€)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={incomeForm.control}
                    name="otherIncome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Other Income (€)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab("personal")}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Personal Information
                  </Button>

                  <Button type="submit">
                    Continue to Deductions
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="deductions" className="mt-6">
            <Form {...deductionsForm}>
              <form
                onSubmit={deductionsForm.handleSubmit(handleDeductionsSubmit)}
                className="space-y-6"
              >
                <h3 className="text-lg font-medium">Deductions Information</h3>
                <Separator />

                <div className="space-y-4">
                  <FormField
                    control={deductionsForm.control}
                    name="socialSecurity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Social Security Contributions (€)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={deductionsForm.control}
                    name="pensionContributions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pension Plan Contributions (€)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={deductionsForm.control}
                    name="mortgageInterest"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mortgage Interest (€)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={deductionsForm.control}
                    name="donations"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Charitable Donations (€)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={deductionsForm.control}
                    name="otherDeductions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Other Deductions (€)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab("income")}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Income
                  </Button>

                  <Button type="submit">
                    Complete Form
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancel
        </Button>

        <Button variant="outline" onClick={saveProgress}>
          <Save className="mr-2 h-4 w-4" />
          Save Progress
        </Button>
      </CardFooter>
    </Card>
  );
}
