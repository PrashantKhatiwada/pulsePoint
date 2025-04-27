"use client";

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
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Search, MapPin, Clock, AlertCircle, Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function ReportsList({ reports = [], onClose, onReportSelect, className = "" }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredReports = Array.isArray(reports)
    ? reports.filter((report) => {
        if (!report) return false;
        if (
          activeFilter !== "all" &&
          report.category !== activeFilter &&
          report.status !== activeFilter
        ) {
          return false;
        }
        if (
          searchTerm &&
          !(report.description || "").toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          return false;
        }
        return true;
      })
    : [];

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown Date";
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
    return <Badge variant={variants[status] || "outline"}>{status || "Unknown"}</Badge>;
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

  const getFilterLabel = () => {
    switch (activeFilter) {
      case "all":
        return "All Reports";
      case "Reported":
        return "Active Reports";
      case "Resolved":
        return "Resolved Reports";
      default:
        return activeFilter;
    }
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

      <div className="px-6 pb-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={activeFilter}
                onValueChange={setActiveFilter}
              >
                <DropdownMenuRadioItem value="all">All Reports</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Reported">Active Reports</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Resolved">Resolved Reports</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {activeFilter !== "all" && (
          <div className="mt-2 flex items-center">
            <Badge variant="outline" className="mr-2">{getFilterLabel()}</Badge>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 p-0 text-xs text-muted-foreground"
              onClick={() => setActiveFilter("all")}
            >
              Clear
            </Button>
          </div>
        )}
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
              {filteredReports.map((report, index) => (
                <motion.div
                  key={report?._id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => report && onReportSelect(report)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">
                          {getCategoryIcon(report?.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-medium truncate">
                              {report?.category || "No Category"}
                            </h3>
                            {getStatusBadge(report?.status)}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {report?.description || "No Description"}
                          </p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span className="truncate">
                                {(report?.latitude != null && report?.longitude != null)
                                  ? `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`
                                  : "Unknown Location"}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{formatDate(report?.createdAt)}</span>
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
