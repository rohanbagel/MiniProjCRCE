import { useState, useRef, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, Image as ImageIcon, LocateFixed, Search, MapPin, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import { useTheme } from "@/context/ThemeContext";
import { getMapTile } from "@/lib/mapTiles";

function MapController({ coordinates }) {
  const map = useMap();
  useEffect(() => {
    if (coordinates) {
      map.flyTo(coordinates, 14, { animate: true, duration: 1 });
    }
  }, [coordinates, map]);
  return null;
}

export default function CreateFarm() {
  const { theme } = useTheme();
  const { url: tileUrl, attribution: tileAttribution } = getMapTile(theme);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const fileInputRef = useRef(null);
  const searchTimeout = useRef(null);
  const suggestionsRef = useRef(null);
  const navigate = useNavigate();
  const { mongoUser } = useUser();

  const [formData, setFormData] = useState({
    name: "",
    location: "",
  });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddressSearch = (value) => {
    setSearchQuery(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&addressdetails=1&limit=5&countrycodes=in`
        );
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
      } catch {
        // silent
      } finally {
        setSearching(false);
      }
    }, 400);
  };

  const selectSuggestion = (item) => {
    const coords = [parseFloat(item.lat), parseFloat(item.lon)];
    setCoordinates(coords);
    setFormData((prev) => ({
      ...prev,
      location: `${coords[0].toFixed(5)}, ${coords[1].toFixed(5)}`,
    }));
    setSearchQuery(item.display_name);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const markerIcon = new L.Icon({
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    shadowSize: [41, 41],
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setCoordinates(coords);
        setFormData((prev) => ({
          ...prev,
          location: `${coords[0].toFixed(5)}, ${coords[1].toFixed(5)}`,
        }));
        setLocating(false);
        toast.success("Location set to your current position");
      },
      (err) => {
        setLocating(false);
        toast.error("Could not get location: " + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter a farm name");
      return;
    }

    if (!formData.location.trim()) {
      toast.error("Please tap on the map to set your farm location");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const submitData = new FormData();

      submitData.append("name", formData.name);
      submitData.append("location", formData.location);
      if (mongoUser) {
        submitData.append("farmerId", mongoUser._id);
      }

      if (imageFile) {
        submitData.append("image", imageFile);
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/farms`,
        submitData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Farm added successfully!");
      navigate(`/farms/${response.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not add farm. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  function LocationMarker() {
    useMapEvents({
      click(e) {
        const coords = [e.latlng.lat, e.latlng.lng];
        setCoordinates(coords);
        setFormData((prev) => ({
          ...prev,
          location: `${coords[0].toFixed(5)}, ${coords[1].toFixed(5)}`,
        }));
      },
    });
    return coordinates ? <Marker position={coordinates} icon={markerIcon} /> : null;
  }

  return (
    <Layout>
      <div className="organic-page">
        <div className="farm-shell space-y-6 p-4 md:p-6 lg:p-8">
          <section className="farm-hero p-5 md:p-7">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="organic-title text-4xl md:text-5xl">Create Farm</h1>
                <p className="organic-subtitle mt-2 max-w-2xl text-sm md:text-base">
                  Add your farm profile with accurate pinning and a photo for faster identification.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="farm-soft-chip">
                  <MapPin className="h-3.5 w-3.5" />
                  Live map pinning
                </span>
                <span className="farm-soft-chip">
                  <Sparkles className="h-3.5 w-3.5" />
                  Better record quality
                </span>
              </div>
            </div>
          </section>

          <Card className="farm-panel overflow-hidden">
            <CardHeader className="border-b border-border/60 bg-linear-to-r from-background to-background/80">
              <CardTitle className="text-2xl md:text-3xl">Add a New Farm</CardTitle>
              <p className="organic-subtitle text-sm">Required fields are marked with *</p>
            </CardHeader>
            <CardContent className="p-4 md:p-6 lg:p-7">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr,1.25fr]">
                  <div className="farm-panel farm-focus p-4 md:p-5">
                    <p className="farm-section-title mb-3">Farm Photo</p>
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative h-56 w-full overflow-hidden rounded-xl border border-border/60 bg-muted/20" onClick={() => fileInputRef.current?.click()}>
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.02]" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                              <ImageIcon className="h-12 w-12" />
                              <p className="text-sm">Tap to upload farm photo</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="organic-btn-outline farm-inline-action w-full"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4" />
                        Add a Photo
                      </Button>
                      <p className="text-xs text-muted-foreground">Accepted format: image file up to 5MB</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="farm-panel p-4 md:p-5">
                      <p className="farm-section-title mb-4">Basic Information</p>
                      <div className="space-y-2">
                        <Label htmlFor="name">Farm Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          placeholder="e.g., Shyam Ji ka Khet"
                          className="organic-input h-11"
                          required
                        />
                      </div>
                    </div>

                    <div className="farm-panel p-4 md:p-5">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <Label className="text-base">Your Farm Location *</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="organic-btn-outline farm-inline-action"
                          onClick={useCurrentLocation}
                          disabled={locating}
                        >
                          {locating ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <LocateFixed className="h-3.5 w-3.5" />
                          )}
                          {locating ? "Locating..." : "Use Current Location"}
                        </Button>
                      </div>

                      <div className="relative" ref={suggestionsRef}>
                        <div className="relative">
                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          {searching && (
                            <Loader2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                          )}
                          <Input
                            value={searchQuery}
                            onChange={(e) => handleAddressSearch(e.target.value)}
                            placeholder="Search address or village name..."
                            className="organic-input h-11 pl-9"
                          />
                        </div>
                        {showSuggestions && suggestions.length > 0 && (
                          <ul className="absolute z-9999 mt-1 w-full max-h-60 overflow-y-auto rounded-md border bg-background shadow-lg">
                            {suggestions.map((item) => (
                              <li
                                key={item.place_id}
                                className="cursor-pointer border-b px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground last:border-b-0"
                                onMouseDown={() => selectSuggestion(item)}
                              >
                                <span className="font-medium">
                                  {item.address?.village || item.address?.town || item.address?.city || item.address?.county || item.name}
                                </span>
                                <span className="block truncate text-xs text-muted-foreground">{item.display_name}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <p className="mt-3 text-xs text-muted-foreground">Or tap directly on the map to pin your location.</p>

                      <div className="farm-map-wrap mt-3" style={{ height: 320 }}>
                        <MapContainer
                          center={coordinates || [20.5937, 78.9629]}
                          zoom={5}
                          style={{ height: "100%", width: "100%" }}
                          scrollWheelZoom={true}
                        >
                          <TileLayer
                            attribution={tileAttribution}
                            url={tileUrl}
                            maxZoom={20}
                          />
                          <MapController coordinates={coordinates} />
                          <LocationMarker />
                        </MapContainer>
                      </div>
                      <Input
                        value={formData.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        placeholder="Latitude, Longitude"
                        className="organic-input mt-3 h-11"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col-reverse justify-end gap-3 border-t border-border/60 pt-5 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    className="organic-btn-outline farm-inline-action min-w-32"
                    onClick={() => navigate("/farms")}
                  >
                    Go Back
                  </Button>
                  <Button className="organic-btn-primary farm-inline-action min-w-32" type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Farm"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
