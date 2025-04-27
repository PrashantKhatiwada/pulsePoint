import { useState, useEffect } from "react";
import { createReport } from "../api/reports";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
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
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Loader2, MapPin, Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const CATEGORIES = [
  { id: "fire", label: "Fire", icon: "🔥" },
  { id: "medical", label: "Medical", icon: "🚑" },
  { id: "police", label: "Police", icon: "👮" },
  { id: "natural-disaster", label: "Natural Disaster", icon: "🌪️" },
  { id: "infrastructure", label: "Infrastructure", icon: "🏗️" },
  { id: "other", label: "Other", icon: "❓" },
];

function ReportForm({ onReportAdded, onCancel, selectedReport }) {
  const [formData, setFormData] = useState({
    description: "",
    category: "Other",
    latitude: "",
    longitude: "",
  });
  const [loading, setLoading] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [locationError, setLocationError] = useState("");
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(33);

  useEffect(() => {
    // If a report is selected, populate the form with its data
    if (selectedReport) {
      setFormData({
        description: selectedReport.description,
        category: selectedReport.category,
        latitude: selectedReport.latitude,
        longitude: selectedReport.longitude,
      });
      setUseCurrentLocation(false);
      setStep(1);
      setProgress(33);
    } else {
      // Otherwise, try to get the user's current location
      getCurrentLocation();
    }
  }, [selectedReport]);

  useEffect(() => {
    // Update progress based on step
    setProgress(step * 33);
  }, [step]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLocationError("");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData((prev) => ({
            ...prev,
            latitude,
            longitude,
          }));
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationError(
            "Unable to get your current location. Please enter coordinates manually."
          );
          setUseCurrentLocation(false);
        }
      );
    } else {
      setLocationError(
        "Geolocation is not supported by your browser. Please enter coordinates manually."
      );
      setUseCurrentLocation(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const nextStep = () => {
    if (step === 1 && !formData.category) {
      toast.error("Please select a category");
      return;
    }
    if (step === 2 && !formData.description.trim()) {
      toast.error("Please provide a description");
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Validate form
      if (!formData.description.trim()) {
        toast.error("Please provide a description");
        return;
      }

      if (!formData.latitude || !formData.longitude) {
        toast.error("Location coordinates are required");
        return;
      }

      // Convert string coordinates to numbers
      const reportData = {
        ...formData,
        latitude: Number.parseFloat(formData.latitude),
        longitude: Number.parseFloat(formData.longitude),
      };

      const newReport = await createReport(reportData);
      onReportAdded(newReport);
      toast.success("Crisis report submitted successfully");

      // Reset form
      setFormData({
        description: "",
        category: "Other",
        latitude: "",
        longitude: "",
      });
      setStep(1);
      setProgress(33);
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 rounded-none h-full flex flex-col mt-4">
      <CardHeader className="bg-primary text-primary-foreground py-2">
        <CardTitle>Report a Crisis</CardTitle>
        <CardDescription className="text-primary-foreground/80">
          Step {step} of 3:{" "}
          {step === 1 ? "Category" : step === 2 ? "Description" : "Location"}
        </CardDescription>
        <Progress
          value={progress}
          className="h-1 mt-2 bg-primary-foreground/20"
        />
      </CardHeader>

      <CardContent className="flex-1 overflow-auto pt-6">
        <form id="report-form" onSubmit={handleSubmit}>
          {/* Step 1: Category Selection */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="text-sm text-muted-foreground mb-4">
                Select the category that best describes the crisis:
              </div>

              <RadioGroup
                defaultValue={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
                className="grid grid-cols-2 gap-4"
              >
                {CATEGORIES.map((category) => (
                  <div key={category.id}>
                    <RadioGroupItem
                      value={category.label}
                      id={category.id}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={category.id}
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <div className="text-2xl mb-2">{category.icon}</div>
                      <div className="font-medium">{category.label}</div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </motion.div>
          )}

          {/* Step 2: Description */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the crisis situation in detail..."
                  className="min-h-[150px]"
                  required
                />
              </div>

              <div className="flex items-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl mr-3">
                  {CATEGORIES.find((c) => c.label === formData.category)
                    ?.icon || "❓"}
                </div>
                <div>
                  <div className="font-medium">{formData.category}</div>
                  <div className="text-xs text-muted-foreground">
                    Selected category
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Location */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="useCurrentLocation"
                  checked={useCurrentLocation}
                  onCheckedChange={(checked) => {
                    setUseCurrentLocation(checked);
                    if (checked) getCurrentLocation();
                  }}
                />
                <Label htmlFor="useCurrentLocation">
                  Use my current location
                </Label>
              </div>

              {locationError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{locationError}</AlertDescription>
                </Alert>
              )}

              {!useCurrentLocation && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      name="latitude"
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      name="longitude"
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              )}

              <Separator className="my-4" />

              <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                <div className="text-sm font-medium">Report Summary</div>

                <div className="flex items-center">
                  <div className="text-2xl mr-3">
                    {CATEGORIES.find((c) => c.label === formData.category)
                      ?.icon || "❓"}
                  </div>
                  <div className="font-medium">{formData.category}</div>
                </div>

                <div className="text-sm">
                  {formData.description.length > 100
                    ? `${formData.description.substring(0, 100)}...`
                    : formData.description}
                </div>

                {formData.latitude && formData.longitude && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>
                      {Number(formData.latitude).toFixed(4)},{" "}
                      {Number(formData.longitude).toFixed(4)}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </form>
      </CardContent>

      <CardFooter className="flex justify-between border-t p-4">
        {step > 1 ? (
          <Button variant="outline" onClick={prevStep}>
            Back
          </Button>
        ) : (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}

        {step < 3 ? (
          <Button onClick={nextStep}>Next</Button>
        ) : (
          <Button type="submit" form="report-form" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Submit Report
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default ReportForm;
