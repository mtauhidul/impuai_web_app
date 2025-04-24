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
import { Progress } from "@/components/ui/progress";
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
  onComplete?: () => void;
}

// Suggested questions for different tax forms
const suggestedQuestionsByForm: Record<string, string[]> = {
  "Modelo 100": [
    "¿Qué es el Modelo 100?",
    "¿Cuáles son las deducciones que puedo aplicar?",
    "¿Necesito incluir ingresos del extranjero?",
    "¿Cómo funcionan las deducciones por vivienda?",
    "¿Puedo deducir gastos de autónomo?",
  ],
  "Modelo 303": [
    "¿Qué es el Modelo 303?",
    "¿Cómo calculor el IVA repercutido?",
    "¿Puedo deducir todo el IVA soportado?",
    "¿Cuál es el plazo de presentación?",
    "¿Qué ocurre si tengo más IVA soportado que repercutido?",
  ],
  "Modelo 130": [
    "¿Qué es el Modelo 130?",
    "¿Quién debe presentar este modelo?",
    "¿Cómo calculo el pago fraccionado?",
    "¿Qué gastos puedo deducir?",
    "¿Cuál es la relación con el IRPF anual?",
  ],
  "Modelo 714": [
    "¿Qué es el Impuesto sobre el Patrimonio?",
    "¿Qué bienes debo declarar?",
    "¿Cuál es el mínimo exento?",
    "¿Cómo se valoran los inmuebles?",
    "¿Existen bonificaciones autonómicas?",
  ],
};

export function AiChatAssistant({
  taxFormType = "Modelo 100",
  onComplete,
}: AiChatAssistantProps): React.ReactElement {
  // Get the appropriate suggested questions based on form type
  const suggestedQuestions =
    suggestedQuestionsByForm[taxFormType] ||
    suggestedQuestionsByForm["Modelo 100"];

  // Initial message for the chat
  const initialMessages: Message[] = [
    {
      id: 1,
      role: "assistant",
      content: `👋 ¡Hola! Soy tu asistente fiscal. Estoy aquí para ayudarte a completar tu declaración de ${taxFormType}. ¿En qué puedo ayudarte?`,
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
  ];

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0); // For tracking conversation progress
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

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

  // Track conversation progress
  useEffect(() => {
    // Simple heuristic: progress increases as more messages are exchanged
    // The goal is to reach about 80% with regular conversation
    const conversationLength = messages.length;
    if (conversationLength <= 1) {
      setProgress(0);
    } else if (conversationLength < 10) {
      // Progress increases faster at the beginning
      setProgress(Math.min(80, conversationLength * 10));
    } else {
      // Slower progress after 10 messages
      setProgress(Math.min(95, 80 + (conversationLength - 10) * 1.5));
    }
  }, [messages]);

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
        content: getDummyResponse(input, taxFormType),
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantResponse]);
      setIsLoading(false);

      // If we detect a completion intent, show completion button
      if (
        input.toLowerCase().includes("terminar") ||
        input.toLowerCase().includes("finalizar") ||
        input.toLowerCase().includes("completar") ||
        input.toLowerCase().includes("acabar") ||
        input.toLowerCase().includes("listo") ||
        input.toLowerCase().includes("acabé") ||
        input.toLowerCase().includes("terminé")
      ) {
        setIsCompleted(true);
      }
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

      toast.success(
        files.length > 1 ? "Archivos añadidos" : "Archivo añadido",
        {
          description:
            files.length > 1
              ? `${files.length} archivos preparados para enviar.`
              : `${files[0].name} preparado para enviar.`,
        }
      );
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

  const handleComplete = (): void => {
    // Set progress to 100% when completing
    setProgress(100);

    toast.success("Asistente completado", {
      description: "La información ha sido procesada correctamente.",
    });
    if (onComplete) {
      onComplete();
    }
  };

  const downloadChat = (): void => {
    // Create a text version of the chat
    const chatText = messages
      .map((message) => {
        const sender = message.role === "user" ? "Yo" : "Asistente";
        const time = formatTimestamp(message.timestamp);
        return `[${time}] ${sender}: ${message.content}`;
      })
      .join("\n\n");

    // Create a blob and download it
    const blob = new Blob([chatText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Conversación-${taxFormType.replace(/\s+/g, "-")}-${new Date()
      .toISOString()
      .substring(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Conversación guardada", {
      description:
        "El historial de chat ha sido guardado como archivo de texto.",
    });
  };

  // Function to format timestamps in a readable way
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Generate a dummy response based on user input (this would be replaced by actual API calls)
  const getDummyResponse = (userInput: string, formType: string): string => {
    const input = userInput.toLowerCase();

    // General responses for all form types
    if (input.includes("fecha límite") || input.includes("plazo")) {
      const deadlines: Record<string, string> = {
        "Modelo 100":
          "• Inicio: 1 de abril\n• Finalización: 30 de junio\n\nSi optas por domiciliación bancaria, el plazo termina el 25 de junio.",
        "Modelo 303":
          "El Modelo 303 es trimestral, con los siguientes plazos:\n• 1T: Del 1 al 20 de abril\n• 2T: Del 1 al 20 de julio\n• 3T: Del 1 al 20 de octubre\n• 4T: Del 1 al 30 de enero del año siguiente",
        "Modelo 130":
          "El Modelo 130 es trimestral, con los siguientes plazos:\n• 1T: Del 1 al 20 de abril\n• 2T: Del 1 al 20 de julio\n• 3T: Del 1 al 20 de octubre\n• 4T: Del 1 al 30 de enero del año siguiente",
        "Modelo 714":
          "Del 1 de abril al 30 de junio, coincidiendo con el plazo de presentación del IRPF.",
      };
      return `Los plazos para presentar el ${formType} son:\n\n${
        deadlines[formType] || deadlines["Modelo 100"]
      }\n\nTe recomiendo no dejarlo para el último momento para evitar problemas técnicos o dudas de última hora.`;
    }

    // Form-specific responses
    if (formType === "Modelo 100") {
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
      }
    } else if (formType === "Modelo 303") {
      if (input.includes("modelo 303")) {
        return "El Modelo 303 es la declaración trimestral del IVA (Impuesto sobre el Valor Añadido) que deben presentar empresarios, profesionales y autónomos. En él se declaran las operaciones realizadas en el trimestre, tanto el IVA repercutido (cobrado a clientes) como el IVA soportado (pagado a proveedores).";
      } else if (input.includes("iva") || input.includes("repercutido")) {
        return "El IVA repercutido es el que cobras a tus clientes en tus facturas. Dependiendo del tipo de bienes o servicios, puede ser del:\n\n• 21% (tipo general)\n• 10% (tipo reducido)\n• 4% (tipo superreducido)\n\nEste IVA repercutido debe declararse en el Modelo 303 y pagarse a Hacienda, salvo la parte que puedas compensar con el IVA soportado.";
      } else if (input.includes("soportado") || input.includes("deducir")) {
        return "El IVA soportado es el que has pagado a tus proveedores. Para poder deducirlo en tu Modelo 303 debe cumplir varios requisitos:\n\n• Debe corresponder a bienes o servicios afectos a tu actividad económica\n• Debe estar documentado en facturas completas y correctas\n• Debe estar contabilizado y registrado en los libros\n• No debe estar excluido del derecho a deducción (como gastos de representación o vehículos no afectos al 100%)\n\n¿Necesitas más información sobre algún aspecto específico?";
      }
    } else if (formType === "Modelo 130") {
      if (input.includes("modelo 130")) {
        return "El Modelo 130 es la declaración trimestral de pagos fraccionados del IRPF para empresarios y profesionales en estimación directa. Estos pagos son anticipos a cuenta del IRPF anual (Modelo 100) que se presentará el año siguiente.";
      } else if (input.includes("calcul")) {
        return "El cálculo del Modelo 130 se realiza aplicando el 20% sobre el rendimiento neto (ingresos - gastos) obtenido desde el inicio del año hasta el final del trimestre, menos los pagos fraccionados ya realizados en trimestres anteriores del mismo año, y menos las retenciones que te hayan practicado.\n\nSi estás en estimación directa simplificada, recuerda que tienes una reducción del 5% de los gastos de difícil justificación con un límite de 2.000€ anuales.";
      } else if (
        input.includes("obligatorio") ||
        input.includes("quién") ||
        input.includes("quien")
      ) {
        return "Están obligados a presentar el Modelo 130 los empresarios y profesionales individuales (no sociedades) que determinen el rendimiento de sus actividades por el método de estimación directa, tanto normal como simplificada.\n\nEstán exentos los profesionales con más del 70% de sus ingresos con retención, siempre que en el año anterior hubieran tenido al menos un pago con retención.";
      }
    } else if (formType === "Modelo 714") {
      if (input.includes("modelo 714") || input.includes("patrimonio")) {
        return "El Modelo 714 es la declaración del Impuesto sobre el Patrimonio. Este impuesto grava el patrimonio neto de las personas físicas (bienes y derechos menos deudas) cuando supera cierto umbral, que varía según la Comunidad Autónoma.";
      } else if (input.includes("mínimo") || input.includes("exento")) {
        return "El mínimo exento general en el Impuesto sobre el Patrimonio es de 700.000€, más 300.000€ por vivienda habitual. Sin embargo, cada Comunidad Autónoma puede establecer un mínimo diferente. Por ejemplo, en Madrid está bonificado al 100%, mientras que en Cataluña el mínimo exento es de 500.000€.\n\n¿Quieres información sobre alguna Comunidad Autónoma específica?";
      } else if (input.includes("bien") || input.includes("declar")) {
        return "En el Impuesto sobre el Patrimonio debes declarar todos tus bienes y derechos con valor económico:\n\n• Bienes inmuebles (viviendas, terrenos, etc.)\n• Depósitos bancarios y activos financieros\n• Acciones y participaciones en empresas\n• Seguros de vida y rentas temporales o vitalicias\n• Joyas, pieles, vehículos, embarcaciones, aeronaves\n• Objetos de arte y antigüedades\n• Derechos reales y concesiones administrativas\n• Propiedad intelectual e industrial\n\nDe estos bienes, puedes restar tus deudas para calcular el patrimonio neto.";
      } else if (input.includes("valor") || input.includes("inmueble")) {
        return "Para valorar los inmuebles en el Impuesto sobre el Patrimonio se usa el mayor de estos tres valores:\n\n• Valor catastral\n• Valor comprobado por la Administración a efectos de otros impuestos\n• Valor de adquisición\n\nPara la vivienda habitual hay una exención de hasta 300.000€, y las deudas relacionadas con la adquisición de bienes pueden restarse de su valor.";
      }
    }

    // Completion responses
    if (
      input.includes("terminar") ||
      input.includes("finalizar") ||
      input.includes("completar") ||
      input.includes("acabar") ||
      input.includes("listo") ||
      input.includes("acabé") ||
      input.includes("terminé")
    ) {
      return "¡Excelente! Parece que ya has completado la información necesaria para tu declaración. Puedes continuar con el siguiente paso del proceso usando el botón 'Completar Asistente' que aparece abajo. ¿Hay algo más en lo que pueda ayudarte antes de finalizar?";
    }

    // Default response for any other input
    return (
      'Entiendo tu consulta sobre "' +
      userInput +
      `". Esta es un área importante para tu declaración de ${formType}. ¿Podrías proporcionar más detalles para que pueda darte información más precisa? Si tienes dudas específicas sobre deducciones, plazos o cualquier otro aspecto fiscal, estaré encantado de ayudarte.`
    );
  };

  return (
    <Card
      ref={chatContainerRef}
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
              {taxFormType} • Powered by OpenAI
            </CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Progress
            value={progress}
            className="h-2 w-24 mr-2"
            aria-label="Progreso de la conversación"
          />
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
        </div>
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
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyMessage(message.content)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        Copiar al portapapeles
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={downloadChat}
                        >
                          <DownloadIcon className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        Guardar conversación
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
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

          {/* Completion button when appropriate */}
          {isCompleted && !isLoading && (
            <div className="flex flex-col items-center gap-2 p-4 mx-auto border border-green-200 bg-green-50 rounded-lg mt-4">
              <p className="text-sm text-green-800 font-medium">
                Parece que ya has completado toda la información necesaria
              </p>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={handleComplete}
              >
                Completar Asistente
              </Button>
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
