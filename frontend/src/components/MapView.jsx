import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, ZoomIn, ZoomOut, Locate } from "lucide-react";

// Custom zoom control component
function CustomZoomControl() {
  const map = useMap();

  const handleZoomIn = () => {
    map.zoomIn();
  };

  const handleZoomOut = () => {
    map.zoomOut();
  };

  const handleLocateMe = () => {
    map.locate({ setView: true, maxZoom: 16 });
  };

  return (
    <div className="leaflet-top leaflet-right" style={{ zIndex: 1000 }}>
      <div className="leaflet-control leaflet-bar flex flex-col bg-background shadow-md rounded-md overflow-hidden m-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-none border-b hover:bg-muted"
          onClick={handleZoomIn}
          title="Zoom in"
        >
          <ZoomIn className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-none border-b hover:bg-muted"
          onClick={handleZoomOut}
          title="Zoom out"
        >
          <ZoomOut className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-none hover:bg-muted"
          onClick={handleLocateMe}
          title="Find my location"
        >
          <Locate className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

// Component to recenter map when user location changes
function RecenterMap({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position && position.length === 2) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);

  return null;
}

// Component to fix map rendering issues
function MapFixer() {
  const map = useMap();

  useEffect(() => {
    // Force a map invalidation and redraw after component mounts
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    // Also invalidate on window resize
    const handleResize = () => {
      map.invalidateSize();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [map]);

  return null;
}

// Custom marker icons
const createCustomIcon = (category) => {
  const colors = {
    Fire: "#ef4444",
    Medical: "#3b82f6",
    Police: "#6366f1",
    "Natural Disaster": "#f59e0b",
    Infrastructure: "#10b981",
    Other: "#8b5cf6",
  };

  const color = colors[category] || colors["Other"];

  return L.divIcon({
    className: "custom-marker",
    html: `<div class="pulse-marker" style="width: 20px; height: 20px; background-color: ${color}; border-radius: 50%; border: 2px solid white;"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

function MapView({ reports, loading, onReportSelect }) {
  const [userLocation, setUserLocation] = useState(null);
  const defaultPosition = [40.7128, -74.006]; // Default to NYC
  const mapRef = useRef(null);

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

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
    <div className="map-wrapper">
      <MapContainer
        center={userLocation || defaultPosition}
        zoom={13}
        scrollWheelZoom={true}
        zoomControl={false} // Disable default zoom control
        attributionControl={true}
        doubleClickZoom={true}
        className="map-container"
        ref={mapRef}
        preferCanvas={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          updateWhenIdle={false}
          updateWhenZooming={false}
          tileSize={256}
        />

        {/* Map fixer component */}
        <MapFixer />

        {userLocation && <RecenterMap position={userLocation} />}

        {/* Custom zoom controls */}
        <CustomZoomControl />

        {/* User location marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={L.divIcon({
              className: "custom-marker",
              html: `<div style="width: 16px; height: 16px; background-color: #3b82f6; border-radius: 50%; border: 2px solid white;"></div>`,
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            })}
          >
            <Popup>
              <div className="text-center">
                <p className="font-semibold">Your Location</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Report markers */}
        {!loading &&
          reports &&
          reports.map((report) => (
            <Marker
              key={report._id}
              position={[report.latitude, report.longitude]}
              icon={createCustomIcon(report.category)}
              eventHandlers={{
                click: () => onReportSelect(report),
              }}
            >
              <Popup>
                <Card className="border-0 shadow-none">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-xl mr-2">
                          {getCategoryIcon(report.category)}
                        </span>
                        <span className="font-medium">{report.category}</span>
                      </div>
                      {getStatusBadge(report.status)}
                    </div>

                    <p className="text-sm">{report.description}</p>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>
                          {report.latitude.toFixed(4)},{" "}
                          {report.longitude.toFixed(4)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{formatDate(report.createdAt)}</span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      className="w-full mt-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        onReportSelect(report);
                      }}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}

export default MapView;
