import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Edit,
  Info,
  Lock,
  LockKeyhole,
  RefreshCw,
  Search,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
    .min(1, "El número de documento es obligatorio")
    .refine((value) => {
      // Full validation for Spanish DNI/NIE
      const dniRegex = /^[0-9]{8}[A-Za-z]$/;
      const nieRegex = /^[XYZxyz][0-9]{7}[A-Za-z]$/;
      return dniRegex.test(value) || nieRegex.test(value);
    }, "Introduce un DNI (8 números + letra) o NIE (X/Y/Z + 7 números + letra) válido"),
  dateOfBirth: z
    .string()
    .min(1, "La fecha de nacimiento es obligatoria")
    .refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, "Por favor, introduce una fecha de nacimiento válida"),
  consentCheck: z.boolean().refine((val) => val === true, {
    message: "Debes aceptar los términos de uso del servicio de consulta",
  }),
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
  metadata?: {
    lastUpdated: string;
    referenceNumber: string;
    validUntil?: string;
  };
}

// Form-specific mock data
const formSpecificData: Record<string, Partial<TaxData>> = {
  modelo100: {
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
    metadata: {
      lastUpdated: "15/04/2024",
      referenceNumber: "RENTA2023-12345678A",
      validUntil: "30/06/2024",
    },
  },
  modelo303: {
    taxInfo: {
      employmentIncome: "0.00",
      capitalIncome: "0.00",
      propertyIncome: "0.00",
      businessIncome: "35689.45",
      withholdings: "7494.78",
      deductions: {
        socialSecurity: "0.00",
        personalAllowance: "0.00",
        pensionContributions: "0.00",
        mortgageDeduction: "0.00",
      },
    },
    metadata: {
      lastUpdated: "20/01/2024",
      referenceNumber: "IVA4T2023-12345678A",
      validUntil: "20/04/2024",
    },
  },
  modelo130: {
    taxInfo: {
      employmentIncome: "0.00",
      capitalIncome: "0.00",
      propertyIncome: "0.00",
      businessIncome: "12500.00",
      withholdings: "0.00",
      deductions: {
        socialSecurity: "395.00",
        personalAllowance: "0.00",
        pensionContributions: "0.00",
        mortgageDeduction: "0.00",
      },
    },
    metadata: {
      lastUpdated: "12/04/2024",
      referenceNumber: "PF1T2023-12345678A",
      validUntil: "20/07/2024",
    },
  },
  modelo714: {
    taxInfo: {
      employmentIncome: "0.00",
      capitalIncome: "18000.00",
      propertyIncome: "25000.00",
      businessIncome: "0.00",
      withholdings: "0.00",
      deductions: {
        socialSecurity: "0.00",
        personalAllowance: "0.00",
        pensionContributions: "0.00",
        mortgageDeduction: "0.00",
      },
    },
    metadata: {
      lastUpdated: "28/05/2024",
      referenceNumber: "PATRIMONIO2023-12345678A",
      validUntil: "30/06/2024",
    },
  },
};

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
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  // Get form type key for data selection
  const formTypeKey = formType.toLowerCase().replace(/\s+/g, "");

  // Form for ID verification
  const verificationForm = useForm<z.infer<typeof verificationSchema>>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      documentNumber: "",
      dateOfBirth: "",
      consentCheck: false,
    },
  });

  const simulateApiCall = async (data: z.infer<typeof verificationSchema>) => {
    setLookupState("loading");
    setLoadingProgress(0);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 500);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 3000));
    clearInterval(progressInterval);
    setLoadingProgress(100);

    // Random success or failure (80% success rate)
    const isSuccessful = Math.random() < 0.8;

    if (isSuccessful) {
      // Mock data that would be returned from the API
      const baseData: TaxData = {
        personalInfo: {
          fullName: "Juan García López",
          documentNumber: data.documentNumber.toUpperCase(),
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
        metadata: {
          lastUpdated: "15/04/2024",
          referenceNumber: "RENTA2023-12345678A",
          validUntil: "30/06/2024",
        },
      };

      // Merge form-specific data if available
      const specificData = formSpecificData[formTypeKey];
      const mergedData = specificData
        ? mergeDeep(
            baseData as unknown as Record<string, unknown>,
            specificData as unknown as Record<string, unknown>
          )
        : baseData;

      setTaxData(mergedData as TaxData);
      setLookupState("success");
      toast.success("Información recuperada con éxito", {
        description: "Hemos encontrado tus datos fiscales en el sistema.",
      });
    } else {
      setLookupState("error");

      // Set a random error message
      const errorMessages = [
        "No se ha encontrado información asociada al número de documento y fecha de nacimiento proporcionados.",
        "El servicio de consulta de la Agencia Tributaria no está disponible en este momento. Por favor, inténtalo más tarde.",
        "La información solicitada no está disponible para este tipo de formulario.",
        "El contribuyente no tiene datos registrados para el ejercicio fiscal actual.",
      ];

      setErrorDetails(
        errorMessages[Math.floor(Math.random() * errorMessages.length)]
      );

      toast.error("Error en la consulta", {
        description: "No ha sido posible recuperar tu información fiscal.",
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
    toast.success("Información actualizada", {
      description: "Los cambios han sido guardados correctamente.",
    });
  };

  const handleTryAgain = () => {
    setLookupState("initial");
    setTaxData(null);
    setErrorDetails(null);
    setLoadingProgress(0);
    verificationForm.reset({
      documentNumber: "",
      dateOfBirth: "",
      consentCheck: false,
    });
  };

  const handleCancelWithReset = () => {
    // Reset all state before calling onCancel
    setLookupState("initial");
    setTaxData(null);
    setErrorDetails(null);
    setLoadingProgress(0);

    // Call the parent cancel handler to reset any progress tracking
    onCancel();
  };

  // Get the appropriate form title
  const getFormTitle = () => {
    switch (formTypeKey) {
      case "modelo100":
        return "Modelo 100 (IRPF)";
      case "modelo303":
        return "Modelo 303 (IVA)";
      case "modelo130":
        return "Modelo 130 (Pago Fraccionado)";
      case "modelo714":
        return "Modelo 714 (Patrimonio)";
      default:
        return formType;
    }
  };

  // Helper function to deep merge objects
  function mergeDeep(
    target: Record<string, unknown>,
    source: Record<string, unknown>
  ) {
    const output = { ...target };

    if (isObject(target) && isObject(source)) {
      Object.keys(source).forEach((key) => {
        if (isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] });
          } else {
            output[key] = mergeDeep(
              target[key] as Record<string, unknown>,
              source[key] as Record<string, unknown>
            );
          }
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    return output;
  }

  // Helper to check if value is an object
  function isObject(item: unknown): item is Record<string, unknown> {
    return item !== null && typeof item === "object" && !Array.isArray(item);
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Consultar {getFormTitle()} mediante DNI/NIE</CardTitle>
        <CardDescription>
          Buscaremos tus datos fiscales existentes en la base de datos oficial
          de la Agencia Tributaria
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
                      <FormLabel>Número de DNI/NIE</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej. 12345678A o X1234567A"
                          {...field}
                          autoComplete="off"
                        />
                      </FormControl>
                      <FormDescription>
                        Introduce tu DNI (8 números + letra) o NIE (X/Y/Z + 7
                        números + letra)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={verificationForm.control}
                  name="dateOfBirth"
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

                <FormField
                  control={verificationForm.control}
                  name="consentCheck"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            id="consentCheck"
                          />
                          <label
                            htmlFor="consentCheck"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Acepto los términos de uso del servicio de consulta
                            de datos fiscales y doy mi consentimiento para la
                            verificación de mi identidad
                          </label>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800">
                  Información importante
                </AlertTitle>
                <AlertDescription className="text-blue-700">
                  Esta consulta utiliza la API oficial de la Agencia Tributaria.
                  Tus datos son tratados conforme a la normativa de protección
                  de datos y RGPD.
                </AlertDescription>
              </Alert>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-medium">Conexión segura</h4>
                    <p className="text-xs text-muted-foreground">
                      Tus datos se transmiten de forma cifrada
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-medium">Datos protegidos</h4>
                    <p className="text-xs text-muted-foreground">
                      Cumplimos con la RGPD
                    </p>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={verificationForm.formState.isSubmitting}
              >
                <Search className="mr-2 h-4 w-4" />
                Consultar Información Fiscal
              </Button>
            </form>
          </Form>
        )}

        {lookupState === "loading" && (
          <div className="text-center py-12">
            <div className="mb-6">
              <Progress value={loadingProgress} className="h-2 w-full mb-2" />
              <p className="text-sm text-muted-foreground">
                {loadingProgress < 30
                  ? "Conectando con la Agencia Tributaria..."
                  : loadingProgress < 60
                  ? "Verificando identidad..."
                  : loadingProgress < 90
                  ? "Recuperando datos fiscales..."
                  : "Procesando información..."}
              </p>
            </div>
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Spinner className="h-12 w-12 text-primary" />
                <LockKeyhole className="h-5 w-5 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
            </div>
            <h3 className="text-lg font-medium">Consultando tus datos</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
              Estamos conectando de forma segura con la base de datos de la
              Agencia Tributaria. Este proceso puede tardar unos segundos.
            </p>
          </div>
        )}

        {lookupState === "error" && (
          <div className="text-center py-8">
            <div className="bg-destructive/10 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-destructive" />
            </div>
            <h3 className="text-lg font-medium">
              No se ha podido completar la consulta
            </h3>
            <p className="text-sm text-muted-foreground mt-2 mb-4 max-w-md mx-auto">
              {errorDetails ||
                "No hemos podido encontrar tu información en el sistema."}
            </p>

            <Alert
              variant="destructive"
              className="mb-8 mx-auto max-w-md text-left"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Posibles causas:</AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                  <li>DNI/NIE o fecha de nacimiento incorrectos</li>
                  <li>No has presentado declaraciones anteriores</li>
                  <li>
                    El servicio de la Agencia Tributaria no está disponible
                  </li>
                  <li>
                    Tu declaración para este ejercicio aún no está disponible
                  </li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={handleTryAgain}
              >
                <RefreshCw className="h-4 w-4" />
                Intentar de nuevo
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={handleCancelWithReset}
              >
                <ArrowLeft className="h-4 w-4" />
                Probar otro método
              </Button>
            </div>
          </div>
        )}

        {lookupState === "success" && taxData && (
          <div className="space-y-8">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <AlertTitle className="text-green-800">
                Información recuperada con éxito
              </AlertTitle>
              <AlertDescription className="text-green-700">
                Hemos encontrado tus datos fiscales en el sistema de la Agencia
                Tributaria.
              </AlertDescription>
            </Alert>

            {taxData.metadata && (
              <div className="bg-muted/20 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">
                    Información de la consulta
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    Ref: {taxData.metadata.referenceNumber}
                  </Badge>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">
                      Última actualización:
                    </span>{" "}
                    <span className="font-medium">
                      {taxData.metadata.lastUpdated}
                    </span>
                  </div>
                  {taxData.metadata.validUntil && (
                    <div>
                      <span className="text-muted-foreground">
                        Válido hasta:
                      </span>{" "}
                      <span className="font-medium">
                        {taxData.metadata.validUntil}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Información Personal</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditMode(!editMode)}
                        className="flex items-center gap-1.5"
                      >
                        <Edit className="h-4 w-4" />
                        {editMode ? "Cancelar Edición" : "Editar Información"}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {editMode
                        ? "Cancelar cambios"
                        : "Actualizar información de contacto"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Separator />

              {!editMode ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(taxData.personalInfo).map(([key, value]) => (
                    <div key={key} className="p-3 bg-muted/30 rounded-md">
                      <span className="text-xs text-muted-foreground block capitalize">
                        {key === "documentNumber"
                          ? "DNI/NIE"
                          : key === "fullName"
                          ? "Nombre completo"
                          : key === "dateOfBirth"
                          ? "Fecha de nacimiento"
                          : key === "address"
                          ? "Dirección"
                          : key === "postalCode"
                          ? "Código postal"
                          : key === "city"
                          ? "Ciudad"
                          : key === "province"
                          ? "Provincia"
                          : key === "phone"
                          ? "Teléfono"
                          : key === "email"
                          ? "Correo electrónico"
                          : key.replace(/([A-Z])/g, " $1").trim()}
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
                        {key === "documentNumber"
                          ? "DNI/NIE"
                          : key === "fullName"
                          ? "Nombre completo"
                          : key === "dateOfBirth"
                          ? "Fecha de nacimiento"
                          : key === "address"
                          ? "Dirección"
                          : key === "postalCode"
                          ? "Código postal"
                          : key === "city"
                          ? "Ciudad"
                          : key === "province"
                          ? "Provincia"
                          : key === "phone"
                          ? "Teléfono"
                          : key === "email"
                          ? "Correo electrónico"
                          : key.replace(/([A-Z])/g, " $1").trim()}
                      </label>
                      <Input
                        defaultValue={value}
                        className="h-9"
                        disabled={
                          key === "documentNumber" ||
                          key === "dateOfBirth" ||
                          key === "fullName"
                        }
                      />
                    </div>
                  ))}

                  <div className="md:col-span-2">
                    <Button onClick={handleTaxDataUpdate} className="w-full">
                      Actualizar Información Personal
                    </Button>
                  </div>
                </div>
              )}

              <h3 className="text-lg font-medium mt-6">Información Fiscal</h3>
              <Separator />

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    Ingresos
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(taxData.taxInfo)
                      .filter(
                        ([key]) =>
                          !key.includes("deductions") &&
                          !key.includes("withholdings") &&
                          parseFloat(
                            taxData.taxInfo[
                              key as keyof typeof taxData.taxInfo
                            ] as string
                          ) > 0
                      )
                      .map(([key, value]) => (
                        <div key={key} className="p-3 bg-muted/30 rounded-md">
                          <span className="text-xs text-muted-foreground block capitalize">
                            {key === "employmentIncome"
                              ? "Rendimientos del trabajo"
                              : key === "capitalIncome"
                              ? "Rendimientos del capital mobiliario"
                              : key === "propertyIncome"
                              ? "Rendimientos del capital inmobiliario"
                              : key === "businessIncome"
                              ? "Rendimientos de actividades económicas"
                              : key.replace(/([A-Z])/g, " $1").trim()}
                          </span>
                          <span className="font-medium">
                            {parseFloat(value as string).toLocaleString(
                              "es-ES",
                              {
                                style: "currency",
                                currency: "EUR",
                              }
                            )}
                          </span>
                        </div>
                      ))}
                    {parseFloat(taxData.taxInfo.withholdings) > 0 && (
                      <div className="p-3 bg-green-50 border border-green-100 rounded-md">
                        <span className="text-xs text-muted-foreground block">
                          Retenciones
                        </span>
                        <span className="font-medium text-green-700">
                          {parseFloat(
                            taxData.taxInfo.withholdings
                          ).toLocaleString("es-ES", {
                            style: "currency",
                            currency: "EUR",
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    Deducciones
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(taxData.taxInfo.deductions)
                      .filter(([, value]) => parseFloat(value) > 0)
                      .map(([key, value]) => (
                        <div key={key} className="p-3 bg-muted/30 rounded-md">
                          <span className="text-xs text-muted-foreground block capitalize">
                            {key === "socialSecurity"
                              ? "Seguridad Social"
                              : key === "personalAllowance"
                              ? "Mínimo personal y familiar"
                              : key === "pensionContributions"
                              ? "Aportaciones a planes de pensiones"
                              : key === "mortgageDeduction"
                              ? "Deducción por vivienda habitual"
                              : key.replace(/([A-Z])/g, " $1").trim()}
                          </span>
                          <span className="font-medium">
                            {parseFloat(value).toLocaleString("es-ES", {
                              style: "currency",
                              currency: "EUR",
                            })}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <Button onClick={onComplete} className="w-full mt-6">
                Continuar con los Datos Recuperados
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleCancelWithReset}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancelar
        </Button>
      </CardFooter>
    </Card>
  );
}
