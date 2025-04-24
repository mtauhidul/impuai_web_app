import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  File,
  FileWarning,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FormUploadProps {
  onComplete: () => void;
  onCancel: () => void;
  formType: string;
}

type FileWithPreview = File & {
  preview?: string;
};

type UploadStatus = "idle" | "uploading" | "processing" | "success" | "error";

interface ExtractedData {
  personalInfo: {
    name: string;
    nif: string;
    address: string;
    postalCode?: string;
    city?: string;
    province?: string;
    phone?: string;
    email?: string;
  };
  income: {
    totalSalary: string;
    financialIncome: string;
    capitalGains: string;
    rentalIncome?: string;
    businessIncome?: string;
  };
  deductions: {
    socialSecurity: string;
    pensionContributions: string;
    totalDeductions: string;
    mortgageInterest?: string;
    donations?: string;
  };
  result: {
    taxDue: string;
    refund?: string;
  };
  metadata?: {
    taxYear: string;
    filingDate?: string;
    referenceNumber?: string;
  };
}

// Form-specific extracted data examples
const modeloSpecificData: Record<string, Partial<ExtractedData>> = {
  modelo100: {
    metadata: {
      taxYear: "2023",
      filingDate: "15/04/2024",
      referenceNumber: "100-2023-78954621",
    },
  },
  modelo303: {
    income: {
      totalSalary: "0.00",
      financialIncome: "0.00",
      capitalGains: "0.00",
      businessIncome: "35689.45",
    },
    result: {
      taxDue: "7494.78",
      refund: "0.00",
    },
    metadata: {
      taxYear: "2023 - 4T",
      filingDate: "20/01/2024",
      referenceNumber: "303-4T-2023-65412398",
    },
  },
  modelo130: {
    income: {
      totalSalary: "0.00",
      financialIncome: "0.00",
      capitalGains: "0.00",
      businessIncome: "12500.00",
    },
    result: {
      taxDue: "2500.00",
      refund: "0.00",
    },
    metadata: {
      taxYear: "2023 - 1T",
      filingDate: "12/04/2024",
      referenceNumber: "130-1T-2023-32145698",
    },
  },
  modelo714: {
    personalInfo: {
      name: "Juan García López",
      nif: "12345678A",
      address: "Calle Mayor 1, 28001 Madrid",
    },
    result: {
      taxDue: "18452.36",
      refund: "0.00",
    },
    metadata: {
      taxYear: "2023",
      filingDate: "28/05/2024",
      referenceNumber: "714-2023-45612378",
    },
  },
};

export function FormUpload({
  onComplete,
  onCancel,
  formType,
}: FormUploadProps): React.ReactElement {
  const [file, setFile] = useState<FileWithPreview | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(
    null
  );
  const [retryCount, setRetryCount] = useState<number>(0);
  const [processingError, setProcessingError] = useState<string | null>(null);

  // Generate appropriate form title based on form type
  const getFormTitle = () => {
    switch (formType) {
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

  // Clear file preview when component unmounts
  useEffect(() => {
    return () => {
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
    };
  }, [file]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles?.length) {
        const selectedFile = acceptedFiles[0];

        // Revoke previous preview URL if it exists
        if (file?.preview) {
          URL.revokeObjectURL(file.preview);
        }

        // Create preview for PDFs and images
        const fileWithPreview = Object.assign(selectedFile, {
          preview: URL.createObjectURL(selectedFile),
        });

        setFile(fileWithPreview);
        setUploadStatus("idle");
        setUploadProgress(0);
        setExtractedData(null);
        setProcessingError(null);

        toast.success("Archivo añadido", {
          description: `${selectedFile.name} seleccionado para subir.`,
        });
      }
    },
    [file]
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    fileRejections,
    isDragReject,
  } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      "application/pdf": [".pdf"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
  });

  const handleUpload = () => {
    if (!file) return;

    setUploadStatus("uploading");
    setUploadProgress(0);
    setProcessingError(null);

    // Simulate file upload progress
    const uploadInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(uploadInterval);
          return 100;
        }
        return prev + 5;
      });
    }, 80);

    // Simulate upload completion after 2 seconds
    setTimeout(() => {
      clearInterval(uploadInterval);
      setUploadProgress(100);
      setUploadStatus("processing");

      // Simulate processing (OCR/data extraction) for 3 more seconds
      setTimeout(() => {
        // Simulated success/error (with 90% success rate, but higher fail rate after retries)
        const successRate = retryCount === 0 ? 0.9 : 0.7;

        if (Math.random() < successRate) {
          // Get base mock data
          const baseMockData: ExtractedData = {
            personalInfo: {
              name: "Juan García López",
              nif: "12345678A",
              address: "Calle Mayor 1, 28001 Madrid",
              postalCode: "28001",
              city: "Madrid",
              province: "Madrid",
              phone: "600123456",
              email: "juan.garcia@example.com",
            },
            income: {
              totalSalary: "42000.00",
              financialIncome: "1500.00",
              capitalGains: "0.00",
              rentalIncome: "0.00",
              businessIncome: "0.00",
            },
            deductions: {
              socialSecurity: "2688.00",
              pensionContributions: "3000.00",
              totalDeductions: "5688.00",
              mortgageInterest: "1200.00",
              donations: "500.00",
            },
            result: {
              taxDue: "8750.00",
              refund: "0.00",
            },
            metadata: {
              taxYear: "2023",
              filingDate: "15/04/2024",
              referenceNumber: "100-2023-78954621",
            },
          };

          // Merge with form-specific data if available
          const formTypeKey = formType.toLowerCase();
          const specificData = modeloSpecificData[formTypeKey];

          const mergedData = specificData
            ? mergeDeep(
                baseMockData as unknown as Record<string, unknown>,
                specificData as unknown as Record<string, unknown>
              )
            : baseMockData;

          setExtractedData(mergedData as ExtractedData);
          setUploadStatus("success");

          toast.success("Formulario procesado correctamente", {
            description: "Hemos extraído los datos de tu documento.",
          });
        } else {
          setUploadStatus("error");
          setProcessingError(
            "No se ha podido extraer la información del documento. Puede que el formato no sea compatible o que la calidad de la imagen no sea suficiente."
          );

          toast.error("Error al procesar el documento", {
            description:
              "No se ha podido extraer la información. Intenta de nuevo o usa otro método.",
          });
        }
      }, 3000);
    }, 2000);
  };

  const handleRemoveFile = () => {
    if (file?.preview) {
      URL.revokeObjectURL(file.preview);
    }
    setFile(null);
    setUploadStatus("idle");
    setUploadProgress(0);
    setExtractedData(null);
    setProcessingError(null);

    // Reset any progress that might have been tracked by parent component
    if (onCancel) {
      // We call onCancel and then immediately call it again to ensure the parent
      // component properly resets any progress state
      onCancel();
    }
  };

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    handleUpload();
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

  // Determine the appropriate file icon based on file type
  const getFileIcon = () => {
    if (!file) return <File className="h-8 w-8 text-primary" />;

    if (file.type === "application/pdf") {
      return <File className="h-8 w-8 text-primary" />;
    }

    if (file.type.startsWith("image/")) {
      return <File className="h-8 w-8 text-primary" />;
    }

    return <File className="h-8 w-8 text-primary" />;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Subir Formulario {getFormTitle()}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {!file ? (
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors",
              isDragActive && !isDragReject && "border-primary bg-primary/5",
              isDragReject && "border-destructive bg-destructive/5",
              !isDragActive &&
                !isDragReject &&
                "border-gray-300 hover:border-gray-400"
            )}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">
              {isDragActive
                ? isDragReject
                  ? "Tipo de archivo no soportado"
                  : "Suelta el archivo aquí"
                : "Arrastra y suelta tu archivo aquí"}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              o haz clic para buscar archivos
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              Formatos soportados: PDF, JPG, PNG
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center">
                <div className="bg-primary/10 p-2 rounded-lg mr-4">
                  {getFileIcon()}
                </div>
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleRemoveFile}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Eliminar archivo</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {file.type === "application/pdf" && (
              <div className="border rounded-lg overflow-hidden h-96 bg-muted/10">
                <iframe
                  src={file.preview}
                  className="w-full h-full"
                  title="PDF Preview"
                />
              </div>
            )}

            {file.type.startsWith("image/") && (
              <div className="border rounded-lg overflow-hidden bg-muted/10 flex justify-center">
                <img
                  src={file.preview}
                  alt="Formulario subido"
                  className="max-h-96 object-contain"
                />
              </div>
            )}

            {uploadStatus === "idle" && (
              <Button onClick={handleUpload} className="w-full">
                Subir y Extraer Datos
              </Button>
            )}

            {(uploadStatus === "uploading" ||
              uploadStatus === "processing") && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium">
                    {uploadStatus === "uploading"
                      ? "Subiendo..."
                      : "Procesando documento..."}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {uploadProgress}%
                  </p>
                </div>
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-muted-foreground text-center">
                  {uploadStatus === "uploading"
                    ? "Subiendo tu documento..."
                    : "Extrayendo información de tu documento..."}
                </p>
              </div>
            )}

            {uploadStatus === "error" && (
              <Alert variant="destructive">
                <FileWarning className="h-5 w-5" />
                <AlertTitle>Error al procesar</AlertTitle>
                <AlertDescription className="mt-2">
                  {processingError ||
                    "No se ha podido extraer datos del documento. Por favor, intenta de nuevo o usa otro método."}
                </AlertDescription>
                <div className="mt-4 flex gap-2 justify-end">
                  <Button variant="outline" onClick={handleRemoveFile}>
                    Eliminar Archivo
                  </Button>
                  <Button onClick={handleRetry}>Intentar de Nuevo</Button>
                </div>
              </Alert>
            )}

            {uploadStatus === "success" && extractedData && (
              <div className="space-y-6">
                <Alert
                  variant="default"
                  className="bg-green-50 border-green-200"
                >
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <AlertTitle className="text-green-800">
                    Extracción de datos exitosa
                  </AlertTitle>
                  <AlertDescription className="text-green-700">
                    Hemos extraído correctamente los datos de tu documento.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  {/* Metadata section if available */}
                  {extractedData.metadata && (
                    <div className="bg-muted/20 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium">
                          Información del documento
                        </h3>
                        {extractedData.metadata.referenceNumber && (
                          <span className="text-xs bg-primary/10 text-primary p-1 rounded">
                            Ref: {extractedData.metadata.referenceNumber}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">
                            Ejercicio:
                          </span>{" "}
                          <span className="font-medium">
                            {extractedData.metadata.taxYear}
                          </span>
                        </div>
                        {extractedData.metadata.filingDate && (
                          <div>
                            <span className="text-muted-foreground">
                              Fecha presentación:
                            </span>{" "}
                            <span className="font-medium">
                              {extractedData.metadata.filingDate}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <h3 className="text-lg font-medium">Información Extraída</h3>
                  <Separator />

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        Información Personal
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {Object.entries(extractedData.personalInfo).map(
                          ([key, value]) => (
                            <div
                              key={key}
                              className="p-3 bg-muted/30 rounded-md"
                            >
                              <span className="text-xs text-muted-foreground block capitalize">
                                {key === "nif"
                                  ? "NIF/NIE"
                                  : key.replace(/([A-Z])/g, " $1").trim()}
                              </span>
                              <span className="font-medium">
                                {value as string}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        Ingresos
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {Object.entries(extractedData.income)
                          .filter(([, value]) => parseFloat(value) > 0)
                          .map(([key, value]) => (
                            <div
                              key={key}
                              className="p-3 bg-muted/30 rounded-md"
                            >
                              <span className="text-xs text-muted-foreground block capitalize">
                                {key.replace(/([A-Z])/g, " $1").trim()}
                              </span>
                              <span className="font-medium">{value}€</span>
                            </div>
                          ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        Deducciones
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {Object.entries(extractedData.deductions)
                          .filter(([, value]) => parseFloat(value) > 0)
                          .map(([key, value]) => (
                            <div
                              key={key}
                              className="p-3 bg-muted/30 rounded-md"
                            >
                              <span className="text-xs text-muted-foreground block capitalize">
                                {key.replace(/([A-Z])/g, " $1").trim()}
                              </span>
                              <span className="font-medium">{value}€</span>
                            </div>
                          ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        Resultado
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {Object.entries(extractedData.result).map(
                          ([key, value]) => (
                            <div
                              key={key}
                              className={cn(
                                "p-3 rounded-md",
                                key === "taxDue" && parseFloat(value) > 0
                                  ? "bg-red-50 border border-red-100"
                                  : key === "refund" && parseFloat(value) > 0
                                  ? "bg-green-50 border border-green-100"
                                  : "bg-muted/30"
                              )}
                            >
                              <span className="text-xs text-muted-foreground block capitalize">
                                {key === "taxDue"
                                  ? "A ingresar"
                                  : key === "refund"
                                  ? "A devolver"
                                  : key.replace(/([A-Z])/g, " $1").trim()}
                              </span>
                              <span
                                className={cn(
                                  "font-medium",
                                  key === "taxDue" && parseFloat(value) > 0
                                    ? "text-red-700"
                                    : key === "refund" && parseFloat(value) > 0
                                    ? "text-green-700"
                                    : ""
                                )}
                              >
                                {value}€
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <Button onClick={onComplete} className="w-full">
                  Continuar con los Datos Extraídos
                </Button>
              </div>
            )}
          </div>
        )}

        {fileRejections.length > 0 && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Archivo inválido</AlertTitle>
            <AlertDescription>
              {fileRejections[0].errors[0].message}. Por favor, sube un archivo
              PDF o una imagen.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancelar
        </Button>

        {uploadStatus === "success" && (
          <Button onClick={onComplete}>
            Continuar
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
