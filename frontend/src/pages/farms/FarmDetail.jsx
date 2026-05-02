import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit2, MapPin, Image as ImageIcon, Beef, Camera, Radar, Sparkles } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Circle } from "react-leaflet";
import L from "leaflet";
import { useTheme } from "@/context/ThemeContext";
import { getMapTile } from "@/lib/mapTiles";

export default function FarmDetail() {
  const { theme } = useTheme();
  const { url: tileUrl, attribution: tileAttribution } = getMapTile(theme);
  const [farm, setFarm] = useState(null);
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();

  const markerIcon = new L.Icon({
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    shadowSize: [41, 41],
  });

  useEffect(() => {
    fetchFarmDetails();
  }, [id]);

  const fetchFarmDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const [farmResponse, animalsResponse] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/farms/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/animals?farmId=${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setFarm(farmResponse.data);
      setAnimals(Array.isArray(animalsResponse.data) ? animalsResponse.data : []);
      setLoading(false);
    } catch (error) {
      toast.error("Could not load farm details. Please try again.");
      setLoading(false);
    }
  };

  const parseCoordinates = (location) => {
    const match = location.match(/^([-+]?\d{1,2}\.\d+),\s*([-+]?\d{1,3}\.\d+)$/);
    if (match) {
      return [parseFloat(match[1]), parseFloat(match[2])];
    }
    return null;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!farm) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <MapPin className="h-12 w-12 mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Farm not found</h2>
          <Button onClick={() => navigate("/farms")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Farms
          </Button>
        </div>
      </Layout>
    );
  }

  const coordinates = parseCoordinates(farm.location);
  const hasHerdWatch = !!farm.herdWatchRadius;

  return (
    <Layout>
      <div className="organic-page">
        <div className="farm-shell space-y-6 p-4 md:p-6 lg:p-8">
          <section className="farm-hero p-5 md:p-7">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="organic-title text-4xl md:text-5xl">{farm.name}</h1>
                <p className="organic-subtitle mt-2 max-w-2xl text-sm md:text-base">
                  Farm profile, map coverage, and resident animal records.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="farm-soft-chip">
                  <Beef className="h-3.5 w-3.5" />
                  {animals.length} animals
                </span>
                <span className="farm-soft-chip">
                  <Radar className="h-3.5 w-3.5" />
                  {hasHerdWatch ? `Radius ${farm.herdWatchRadius}m` : "Radius not set"}
                </span>
                <span className="farm-soft-chip">
                  <Sparkles className="h-3.5 w-3.5" />
                  Profile view
                </span>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button className="organic-btn-primary farm-inline-action" onClick={() => navigate(`/farms/${id}/edit`)}>
                <Edit2 className="h-4 w-4" />
                Update Farm
              </Button>
              <Button variant="outline" className="organic-btn-outline farm-inline-action" onClick={() => navigate("/farms")}>
                <ArrowLeft className="h-4 w-4" />
                Back to Farms
              </Button>
            </div>
          </section>

          <Card className="farm-panel overflow-hidden">
            <CardContent className="p-0">
              <div className="relative h-72 bg-muted md:h-80">
                {farm.imageUrl ? (
                  <img
                    src={farm.imageUrl}
                    alt={farm.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ImageIcon className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/45 via-black/20 to-transparent p-5 text-white">
                  <h2 className="text-2xl font-semibold">{farm.name}</h2>
                  <div className="mt-2 flex items-start gap-2 text-sm text-white/90">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                    <span className="line-clamp-2">{farm.location}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 border-t border-border/60 p-5 md:grid-cols-3">
                <div className="farm-empty-state p-4">
                  <p className="farm-section-title">Farm Image</p>
                  <p className="mt-2 flex items-center gap-2 font-medium text-foreground">
                    <Camera className="h-4 w-4 text-muted-foreground" />
                    {farm.imageUrl ? "Uploaded" : "Not uploaded"}
                  </p>
                </div>
                <div className="farm-empty-state p-4">
                  <p className="farm-section-title">Animals Registered</p>
                  <p className="organic-title mt-2 text-3xl not-italic">{animals.length}</p>
                </div>
                <div className="farm-empty-state p-4">
                  <p className="farm-section-title">Herd Watch Radius</p>
                  <p className="mt-2 font-medium text-foreground">
                    {hasHerdWatch ? `${farm.herdWatchRadius} meters` : "Not configured"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {coordinates && (
            <Card className="farm-panel">
              <CardHeader className="pb-3">
                <CardTitle>Farm on Map</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="farm-map-wrap" style={{ height: 400 }}>
                  <MapContainer
                    center={coordinates}
                    zoom={15}
                    style={{ height: "100%", width: "100%" }}
                    scrollWheelZoom={false}
                  >
                    <TileLayer
                      attribution={tileAttribution}
                      url={tileUrl}
                      maxZoom={20}
                    />
                    <Marker position={coordinates} icon={markerIcon} />
                    {farm.herdWatchRadius && (
                      <Circle
                        center={coordinates}
                        radius={farm.herdWatchRadius}
                        pathOptions={{
                          color: "hsl(142, 76%, 36%)",
                          fillColor: "hsl(142, 76%, 36%)",
                          fillOpacity: 0.12,
                          weight: 2,
                          dashArray: "6 4",
                        }}
                      />
                    )}
                  </MapContainer>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="farm-panel">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Animals at This Farm</CardTitle>
              <Button
                variant="outline"
                className="organic-btn-outline farm-inline-action"
                size="sm"
                onClick={() => navigate("/animals/create")}
              >
                <Beef className="h-4 w-4" />
                Add Animal Here
              </Button>
            </CardHeader>
            <CardContent>
              {animals.length === 0 ? (
                <div className="farm-empty-state py-12 text-center">
                  <Beef className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">No animals at this farm yet. Add one!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {animals.map((animal) => (
                    <div
                      key={animal._id}
                      className="farm-panel farm-focus flex cursor-pointer items-center justify-between p-4"
                      onClick={() => navigate(`/animals/${animal._id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Beef className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{animal.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {animal.species} • {animal.breed}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {animal.gender}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          </div>
      </div>
    </Layout>
  );
}