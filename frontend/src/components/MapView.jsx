import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, ZoomIn, ZoomOut, Locate } from "lucide-react";

function CustomZoomControl() {
  const map = useMap();

  const handleZoomIn = () => map.zoomIn();
  const handleZoomOut = () => map.zoomOut();
  const handleLocateMe = () => map.locate({ setView: true, maxZoom: 16 });

  return (
    <div className="leaflet-top leaflet-right" style={{ zIndex: 10 }}>
      <div className="leaflet-control leaflet-bar flex flex-col bg-background shadow-md rounded-md overflow-hidden m-2">
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-none border-b hover:bg-muted" onClick={handleZoomIn} title="Zoom in">
          <ZoomIn className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-none border-b hover:bg-muted" onClick={handleZoomOut} title="Zoom out">
          <ZoomOut className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-none hover:bg-muted" onClick={handleLocateMe} title="Find my location">
          <Locate className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position && position.length === 2) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);
  return null;
}

function MapFixer() {
  const map = useMap();
  useEffect(() => {
    const handleResize = () => map.invalidateSize();
    setTimeout(() => map.invalidateSize(), 100);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [map]);
  return null;
}

const createCustomIcon = (urgency) => {
  const colors = {
    Low: "#10b981",
    Medium: "#3b82f6",
    High: "#f59e0b",
    Critical: "#ef4444",
  };

  const color = colors[urgency] || colors["Medium"];

  return L.divIcon({
    className: "pulse-marker bounce-in",
    html: `<div style="width: 20px; height: 20px; background-color: ${color}; border: 2px solid white; border-radius: 50%; z-index: 11;"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

function MapView({ reports, loading, onReportSelect }) {
  const [userLocation, setUserLocation] = useState(null);
  const defaultPosition = [40.8337, -74.2725];
  const mapRef = useRef(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserLocation([position.coords.latitude, position.coords.longitude]),
        (error) => console.error("Error getting location:", error)
      );
    }
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    if (!reports || reports.length === 0) return;

    const map = mapRef.current;
    const validReports = reports.filter(
      (report) => report && typeof report.latitude === "number" && typeof report.longitude === "number"
    );

    if (validReports.length === 0) return;

    const bounds = L.latLngBounds(
      validReports.map((report) => [report.latitude, report.longitude])
    );

    map.fitBounds(bounds, { padding: [50, 50] });
  }, [reports]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(date);
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

  return (
    <div className="map-wrapper">
      {!loading && Array.isArray(reports) && reports.length > 0 ? (
        <MapContainer
          key={userLocation ? "user-" + userLocation.join(",") : "default"}
          center={userLocation || defaultPosition}
          zoom={13}
          scrollWheelZoom={true}
          zoomControl={false}
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

          <MapFixer />
          {userLocation && <RecenterMap position={userLocation} />}
          <CustomZoomControl />

          {userLocation && (
            <Marker
              position={userLocation}
              icon={L.divIcon({
                className: "custom-marker",
                html: `<div style="width: 16px; height: 16px; background-color: #3b82f6; border-radius: 50%; border: 2px solid white; z-index: 11000;"></div>`,
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

          {reports
            .filter(
              (report) =>
                report &&
                typeof report.latitude === "number" &&
                typeof report.longitude === "number"
            )
            .map((report) => (
              <Marker
                key={report._id}
                position={[report.latitude, report.longitude]}
                icon={createCustomIcon(report.urgency)}
                eventHandlers={{
                  click: () => onReportSelect(report),
                }}
              >
                <Popup>
                  <Card className="border-0 shadow-none">
                    <CardContent className="p-3 space-y-2">
                      <div className="flex flex-col gap-2">
                        <div className="text-lg font-bold">{report.title}</div>
                        <div className="text-sm text-muted-foreground">{report.description}</div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {report.locationText ??
                              (report.latitude != null && report.longitude != null
                                ? `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`
                                : "Location Unknown")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatDate(report.createdAt)}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-xs mt-2">
                        <Badge variant="default">{report.category}</Badge>
                        <Badge variant={report.urgency === "Critical" ? "destructive" : "secondary"}>
                          {report.urgency || "Urgent"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Popup>
              </Marker>
            ))}
        </MapContainer>
      ) : (
        <div className="h-full w-full flex items-center justify-center">
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      )}
    </div>
  );
}

export default MapView;