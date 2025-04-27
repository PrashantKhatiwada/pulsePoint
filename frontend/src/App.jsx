"use client";

import { useState, useEffect } from "react";
import MapView from "./components/MapView";
import ReportForm from "./components/ReportForm";
import ReportsList from "./components/ReportsList";
import { fetchReports } from "./api/reports";
import { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, RefreshCw, Menu, MapPin } from "lucide-react";

function App() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [activeTab, setActiveTab] = useState("map");

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await fetchReports();
      setReports(data);
    } catch (error) {
      console.error("Error loading reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReportAdded = (newReport) => {
    setReports((prevReports) => [newReport, ...prevReports]);
    setIsFormOpen(false);
  };

  const toggleForm = () => {
    setIsFormOpen((prev) => !prev);
    if (isSidebarOpen) setIsSidebarOpen(false);
    setSelectedReport(null);
  };

  const handleReportSelect = (report) => {
    setSelectedReport(report);
    setIsFormOpen(true);
    if (isSidebarOpen) setIsSidebarOpen(false);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-primary p-1 rounded-full">
              <MapPin className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">PulsePoint</h1>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="hidden md:flex">
              {reports.length} Reports
            </Badge>

            <Button
              variant="ghost"
              size="icon"
              onClick={loadReports}
              disabled={loading}
              aria-label="Refresh reports"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Tabs (visible on small screens) */}
      <div className="md:hidden border-b">
        <Tabs
          defaultValue="map"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="map">Map View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main content */}
      <div className="flex-1 relative">
        <div
          className={`h-full ${
            activeTab === "list" ? "hidden md:block" : "block"
          }`}
        >
          <MapView
            reports={reports}
            loading={loading}
            onReportSelect={handleReportSelect}
          />
        </div>

        <div
          className={`h-full overflow-auto ${
            activeTab === "map" ? "hidden md:hidden" : "block md:hidden"
          }`}
        >
          <ReportsList
            reports={reports}
            onReportSelect={handleReportSelect}
            className="p-4"
          />
        </div>

        {/* Floating action button */}
        <motion.div
          className="absolute bottom-6 right-6 z-40"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={toggleForm}
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg"
          >
            {isFormOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <Plus className="h-6 w-6" />
            )}
          </Button>
        </motion.div>

        {/* Report form sheet */}
        <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
          <SheetContent side="left" className="sm:max-w-md w-full p-0 border-0">
            <ReportForm
              onReportAdded={handleReportAdded}
              onCancel={() => setIsFormOpen(false)}
              selectedReport={selectedReport}
            />
          </SheetContent>
        </Sheet>

        {/* Reports sidebar sheet */}
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetContent
            side="right"
            className="sm:max-w-md w-full p-0 border-0"
          >
            <ReportsList
              reports={reports}
              onClose={() => setIsSidebarOpen(false)}
              onReportSelect={handleReportSelect}
            />
          </SheetContent>
        </Sheet>

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-card p-6 rounded-lg shadow-lg flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading crisis reports...</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t py-2 text-center text-sm text-muted-foreground">
        PulsePoint Crisis Reporting System &copy; {new Date().getFullYear()}
      </footer>

      <Toaster position="top-right" />
    </div>
  );
}

export default App;
