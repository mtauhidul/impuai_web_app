// Support.tsx - For the Support section
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ExternalLink,
  FileQuestion,
  HelpCircle,
  Mail,
  MessageSquare,
  Phone,
  Search,
} from "lucide-react";
import { useState } from "react";

const faqItems = [
  {
    question: "When is the deadline for filing Modelo 100?",
    answer:
      "The general deadline for filing Modelo 100 (Spanish Income Tax) is from April 1st to June 30th each year. However, if you choose direct debit payment, the deadline ends on June 25th.",
  },
  {
    question: "How do I verify my DNI/NIE when using the app?",
    answer:
      "You can verify your DNI/NIE by uploading a scan of your identification document through the app's secure verification system. The system will validate your information with the official government database.",
  },
  {
    question: "Can I modify a tax declaration after submission?",
    answer:
      "Once a tax declaration has been submitted, you cannot modify it directly. However, you can file a supplementary declaration (declaración complementaria) or a rectification (rectificación) if you need to make changes.",
  },
  {
    question: "How do I retrieve my previous year's tax filing data?",
    answer:
      "You can retrieve your previous year's tax filing by logging into your account and accessing the 'History' section. From there, you can download or view your past declarations. Alternatively, you can use the 'Fill by uploading filled old form' option when starting a new declaration.",
  },
  {
    question: "Is my tax information secure on this platform?",
    answer:
      "Yes, all your tax information is encrypted using bank-level security protocols. We use end-to-end encryption for all sensitive data, and our systems comply with GDPR and Spanish data protection regulations.",
  },
  {
    question: "What do I do if I forgot to include some income?",
    answer:
      "If you've already submitted your declaration and forgot to include some income, you'll need to file a complementary declaration (declaración complementaria). Our AI assistant can guide you through this process.",
  },
];

export function Support() {
  const [searchQuery, setSearchQuery] = useState("");
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleContactInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitContact = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission
    console.log("Contact form submitted:", contactForm);
    // Show success message or redirect
  };

  // Filter FAQ items based on search query
  const filteredFaqs = searchQuery
    ? faqItems.filter(
        (item) =>
          item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqItems;

  return (
    <Tabs defaultValue="faq">
      <Card>
        <CardHeader>
          <CardTitle>Support Center</CardTitle>
          <CardDescription>
            Get help with your tax filing questions and issues
          </CardDescription>
          <TabsList className="mt-4">
            <TabsTrigger value="faq" className="flex items-center gap-2">
              <FileQuestion className="h-4 w-4" />
              FAQs
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Contact Us
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Resources
            </TabsTrigger>
          </TabsList>
        </CardHeader>
        <CardContent>
          <TabsContent value="faq">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search frequently asked questions..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No FAQ matches your search. Please try different keywords or
                  contact us directly.
                </div>
              ) : (
                filteredFaqs.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger>{item.question}</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground">{item.answer}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))
              )}
            </Accordion>
          </TabsContent>

          <TabsContent value="contact">
            <form onSubmit={handleSubmitContact} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={contactForm.name}
                    onChange={handleContactInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={contactForm.email}
                    onChange={handleContactInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  value={contactForm.subject}
                  onChange={handleContactInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={contactForm.message}
                  onChange={handleContactInputChange}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Send Message
              </Button>
            </form>

            <div className="mt-8 border-t pt-6">
              <h3 className="font-medium mb-4">Other ways to contact us</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="flex items-center gap-4 p-4">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <h4 className="font-medium">Email Support</h4>
                      <p className="text-sm text-muted-foreground">
                        support@asistentefiscal.es
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center gap-4 p-4">
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                      <h4 className="font-medium">Phone Support</h4>
                      <p className="text-sm text-muted-foreground">
                        +34 91 123 4567
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Mon-Fri, 9AM-6PM CET
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="resources">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tax Filing Guides</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FileQuestion className="h-4 w-4 text-primary" />
                    <a href="#" className="text-sm hover:underline">
                      Modelo 100 Complete Guide
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileQuestion className="h-4 w-4 text-primary" />
                    <a href="#" className="text-sm hover:underline">
                      Self-Employed Tax Guide
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileQuestion className="h-4 w-4 text-primary" />
                    <a href="#" className="text-sm hover:underline">
                      Non-Resident Tax Guide
                    </a>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full flex items-center gap-2"
                  >
                    View All Guides
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Official Resources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 text-primary" />
                    <a
                      href="https://sede.agenciatributaria.gob.es"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:underline"
                    >
                      Agencia Tributaria Official Website
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 text-primary" />
                    <a href="#" className="text-sm hover:underline">
                      Tax Calendar 2024
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 text-primary" />
                    <a href="#" className="text-sm hover:underline">
                      Latest Tax Law Updates
                    </a>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full flex items-center gap-2"
                  >
                    View All Resources
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Video Tutorials</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-md border p-2">
                    <div className="bg-gray-100 aspect-video rounded-md flex items-center justify-center mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-gray-400"
                      >
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </div>
                    <h4 className="font-medium text-sm">
                      How to Start Your Tax Declaration
                    </h4>
                  </div>
                  <div className="rounded-md border p-2">
                    <div className="bg-gray-100 aspect-video rounded-md flex items-center justify-center mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-gray-400"
                      >
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </div>
                    <h4 className="font-medium text-sm">
                      Using the AI Assistant for Tax Help
                    </h4>
                  </div>
                  <div className="rounded-md border p-2">
                    <div className="bg-gray-100 aspect-video rounded-md flex items-center justify-center mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-gray-400"
                      >
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </div>
                    <h4 className="font-medium text-sm">
                      Reviewing & Submitting Your Declaration
                    </h4>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </CardContent>
      </Card>
    </Tabs>
  );
}
