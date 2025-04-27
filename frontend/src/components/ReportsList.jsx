import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Search, MapPin, Clock, AlertCircle } from "lucide-react";

function ReportsList({
  reports = [],
  onClose,
  onReportSelect,
  className = "",
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredReports = reports.filter((report) => {
    // Filter by category or status
    if (
      activeFilter !== "all" &&
      report.category !== activeFilter &&
      report.status !== activeFilter
    ) {
      return false;
    }

    // Filter by search term
    if (
      searchTerm &&
      !report.description.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  const getStatusBadge = (status) => {
    const variants = {
      Reported: "warning",
      Verified: "default",
      "In Progress": "secondary",
      Resolved: "success",
    };

    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      Fire: "🔥",
      Medical: "🚑",
      Police: "👮",
      "Natural Disaster": "🌪️",
      Infrastructure: "🏗️",
      Other: "❓",
    };

    return icons[category] || "❓";
  };

  return (
    <Card className={`border-0 rounded-none h-full flex flex-col ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Crisis Reports</CardTitle>
          <CardDescription>
            {filteredReports.length}{" "}
            {filteredReports.length === 1 ? "report" : "reports"} found
          </CardDescription>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>

      <div className="px-6 pb-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="px-6 pb-2">
        <Tabs
          defaultValue="all"
          value={activeFilter}
          onValueChange={setActiveFilter}
        >
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="Reported">Active</TabsTrigger>
            <TabsTrigger value="Resolved">Resolved</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full">
          {filteredReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
              <AlertCircle className="h-10 w-10 mb-2" />
              <p>No reports match your criteria</p>
            </div>
          ) : (
            <div className="space-y-2 p-6 pt-2">
              {filteredReports.map((report) => (
                <motion.div
                  key={report._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onReportSelect(report)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">
                          {getCategoryIcon(report.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-medium truncate">
                              {report.category}
                            </h3>
                            {getStatusBadge(report.status)}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {report.description}
                          </p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span className="truncate">
                                {report.latitude.toFixed(4)},{" "}
                                {report.longitude.toFixed(4)}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{formatDate(report.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default ReportsList;
