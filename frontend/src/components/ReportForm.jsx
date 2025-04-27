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

const URGENCIES = ["Low", "Medium", "High", "Critical"];

function ReportForm({ onReportAdded, onCancel, selectedReport }) {
  const [formData, setFormData] = useState({
    description: "",
    category: "Other",
    locationText: "",
    latitude: "",
    longitude: "",
    urgency: "Medium",
  });
  const [loading, setLoading] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [locationError, setLocationError] = useState("");
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(33);

  useEffect(() => {
    if (selectedReport) {
      setFormData({
        description: selectedReport.description,
        category: selectedReport.category,
        locationText: selectedReport.locationText,
        latitude: selectedReport.latitude,
        longitude: selectedReport.longitude,
        urgency: selectedReport.urgency || "Medium",
      });
      setUseCurrentLocation(false);
      setStep(1);
      setProgress(33);
    } else {
      getCurrentLocation();
    }
  }, [selectedReport]);

  useEffect(() => {
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
          setLocationError("Unable to get your current location. Please enter manually.");
          setUseCurrentLocation(false);
        }
      );
    } else {
      setLocationError("Geolocation not supported. Please enter manually.");
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

  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (!formData.description.trim() || !formData.locationText.trim()) {
        toast.error("Please fill all required fields");
        return;
      }
      if (!formData.latitude || !formData.longitude) {
        toast.error("Location coordinates are required");
        return;
      }

      const reportData = {
        ...formData,
        latitude: Number.parseFloat(formData.latitude),
        longitude: Number.parseFloat(formData.longitude),
      };

      const newReport = await createReport(reportData);
      onReportAdded(newReport);
      toast.success("Crisis report submitted successfully!");

      setFormData({
        description: "",
        category: "Other",
        locationText: "",
        latitude: "",
        longitude: "",
        urgency: "Medium",
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
          Step {step} of 3: {step === 1 ? "Category" : step === 2 ? "Description" : "Location Details"}
        </CardDescription>
        <Progress value={progress} className="h-1 mt-2 bg-primary-foreground/20" />
      </CardHeader>

      <CardContent className="flex-1 overflow-auto pt-6">
        <form id="report-form" onSubmit={handleSubmit}>
          {/* Step 1: Category */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">Select the type of crisis:</div>
              <RadioGroup
                defaultValue={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                className="grid grid-cols-2 gap-4"
              >
                {CATEGORIES.map((category) => (
                  <div key={category.id}>
                    <RadioGroupItem value={category.label} id={category.id} className="peer sr-only" />
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the crisis situation..."
                className="min-h-[150px]"
                required
              />
            </motion.div>
          )}

          {/* Step 3: Location Info */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <Label htmlFor="locationText">Location (City, Street, Landmark)</Label>
              <Input
                id="locationText"
                name="locationText"
                value={formData.locationText}
                onChange={handleChange}
                placeholder="E.g., Main Street, New York"
                required
              />

              <div className="flex items-center space-x-2 mt-4">
                <Checkbox
                  id="useCurrentLocation"
                  checked={useCurrentLocation}
                  onCheckedChange={(checked) => {
                    setUseCurrentLocation(checked);
                    if (checked) getCurrentLocation();
                  }}
                />
                <Label htmlFor="useCurrentLocation">Use my current location</Label>
              </div>

              {locationError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{locationError}</AlertDescription>
                </Alert>
              )}

              {!useCurrentLocation && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input id="latitude" name="latitude" type="number" step="any" value={formData.latitude} onChange={handleChange} required />
                  </div>
                  <div>
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input id="longitude" name="longitude" type="number" step="any" value={formData.longitude} onChange={handleChange} required />
                  </div>
                </div>
              )}

              <Label htmlFor="urgency" className="block mt-4">Urgency</Label>
              <select
                name="urgency"
                value={formData.urgency}
                onChange={handleChange}
                className="border p-3 rounded-lg w-full"
              >
                {URGENCIES.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>

              <Separator className="my-4" />
            </motion.div>
          )}
        </form>
      </CardContent>

      <CardFooter className="flex justify-between border-t p-4">
        {step > 1 ? (
          <Button variant="outline" onClick={prevStep}>Back</Button>
        ) : (
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
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
