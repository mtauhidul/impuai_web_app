// src/components/onboarding/FormUpload.tsx
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  File,
  FileWarning,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

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

export function FormUpload({
  onComplete,
  onCancel,
  formType,
}: FormUploadProps): React.ReactElement {
  const [file, setFile] = useState<FileWithPreview | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  interface ExtractedData {
    personalInfo: {
      name: string;
      nif: string;
      address: string;
    };
    income: {
      totalSalary: string;
      financialIncome: string;
      capitalGains: string;
    };
    deductions: {
      socialSecurity: string;
      pensionContributions: string;
      totalDeductions: string;
    };
    result: {
      taxDue: string;
    };
  }

  const [extractedData, setExtractedData] = useState<ExtractedData | null>(
    null
  );

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.length) {
      const selectedFile = acceptedFiles[0];

      // Create preview for PDFs and images
      const fileWithPreview = Object.assign(selectedFile, {
        preview: URL.createObjectURL(selectedFile),
      });

      setFile(fileWithPreview);
      setUploadStatus("idle");
      setUploadProgress(0);
      setExtractedData(null);

      toast.success("File added", {
        description: `${selectedFile.name} selected for upload.`,
      });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
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

    // Simulate file upload progress
    const uploadInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(uploadInterval);
          return 100;
        }
        return prev + 5;
      });
    }, 100);

    // Simulate upload completion after 2 seconds
    setTimeout(() => {
      clearInterval(uploadInterval);
      setUploadProgress(100);
      setUploadStatus("processing");

      // Simulate processing (OCR/data extraction) for 3 more seconds
      setTimeout(() => {
        // Mock the extracted data for demo purposes
        const mockExtractedData = {
          personalInfo: {
            name: "Juan García López",
            nif: "12345678A",
            address: "Calle Mayor 1, 28001 Madrid",
          },
          income: {
            totalSalary: "42000.00",
            financialIncome: "1500.00",
            capitalGains: "0.00",
          },
          deductions: {
            socialSecurity: "2688.00",
            pensionContributions: "3000.00",
            totalDeductions: "5688.00",
          },
          result: {
            taxDue: "8750.00",
          },
        };

        setExtractedData(mockExtractedData);
        setUploadStatus("success");

        toast.success("Form processed successfully", {
          description: "We've extracted the data from your document.",
        });
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
  };

  // Removed unused handleError function

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          Upload Previous {formType === "modelo100" ? "Modelo 100" : formType}{" "}
          Form
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {!file ? (
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
              ${
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-gray-300 hover:border-gray-400"
              }
            `}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">Drag and drop your file here</p>
            <p className="text-sm text-muted-foreground mt-2">
              or click to browse files
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              Supported formats: PDF, JPG, PNG
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center">
                <div className="bg-primary/10 p-2 rounded-lg mr-4">
                  <File className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleRemoveFile}>
                <X className="h-5 w-5" />
              </Button>
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
                  alt="Uploaded form"
                  className="max-h-96 object-contain"
                />
              </div>
            )}

            {uploadStatus === "idle" && (
              <Button onClick={handleUpload} className="w-full">
                Upload and Extract Data
              </Button>
            )}

            {(uploadStatus === "uploading" ||
              uploadStatus === "processing") && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium">
                    {uploadStatus === "uploading"
                      ? "Uploading..."
                      : "Processing document..."}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {uploadProgress}%
                  </p>
                </div>
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-muted-foreground text-center">
                  {uploadStatus === "uploading"
                    ? "Uploading your document..."
                    : "Extracting information from your document..."}
                </p>
              </div>
            )}

            {uploadStatus === "error" && (
              <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/10 text-center">
                <FileWarning className="h-8 w-8 mx-auto mb-2 text-destructive" />
                <p className="font-medium text-destructive">
                  Processing Failed
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  We couldn't extract data from your document. Please try again
                  or use a different upload method.
                </p>
                <div className="mt-4 flex gap-2 justify-center">
                  <Button variant="outline" onClick={handleRemoveFile}>
                    Remove File
                  </Button>
                  <Button onClick={() => handleUpload()}>Try Again</Button>
                </div>
              </div>
            )}

            {uploadStatus === "success" && extractedData && (
              <div className="space-y-6">
                <div className="p-4 border border-green-200 rounded-lg bg-green-50 text-center">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p className="font-medium text-green-800">
                    Data Extraction Successful
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    We've successfully extracted the data from your document.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Extracted Information</h3>
                  <Separator />

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        Personal Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {Object.entries(extractedData.personalInfo).map(
                          ([key, value]) => (
                            <div
                              key={key}
                              className="p-3 bg-muted/30 rounded-md"
                            >
                              <span className="text-xs text-muted-foreground block">
                                {key}
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
                        Income
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {Object.entries(extractedData.income).map(
                          ([key, value]) => (
                            <div
                              key={key}
                              className="p-3 bg-muted/30 rounded-md"
                            >
                              <span className="text-xs text-muted-foreground block">
                                {key}
                              </span>
                              <span className="font-medium">
                                {value as string}€
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        Deductions
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {Object.entries(extractedData.deductions).map(
                          ([key, value]) => (
                            <div
                              key={key}
                              className="p-3 bg-muted/30 rounded-md"
                            >
                              <span className="text-xs text-muted-foreground block">
                                {key}
                              </span>
                              <span className="font-medium">
                                {value as string}€
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        Result
                      </h4>
                      <div className="p-3 bg-muted/30 rounded-md">
                        <span className="text-xs text-muted-foreground block">
                          taxDue
                        </span>
                        <span className="font-medium">
                          {extractedData.result.taxDue}€
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <Button onClick={onComplete} className="w-full">
                  Continue with Extracted Data
                </Button>
              </div>
            )}
          </div>
        )}

        {fileRejections.length > 0 && (
          <div className="mt-4 p-3 border border-destructive/50 rounded-lg bg-destructive/10">
            <p className="text-sm font-medium text-destructive">
              Invalid file:
            </p>
            <p className="text-xs text-muted-foreground">
              {fileRejections[0].errors[0].message}. Please upload a PDF or
              image file.
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancel
        </Button>

        {uploadStatus === "success" && (
          <Button onClick={onComplete}>
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
