// History.tsx - For the History section
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Eye, FileText, Filter, Search } from "lucide-react";
import { useState } from "react";

// Sample tax filing history data
const taxFilings = [
  {
    id: "F2024-001",
    type: "Modelo 100",
    year: "2024",
    status: "Submitted",
    dateSubmitted: "2024-04-10",
    amount: "€1,245.78",
  },
  {
    id: "F2023-045",
    type: "Modelo 100",
    year: "2023",
    status: "Completed",
    dateSubmitted: "2023-04-15",
    amount: "€956.32",
  },
  {
    id: "F2023-102",
    type: "Modelo 303",
    year: "2023",
    status: "Completed",
    dateSubmitted: "2023-10-20",
    amount: "€450.00",
  },
  {
    id: "F2022-089",
    type: "Modelo 100",
    year: "2022",
    status: "Completed",
    dateSubmitted: "2022-04-18",
    amount: "€1,120.45",
  },
  {
    id: "F2022-156",
    type: "Modelo 349",
    year: "2022",
    status: "Completed",
    dateSubmitted: "2022-06-30",
    amount: "€0.00",
  },
  {
    id: "F2024-012",
    type: "Modelo 303",
    year: "2024",
    status: "Draft",
    dateSubmitted: "-",
    amount: "-",
  },
];

export function History() {
  const [searchTerm, setSearchTerm] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Filter the tax filings based on search term and filters
  const filteredFilings = taxFilings.filter((filing) => {
    const matchesSearch =
      filing.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      filing.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = yearFilter === "all" || filing.year === yearFilter;
    const matchesType = typeFilter === "all" || filing.type === typeFilter;

    return matchesSearch && matchesYear && matchesType;
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Tax Filing History</CardTitle>
        <CardDescription>
          View and manage your previous tax filings and documents
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search filings..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Filter year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter form type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Forms</SelectItem>
                <SelectItem value="Modelo 100">Modelo 100</SelectItem>
                <SelectItem value="Modelo 303">Modelo 303</SelectItem>
                <SelectItem value="Modelo 349">Modelo 349</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Form Type</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFilings.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No tax filings found
                  </TableCell>
                </TableRow>
              ) : (
                filteredFilings.map((filing) => (
                  <TableRow key={filing.id}>
                    <TableCell>{filing.id}</TableCell>
                    <TableCell className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      {filing.type}
                    </TableCell>
                    <TableCell>{filing.year}</TableCell>
                    <TableCell>{filing.dateSubmitted}</TableCell>
                    <TableCell>{filing.amount}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          filing.status === "Completed"
                            ? "default"
                            : filing.status === "Submitted"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {filing.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={filing.status === "Draft"}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
