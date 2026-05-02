import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Trash2, Edit2, Eye, MapPin, Image as ImageIcon, Sparkles, Camera, Trees } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export default function Farms() {
  const [farms, setFarms] = useState([]);
  const [filteredFarms, setFilteredFarms] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();

  const totalFarms = Array.isArray(farms) ? farms.length : 0;
  const photoReadyFarms = Array.isArray(farms) ? farms.filter((farm) => !!farm.imageUrl).length : 0;

  useEffect(() => {
    fetchFarms();
  }, []);

  useEffect(() => {
    filterFarms();
  }, [searchQuery, farms]);

  const fetchFarms = async () => {
    try {
      const token = localStorage.getItem("token");
      const mongoUser = localStorage.getItem("mongoUser");
      let farmerId = "";
      if (mongoUser) {
        try {
          farmerId = JSON.parse(mongoUser)._id;
        } catch (e) {
          farmerId = "";
        }
      }
      const url = `${import.meta.env.VITE_API_BASE_URL}/api/farms?farmerId=${farmerId}`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFarms(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to fetch farms");
      setLoading(false);
    }
  };

  const filterFarms = () => {
    let filtered = Array.isArray(farms) ? farms : [];

    if (searchQuery) {
      filtered = filtered.filter((farm) =>
        farm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        farm.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredFarms(filtered);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/farms/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Farm removed successfully!");
      setDeleteId(null);
      fetchFarms();
    } catch (error) {
      toast.error("Could not remove this farm. Try again.");
      setDeleteId(null);
    }
  };

  return (
    <Layout loading={loading}>
      <div className="organic-page">
        <div className="farm-shell space-y-6 p-4 md:p-6 lg:p-8">
          <section className="farm-hero p-5 md:p-7">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="organic-title text-4xl md:text-5xl">My Farms</h1>
                <p className="organic-subtitle mt-2 max-w-2xl text-sm md:text-base">
                  View and manage all farm records from one clean workspace.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="farm-soft-chip">
                  <Trees className="h-3.5 w-3.5" />
                  {totalFarms} total farms
                </span>
                <span className="farm-soft-chip">
                  <Camera className="h-3.5 w-3.5" />
                  {photoReadyFarms} with photos
                </span>
                <span className="farm-soft-chip">
                  <Sparkles className="h-3.5 w-3.5" />
                  Quick actions
                </span>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="farm-panel p-4">
              <p className="farm-section-title">Total Farms</p>
              <p className="organic-title mt-2 text-4xl not-italic">{totalFarms}</p>
              <p className="text-xs text-muted-foreground mt-1">All registered farm units</p>
            </Card>
            <Card className="farm-panel p-4">
              <p className="farm-section-title">Photo Coverage</p>
              <p className="organic-title mt-2 text-4xl not-italic">{photoReadyFarms}</p>
              <p className="text-xs text-muted-foreground mt-1">Profiles ready with visual identity</p>
            </Card>
            <Card className="farm-panel p-4">
              <p className="farm-section-title">Search Results</p>
              <p className="organic-title mt-2 text-4xl not-italic">{filteredFarms.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Matching your current filter</p>
            </Card>
          </div>

          <Card className="farm-panel">
            <CardContent className="p-4 md:p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by farm name or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="organic-input h-11 pl-10"
                  />
                </div>
                <Button className="organic-btn-primary farm-inline-action min-w-36" onClick={() => navigate("/farms/create")} size="lg">
                  <Plus className="h-4 w-4" />
                  Add a Farm
                </Button>
              </div>
            </CardContent>
          </Card>

          {(!Array.isArray(filteredFarms) || filteredFarms.length === 0) ? (
            <Card className="farm-panel">
              <CardContent className="py-12">
                <div className="farm-empty-state flex flex-col items-center justify-center px-6 py-12 text-center">
                  <MapPin className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No farms found</h3>
                  <p className="text-muted-foreground mb-5 max-w-md">
                    {searchQuery
                      ? "No records match this search. Try a different keyword."
                      : "Start by adding your first farm to build your management dashboard."}
                  </p>
                  {!searchQuery && (
                    <Button className="organic-btn-primary farm-inline-action" onClick={() => navigate("/farms/create")}>
                      <Plus className="h-4 w-4" />
                      Add a Farm
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredFarms.map((farm) => (
                <Card key={farm._id} className="farm-panel farm-card-hover overflow-hidden">
                  <div className="relative h-52 bg-muted">
                    {farm.imageUrl ? (
                      <img
                        src={farm.imageUrl}
                        alt={farm.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/35 to-transparent p-3">
                      <h3 className="truncate text-base font-semibold text-white">{farm.name}</h3>
                    </div>
                  </div>
                  <CardContent className="space-y-4 p-5">
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                      <span className="line-clamp-2">{farm.location}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="farm-inline-action"
                        onClick={() => navigate(`/farms/${farm._id}`)}
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="farm-inline-action"
                        onClick={() => navigate(`/farms/${farm._id}/edit`)}
                      >
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="farm-inline-action"
                            onClick={() => setDeleteId(farm._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Do you want to remove this farm?
                            </AlertDialogTitle>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setDeleteId(null)}>
                              Go Back
                            </AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete}>
                              Yes, Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          </div>
      </div>
    </Layout>
  );
}