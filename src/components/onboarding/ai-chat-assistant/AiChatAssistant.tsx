// src/components/AiChatAssistant.tsx
import {
  AlertCircle,
  Bot,
  Copy,
  Download as DownloadIcon,
  FileText,
  Maximize as MaximizeIcon,
  Mic,
  Minimize as MinimizeIcon,
  Paperclip,
  Send,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Define types
interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
}

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  attachments?: Attachment[];
}

interface AiChatAssistantProps {
  taxFormType?: string;
}

// Dummy data for initial conversation
const initialMessages: Message[] = [
  {
    id: 1,
    role: "assistant",
    content:
      "👋 ¡Hola! Soy tu asistente fiscal. Estoy aquí para ayudarte a completar tu declaración de impuestos. ¿Qué te gustaría saber sobre el Modelo 100?",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
];

// Suggested questions to help users get started
const suggestedQuestions: string[] = [
  "¿Qué es el Modelo 100?",
  "¿Cuáles son las deducciones que puedo aplicar?",
  "¿Necesito incluir ingresos del extranjero?",
  "¿Cómo funcionan las deducciones por vivienda?",
  "¿Puedo deducir gastos de autónomo?",
];

export function AiChatAssistant({
  taxFormType = "Modelo 100",
}: AiChatAssistantProps): React.ReactElement {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update initial message if tax form type changes
  useEffect(() => {
    if (taxFormType && messages.length === 1 && messages[0].id === 1) {
      setMessages([
        {
          id: 1,
          role: "assistant",
          content: `👋 ¡Hola! Soy tu asistente fiscal. Estoy aquí para ayudarte a completar tu declaración de ${taxFormType}. ¿En qué puedo ayudarte?`,
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taxFormType]);

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (): Promise<void> => {
    if (!input.trim() && attachments.length === 0) return;

    // Add user message to the chat
    const userMessage: Message = {
      id: messages.length + 1,
      role: "user",
      content: input,
      attachments: [...attachments],
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setAttachments([]);
    setShowSuggestions(false);
    setIsLoading(true);

    // Simulate OpenAI API response delay
    setTimeout(() => {
      // Add dummy assistant response
      const assistantResponse: Message = {
        id: messages.length + 2,
        role: "assistant",
        content: getDummyResponse(input),
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestedQuestion = (question: string): void => {
    setInput(question);
    // Use setTimeout to ensure the input state is updated before sending
    setTimeout(() => {
      handleSendMessage();
    }, 0);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newAttachments: Attachment[] = files.map((file) => ({
        id: Date.now() + Math.random().toString(36).substring(7),
        name: file.name,
        size: file.size,
        type: file.type,
      }));

      setAttachments((prev) => [...prev, ...newAttachments]);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeAttachment = (id: string): void => {
    setAttachments((prev) => prev.filter((attachment) => attachment.id !== id));
  };

  const handleRecording = (): void => {
    if (isRecording) {
      // Stop recording (would actually integrate with Web Speech API)
      setIsRecording(false);
      toast.success("Grabación finalizada", {
        description: "Procesando audio...",
      });

      // Simulate received transcription
      setTimeout(() => {
        setInput("¿Cuál es la fecha límite para presentar la declaración?");
      }, 1000);
    } else {
      // Start recording
      setIsRecording(true);
      toast.info("Grabando audio", {
        description: "Hable claramente para transcribir su consulta.",
      });
    }
  };

  const copyMessage = (content: string): void => {
    navigator.clipboard.writeText(content);
    toast.success("Copiado al portapapeles", {
      description: "El texto ha sido copiado correctamente.",
    });
  };

  // Function to format timestamps in a readable way
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Generate a dummy response based on user input (this would be replaced by actual API calls)
  const getDummyResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    if (input.includes("modelo 100")) {
      return "El Modelo 100 es la declaración anual del IRPF (Impuesto sobre la Renta de las Personas Físicas). Este formulario es obligatorio para la mayoría de los contribuyentes en España y se presenta generalmente entre abril y junio del año siguiente al ejercicio fiscal.";
    } else if (input.includes("deducci")) {
      return "Las deducciones principales en el IRPF incluyen:\n\n• Deducciones por inversión en vivienda habitual (régimen transitorio)\n• Deducciones por donativos a entidades sin ánimo de lucro\n• Deducciones por maternidad\n• Deducciones por familia numerosa o personas con discapacidad a cargo\n• Deducciones autonómicas específicas según tu comunidad\n\n¿Quieres que profundice en alguna de estas deducciones?";
    } else if (
      input.includes("extranjero") ||
      input.includes("ingresos del extranjero")
    ) {
      return "Sí, debes declarar todos tus ingresos mundiales en la declaración de la renta española si eres residente fiscal en España. Esto incluye salarios, rentas, intereses, dividendos y ganancias de capital obtenidos en el extranjero. Existen mecanismos para evitar la doble imposición mediante convenios fiscales entre países.";
    } else if (input.includes("vivienda")) {
      return "Las deducciones por vivienda habitual han cambiado significativamente. Desde 2013, solo pueden aplicarla quienes compraron su vivienda habitual antes del 1 de enero de 2013. La deducción es del 15% sobre un máximo de 9.040€ anuales. Si estás pagando una hipoteca anterior a esa fecha, puedes seguir beneficiándote de esta deducción.";
    } else if (input.includes("autónomo") || input.includes("autonomo")) {
      return "Los autónomos pueden deducir los gastos relacionados directamente con la actividad económica, como:\n\n• Suministros de la parte de la vivienda afecta a la actividad\n• Material de oficina\n• Cuotas de autónomos a la Seguridad Social\n• Gastos de vehículo (con restricciones)\n• Seguros profesionales\n\nRecuerda que estos gastos deben estar vinculados a la actividad económica y estar debidamente justificados con facturas.";
    } else if (input.includes("fecha límite") || input.includes("plazo")) {
      return "Para la declaración de la Renta (IRPF) correspondiente al ejercicio 2024, el plazo general es:\n\n• Inicio: 1 de abril de 2025\n• Finalización: 30 de junio de 2025\n\nSi optas por domiciliación bancaria, el plazo termina el 25 de junio de 2025. Te recomiendo no dejarlo para el último momento para evitar problemas técnicos o dudas de última hora.";
    } else {
      return (
        'Entiendo tu consulta sobre "' +
        userInput +
        '". Esta es una área importante para tu declaración de impuestos. ¿Podrías proporcionar más detalles para que pueda darte información más precisa? Si tienes dudas específicas sobre deducciones, plazos o cualquier otro aspecto fiscal, estaré encantado de ayudarte.'
      );
    }
  };

  return (
    <Card
      className={cn(
        "flex flex-col",
        isFullscreen ? "fixed inset-0 z-50 rounded-none" : "h-[600px]"
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 py-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 bg-primary-foreground p-1">
            <Bot className="h-6 w-6 text-primary" />
          </Avatar>
          <div>
            <CardTitle className="text-lg">Asistente Fiscal</CardTitle>
            <CardDescription className="text-xs">
              Powered by OpenAI
            </CardDescription>
          </div>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? (
                  <MinimizeIcon className="h-4 w-4" />
                ) : (
                  <MaximizeIcon className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isFullscreen ? "Minimizar" : "Pantalla completa"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>

      <ScrollArea className="flex-1 pb-4">
        <div className="flex flex-col gap-4 p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex flex-col gap-2 max-w-[80%]",
                message.role === "user" ? "ml-auto items-end" : "mr-auto"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {message.role === "user" ? "Tú" : "Asistente"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatTimestamp(message.timestamp)}
                </span>
              </div>

              <div
                className={cn(
                  "rounded-lg px-4 py-2",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                <div className="whitespace-pre-line">{message.content}</div>

                {/* Display attachments if any */}
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2 flex flex-col gap-2">
                    {message.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className={cn(
                          "flex items-center gap-2 rounded px-2 py-1 text-xs",
                          message.role === "user"
                            ? "bg-primary-foreground text-primary"
                            : "bg-background"
                        )}
                      >
                        <FileText className="h-3 w-3" />
                        <span className="truncate max-w-[150px]">
                          {attachment.name}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(attachment.size / 1024)} KB
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Message actions */}
              {message.role === "assistant" && (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => copyMessage(message.content)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <DownloadIcon className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 max-w-[80%] mr-auto">
              <div className="bg-muted rounded-lg px-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="animate-pulse flex space-x-1">
                    <div className="h-2 w-2 bg-muted-foreground rounded-full"></div>
                    <div className="h-2 w-2 bg-muted-foreground rounded-full"></div>
                    <div className="h-2 w-2 bg-muted-foreground rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Suggested questions */}
          {showSuggestions && !isLoading && (
            <div className="flex flex-col gap-2 mt-2">
              <p className="text-xs text-muted-foreground">
                Preguntas sugeridas:
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleSuggestedQuestion(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Display current attachments */}
      {attachments.length > 0 && (
        <div className="px-4 mb-2">
          <div className="flex flex-wrap gap-2">
            {attachments.map((file) => (
              <Badge
                key={file.id}
                variant="outline"
                className="flex items-center gap-1 pl-2"
              >
                <FileText className="h-3 w-3 text-muted-foreground" />
                <span className="max-w-[100px] truncate text-xs">
                  {file.name}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1 p-0"
                  onClick={() => removeAttachment(file.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      <CardFooter className="p-4 pt-0">
        <div className="flex w-full items-end gap-2">
          <div className="flex-1 relative">
            <Textarea
              placeholder="Escribe tu consulta fiscal aquí..."
              className="pr-10 resize-none min-h-[80px]"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            <div className="absolute bottom-2 right-2">
              <Button
                variant="ghost"
                size="icon"
                type="button"
                className="h-6 w-6"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileUpload}
                multiple
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRecording}
              className={cn(
                isRecording && "text-red-500 border-red-500 animate-pulse"
              )}
              disabled={isLoading}
            >
              <Mic className="h-4 w-4" />
            </Button>

            <Button
              type="submit"
              size="icon"
              onClick={handleSendMessage}
              disabled={
                (!input.trim() && attachments.length === 0) || isLoading
              }
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardFooter>

      {/* Disclaimer */}
      <div className="px-4 py-2 text-xs text-muted-foreground border-t">
        <div className="flex items-start gap-1">
          <AlertCircle className="h-3 w-3 mt-0.5" />
          <p>
            Este asistente proporciona información general sobre impuestos. Para
            situaciones específicas, consulte con un asesor fiscal profesional.
          </p>
        </div>
      </div>
    </Card>
  );
}
