/* eslint-disable @typescript-eslint/no-explicit-any */
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  HelpCircle,
  Save,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

interface ManualFormFillingProps {
  onComplete: () => void;
  onCancel: () => void;
  formType: string;
}

// Schema for personal information
const personalInfoSchema = z.object({
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z
    .string()
    .min(2, "Los apellidos deben tener al menos 2 caracteres"),
  nif: z.string().refine((val) => {
    // Validate Spanish DNI/NIE
    const dniRegex = /^[0-9]{8}[a-zA-Z]$/;
    const nieRegex = /^[XYZxyz][0-9]{7}[a-zA-Z]$/;
    return dniRegex.test(val) || nieRegex.test(val);
  }, "Introduce un DNI (8 números + letra) o NIE (X/Y/Z + 7 números + letra) válido"),
  birthDate: z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, "Por favor, introduce una fecha válida"),
  email: z.string().email("Por favor, introduce un email válido"),
  phone: z.string().min(9, "Introduce un número de teléfono válido"),
  address: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
  postalCode: z
    .string()
    .regex(/^[0-9]{5}$/, "El código postal debe tener 5 dígitos"),
  city: z.string().min(2, "La ciudad debe tener al menos 2 caracteres"),
  province: z.string().min(2, "La provincia debe tener al menos 2 caracteres"),
});

// Income schema - customized based on form type
const createIncomeSchema = (formType: string) => {
  const baseSchema = {
    salaryIncome: z
      .string()
      .refine(
        (val) => !isNaN(parseFloat(val || "0")),
        "Debe ser un número válido"
      ),
    selfEmploymentIncome: z
      .string()
      .refine(
        (val) => !isNaN(parseFloat(val || "0")),
        "Debe ser un número válido"
      ),
    capitalGainsIncome: z
      .string()
      .refine(
        (val) => !isNaN(parseFloat(val || "0")),
        "Debe ser un número válido"
      ),
    rentalIncome: z
      .string()
      .refine(
        (val) => !isNaN(parseFloat(val || "0")),
        "Debe ser un número válido"
      ),
    otherIncome: z
      .string()
      .refine(
        (val) => !isNaN(parseFloat(val || "0")),
        "Debe ser un número válido"
      ),
  };

  // Add form-specific fields
  switch (formType.toLowerCase()) {
    case "modelo303":
      return z.object({
        ...baseSchema,
        ivaRepercutido: z
          .string()
          .refine(
            (val) => !isNaN(parseFloat(val || "0")),
            "Debe ser un número válido"
          ),
        ivaSoportado: z
          .string()
          .refine(
            (val) => !isNaN(parseFloat(val || "0")),
            "Debe ser un número válido"
          ),
      });
    case "modelo714":
      return z.object({
        ...baseSchema,
        realEstate: z
          .string()
          .refine(
            (val) => !isNaN(parseFloat(val || "0")),
            "Debe ser un número válido"
          ),
        financialAssets: z
          .string()
          .refine(
            (val) => !isNaN(parseFloat(val || "0")),
            "Debe ser un número válido"
          ),
        liabilities: z
          .string()
          .refine(
            (val) => !isNaN(parseFloat(val || "0")),
            "Debe ser un número válido"
          ),
      });
    default:
      return z.object(baseSchema);
  }
};

// Deductions schema - customized based on form type
const createDeductionsSchema = (formType: string) => {
  const baseSchema = {
    socialSecurity: z
      .string()
      .refine(
        (val) => !isNaN(parseFloat(val || "0")),
        "Debe ser un número válido"
      ),
    pensionContributions: z
      .string()
      .refine(
        (val) => !isNaN(parseFloat(val || "0")),
        "Debe ser un número válido"
      ),
    mortgageInterest: z
      .string()
      .refine(
        (val) => !isNaN(parseFloat(val || "0")),
        "Debe ser un número válido"
      ),
    donations: z
      .string()
      .refine(
        (val) => !isNaN(parseFloat(val || "0")),
        "Debe ser un número válido"
      ),
    otherDeductions: z
      .string()
      .refine(
        (val) => !isNaN(parseFloat(val || "0")),
        "Debe ser un número válido"
      ),
  };

  // Add form-specific fields
  switch (formType.toLowerCase()) {
    case "modelo100":
      return z.object({
        ...baseSchema,
        familyDeductions: z
          .string()
          .refine(
            (val) => !isNaN(parseFloat(val || "0")),
            "Debe ser un número válido"
          ),
        disabilityDeductions: z
          .string()
          .refine(
            (val) => !isNaN(parseFloat(val || "0")),
            "Debe ser un número válido"
          ),
      });
    case "modelo303":
      return z.object({
        ...baseSchema,
        previousPeriodCompensation: z
          .string()
          .refine(
            (val) => !isNaN(parseFloat(val || "0")),
            "Debe ser un número válido"
          ),
      });
    default:
      return z.object(baseSchema);
  }
};

// Form-specific field definitions
const fieldDefinitions = {
  modelo100: {
    title: "Modelo 100 - IRPF",
    income: {
      salaryIncome: "Rendimientos del trabajo",
      selfEmploymentIncome: "Rendimientos de actividades económicas",
      capitalGainsIncome: "Ganancias patrimoniales",
      rentalIncome: "Rendimientos del capital inmobiliario",
      otherIncome: "Otros rendimientos",
    },
    deductions: {
      socialSecurity: "Seguridad Social",
      pensionContributions: "Aportaciones a planes de pensiones",
      mortgageInterest: "Intereses de hipoteca (régimen transitorio)",
      donations: "Donativos",
      otherDeductions: "Otras deducciones",
      familyDeductions: "Deducciones familiares",
      disabilityDeductions: "Deducciones por discapacidad",
    },
  },
  modelo303: {
    title: "Modelo 303 - IVA",
    income: {
      selfEmploymentIncome: "Ingresos por actividades",
      ivaRepercutido: "IVA repercutido",
      ivaSoportado: "IVA soportado deducible",
    },
    deductions: {
      socialSecurity: "Seguridad Social autónomos",
      previousPeriodCompensation: "Compensación de periodos anteriores",
      otherDeductions: "Otras deducciones",
    },
  },
  modelo130: {
    title: "Modelo 130 - Pago Fraccionado",
    income: {
      selfEmploymentIncome: "Ingresos de actividades económicas",
      otherIncome: "Otros ingresos computables",
    },
    deductions: {
      socialSecurity: "Cuotas Seguridad Social",
      otherDeductions: "Gastos fiscalmente deducibles",
    },
  },
  modelo714: {
    title: "Modelo 714 - Impuesto sobre el Patrimonio",
    income: {
      realEstate: "Bienes inmuebles",
      financialAssets: "Depósitos y activos financieros",
      capitalGainsIncome: "Valores y participaciones",
      otherIncome: "Otros bienes y derechos",
    },
    deductions: {
      liabilities: "Deudas deducibles",
      otherDeductions: "Otras deducciones",
    },
  },
};

type SectionData = {
  personal: z.infer<typeof personalInfoSchema>;
  income: any; // Will be typed based on form type
  deductions: any; // Will be typed based on form type
};

export function ManualFormFilling({
  onComplete,
  onCancel,
  formType,
}: ManualFormFillingProps): React.ReactElement {
  const [activeTab, setActiveTab] = useState<string>("personal");
  const [sessionSaved, setSessionSaved] = useState<boolean>(false);
  const [formProgress, setFormProgress] = useState<number>(0);
  const [autoCalculatedFields, setAutoCalculatedFields] = useState<
    Record<string, string>
  >({});

  // Normalize form type for lookups
  const normalizedFormType = formType.toLowerCase().replace(/\s+/g, "");
  const formDefinition =
    fieldDefinitions[normalizedFormType as keyof typeof fieldDefinitions] ||
    fieldDefinitions.modelo100;

  // Create income and deductions schemas based on form type
  const incomeSchema = createIncomeSchema(normalizedFormType);
  const deductionsSchema = createDeductionsSchema(normalizedFormType);

  // Initial form data with defaults
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
    income: Object.keys(incomeSchema.shape).reduce((acc, key) => {
      acc[key] = "0";
      return acc;
    }, {} as Record<string, string>),
    deductions: Object.keys(deductionsSchema.shape).reduce((acc, key) => {
      acc[key] = "0";
      return acc;
    }, {} as Record<string, string>),
  });

  // Form for personal information
  const personalForm = useForm<z.infer<typeof personalInfoSchema>>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: formData.personal,
  });

  // Form for income information
  const incomeForm = useForm({
    resolver: zodResolver(incomeSchema),
    defaultValues: formData.income,
  });

  // Form for deductions information
  const deductionsForm = useForm({
    resolver: zodResolver(deductionsSchema),
    defaultValues: formData.deductions,
  });

  // Update progress based on form completion
  useEffect(() => {
    // Calculate overall progress based on completed fields in all forms
    const personalFields = Object.keys(personalForm.getValues()).length;
    const personalCompleted = Object.values(personalForm.getValues()).filter(
      Boolean
    ).length;

    const incomeFields = Object.keys(incomeForm.getValues()).length;
    const incomeCompleted = Object.values(incomeForm.getValues()).filter(
      (value) => value && value !== "0"
    ).length;

    const deductionFields = Object.keys(deductionsForm.getValues()).length;
    const deductionCompleted = Object.values(deductionsForm.getValues()).filter(
      (value) => value && value !== "0"
    ).length;

    const totalFields = personalFields + incomeFields + deductionFields;
    const totalCompleted =
      personalCompleted + incomeCompleted + deductionCompleted;

    const progress = Math.round((totalCompleted / totalFields) * 100);
    setFormProgress(progress);
  }, [personalForm, incomeForm, deductionsForm]);

  // Auto-calculate fields when relevant inputs change
  useEffect(() => {
    // Don't auto-calculate for all form types
    if (normalizedFormType === "modelo303") {
      const values = incomeForm.getValues();
      const ivaRepercutido = parseFloat(values.ivaRepercutido || "0");
      const ivaSoportado = parseFloat(values.ivaSoportado || "0");

      const resultado = Math.max(0, ivaRepercutido - ivaSoportado).toFixed(2);
      setAutoCalculatedFields({
        ...autoCalculatedFields,
        resultado: resultado,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomeForm.watch()]);

  // Handle tab changes with proper progress tracking
  const handleTabChange = (value: string) => {
    // Store the previous tab to track backwards movement
    const previousTab = activeTab;

    // Update active tab
    setActiveTab(value);

    // Handle progress changes on tab navigation
    // If moving backwards, we should reduce progress accordingly
    if (
      (previousTab === "deductions" && value === "income") ||
      (previousTab === "income" && value === "personal")
    ) {
      // Moving backwards, reduce progress somewhat
      setFormProgress(Math.max(formProgress - 15, 0));
    }
  };

  const saveProgress = () => {
    // In a real application, you would save this to localStorage, a database, or an API
    setSessionSaved(true);
    toast.success("Progreso guardado", {
      description: "Tus datos han sido guardados correctamente.",
    });
  };

  const handlePersonalSubmit = (data: z.infer<typeof personalInfoSchema>) => {
    setFormData({
      ...formData,
      personal: data,
    });
    setActiveTab("income");
    toast.success("Información personal guardada");
  };

  const handleIncomeSubmit = (data: any) => {
    setFormData({
      ...formData,
      income: data,
    });
    setActiveTab("deductions");
    toast.success("Información de ingresos guardada");
  };

  const handleDeductionsSubmit = (data: any) => {
    setFormData({
      ...formData,
      deductions: data,
    });

    // In a real application, you would save all the data here
    toast.success("Formulario completado correctamente", {
      description: "Tu información ha sido guardada.",
    });

    // Call the onComplete callback to proceed
    onComplete();
  };

  // Helper to get form title from form type
  const getFormTitle = () => {
    return formDefinition.title;
  };

  // Get income fields based on form type
  const getIncomeFields = () => {
    return formDefinition.income;
  };

  // Get deduction fields based on form type
  const getDeductionFields = () => {
    return formDefinition.deductions;
  };

  // Format currency value
  const formatCurrency = (value: string) => {
    if (!value || value === "0") return "0,00 €";
    return (
      parseFloat(value).toLocaleString("es-ES", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + " €"
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Completar {getFormTitle()} Manualmente</CardTitle>
          <Progress
            value={formProgress}
            className="h-2 w-40 mt-2"
            aria-label="Progreso del formulario"
          />
        </div>
        {!sessionSaved && (
          <Button
            variant="outline"
            size="sm"
            onClick={saveProgress}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Guardar
          </Button>
        )}
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Información Personal</TabsTrigger>
            <TabsTrigger value="income">Ingresos</TabsTrigger>
            <TabsTrigger value="deductions">Deducciones</TabsTrigger>
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
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                          <Input placeholder="p. ej. Juan" {...field} />
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
                        <FormLabel>Apellidos</FormLabel>
                        <FormControl>
                          <Input placeholder="p. ej. García López" {...field} />
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
                        <FormLabel>DNI/NIE</FormLabel>
                        <FormControl>
                          <Input placeholder="p. ej. 12345678A" {...field} />
                        </FormControl>
                        <FormDescription>
                          DNI (8 números + letra) o NIE (X/Y/Z + 7 números +
                          letra)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={personalForm.control}
                    name="birthDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de Nacimiento</FormLabel>
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
                            placeholder="p. ej. ejemplo@correo.com"
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
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input placeholder="p. ej. 612345678" {...field} />
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
                      <FormLabel>Dirección</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="p. ej. Calle Mayor 1, 3º Izq"
                          {...field}
                        />
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
                        <FormLabel>Código Postal</FormLabel>
                        <FormControl>
                          <Input placeholder="p. ej. 28001" {...field} />
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
                        <FormLabel>Ciudad</FormLabel>
                        <FormControl>
                          <Input placeholder="p. ej. Madrid" {...field} />
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
                        <FormLabel>Provincia</FormLabel>
                        <FormControl>
                          <div>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar provincia" />
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
                                <SelectItem value="zaragoza">
                                  Zaragoza
                                </SelectItem>
                                <SelectItem value="malaga">Málaga</SelectItem>
                                <SelectItem value="murcia">Murcia</SelectItem>
                                <SelectItem value="palma">
                                  Palma de Mallorca
                                </SelectItem>
                                <SelectItem value="bilbao">Bilbao</SelectItem>
                                <SelectItem value="alicante">
                                  Alicante
                                </SelectItem>
                                <SelectItem value="other">Otra</SelectItem>
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
                    Continuar a Ingresos
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
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">
                    Información de Ingresos
                  </h3>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => {
                            toast.info("Calculadora", {
                              description:
                                "Esta funcionalidad estará disponible próximamente.",
                            });
                          }}
                        >
                          <Calculator className="h-4 w-4" />
                          <span className="hidden sm:inline">Calculadora</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Abrir calculadora fiscal</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Separator />

                <div className="space-y-4">
                  {Object.entries(getIncomeFields()).map(
                    ([fieldName, fieldLabel]) => (
                      <FormField
                        key={fieldName}
                        control={incomeForm.control}
                        name={fieldName}
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex flex-row items-center justify-between">
                              <FormLabel>{fieldLabel as string} (€)</FormLabel>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                    >
                                      <HelpCircle className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {getIncomeHelpText(fieldName)}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                {...field}
                                value={field.value === "0" ? "" : field.value}
                                onChange={(e) => {
                                  const value = e.target.value || "0";
                                  field.onChange(value);
                                }}
                                placeholder="0.00"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )
                  )}

                  {/* Display auto-calculated fields if any */}
                  {Object.keys(autoCalculatedFields).length > 0 && (
                    <div className="mt-6 p-4 bg-muted/20 rounded-lg border">
                      <h4 className="text-sm font-medium mb-2">
                        Resultados calculados
                      </h4>
                      <div className="space-y-2">
                        {Object.entries(autoCalculatedFields).map(
                          ([key, value]) => (
                            <div
                              key={key}
                              className="flex justify-between items-center text-sm"
                            >
                              <span>{getCalculatedFieldLabel(key)}</span>
                              <span className="font-medium">
                                {formatCurrency(value)}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab("personal")}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver a Información Personal
                  </Button>

                  <Button type="submit">
                    Continuar a Deducciones
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
                <h3 className="text-lg font-medium">
                  Información de Deducciones
                </h3>
                <Separator />

                <div className="space-y-4">
                  {Object.entries(getDeductionFields()).map(
                    ([fieldName, fieldLabel]) => (
                      <FormField
                        key={fieldName}
                        control={deductionsForm.control}
                        name={fieldName}
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex flex-row items-center justify-between">
                              <FormLabel>{fieldLabel as string} (€)</FormLabel>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                    >
                                      <HelpCircle className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {getDeductionHelpText(fieldName)}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                {...field}
                                value={field.value === "0" ? "" : field.value}
                                onChange={(e) => {
                                  const value = e.target.value || "0";
                                  field.onChange(value);
                                }}
                                placeholder="0.00"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )
                  )}
                </div>

                <Alert className="bg-blue-50 border-blue-200">
                  <HelpCircle className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-800">
                    Información importante
                  </AlertTitle>
                  <AlertDescription className="text-blue-700 text-sm">
                    Recuerda que debes conservar los justificantes y facturas de
                    todas las deducciones aplicadas durante al menos 4 años.
                  </AlertDescription>
                </Alert>

                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab("income")}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver a Ingresos
                  </Button>

                  <Button type="submit">
                    Completar Formulario
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => {
            // Reset form progress when canceling
            setFormProgress(0);
            onCancel();
          }}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancelar
        </Button>

        {!sessionSaved && (
          <Button variant="outline" onClick={saveProgress}>
            <Save className="mr-2 h-4 w-4" />
            Guardar Progreso
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

// Helper functions for field help text
function getIncomeHelpText(fieldName: string): string {
  const helpTexts: Record<string, string> = {
    salaryIncome:
      "Ingresos brutos por trabajo por cuenta ajena, incluyendo salarios, prestaciones, pensiones, etc.",
    selfEmploymentIncome:
      "Ingresos por actividades profesionales o empresariales (autónomos)",
    capitalGainsIncome:
      "Ganancias por venta de bienes, acciones u otros activos",
    rentalIncome: "Ingresos por alquiler de inmuebles",
    otherIncome: "Otros ingresos sujetos a declaración",
    ivaRepercutido: "IVA cobrado a clientes en tus facturas emitidas",
    ivaSoportado: "IVA pagado en tus compras y gastos deducibles",
    realEstate: "Valor total de bienes inmuebles",
    financialAssets:
      "Valor de cuentas bancarias, depósitos y otros activos financieros",
  };

  return helpTexts[fieldName] || "Introduce el valor correspondiente";
}

function getDeductionHelpText(fieldName: string): string {
  const helpTexts: Record<string, string> = {
    socialSecurity: "Cotizaciones a la Seguridad Social o mutualidades",
    pensionContributions:
      "Aportaciones a planes de pensiones, hasta el límite legal",
    mortgageInterest:
      "Intereses de préstamos para vivienda habitual (solo para hipotecas anteriores a 2013)",
    donations: "Donativos a entidades sin ánimo de lucro",
    otherDeductions: "Otras deducciones aplicables según normativa",
    familyDeductions: "Deducciones por maternidad, familia numerosa, etc.",
    disabilityDeductions: "Deducciones por discapacidad propia o de familiares",
    previousPeriodCompensation:
      "Compensación de cuotas negativas de periodos anteriores",
    liabilities: "Deudas que reducen el valor del patrimonio neto",
  };

  return helpTexts[fieldName] || "Introduce el valor correspondiente";
}

function getCalculatedFieldLabel(fieldName: string): string {
  const labels: Record<string, string> = {
    resultado: "Resultado (a ingresar)",
    cuotaLiquida: "Cuota líquida",
    baseImponible: "Base imponible",
    netWorth: "Patrimonio neto",
  };

  return labels[fieldName] || fieldName;
}
