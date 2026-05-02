import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Search, Filter, Trash2, Edit2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import { useUser } from "@/context/UserContext";
import { getSpeciesIcon, speciesOptions } from "@/lib/animalIcons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

export default function Animals() {
  const { mongoUser } = useUser();
  const [animals, setAnimals] = useState([]);
  const [filteredAnimals, setFilteredAnimals] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecies, setSelectedSpecies] = useState("all");
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (mongoUser) {
      fetchAnimals();
    }
  }, [mongoUser]);

  useEffect(() => {
    filterAnimals();
  }, [searchQuery, selectedSpecies, animals]);

  const fetchAnimals = async () => {
    if (!mongoUser) return;
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/animals`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { farmerId: mongoUser._id }
        }
      );
      setAnimals(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error("Could not load your animals. Please try again.");
      setLoading(false);
    }
  };
  const filterAnimals = () => {
    let filtered = Array.isArray(animals) ? animals : [];

    if (searchQuery) {
      filtered = filtered.filter(
        (animal) =>
          animal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          animal.rfid.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedSpecies !== "all") {
      filtered = filtered.filter((animal) => animal.species === selectedSpecies);
    }

    setFilteredAnimals(filtered);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/animals/${deleteId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Animal removed!");
      setDeleteId(null);
      fetchAnimals();
    } catch (error) {
      toast.error("Could not remove this animal. Try again.");
      setDeleteId(null);
    }
  };


  const getAgeDisplay = (age, unit) => {
    return `${age} ${unit}`;
  };

  return (
    <Layout loading={loading}>
      <div className="organic-page">
        <div className="farm-shell space-y-6 p-4 md:p-6 lg:p-8">
        {/* Header */}
        <section className="farm-hero p-5 md:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="organic-title text-4xl md:text-5xl">My Animals</h1>
              <p className="organic-subtitle mt-2 max-w-2xl text-sm md:text-base">
              See and manage all your animals
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
             <Button className="organic-btn-outline farm-inline-action" variant="outline" onClick={() => navigate("/animals/dead")}>
               Lost Animals
             </Button>
             <Button className="organic-btn-primary farm-inline-action" onClick={() => navigate("/animals/create")} size="lg">
                <Plus className="h-4 w-4" />
                Add Animal
             </Button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="animal-kpi">
            <p className="animal-kpi-label">Total Animals</p>
            <p className="animal-kpi-value mt-2">{animals.length}</p>
          </div>
          <div className="animal-kpi">
            <p className="animal-kpi-label">Visible Records</p>
            <p className="animal-kpi-value mt-2">{filteredAnimals.length}</p>
          </div>
          <div className="animal-kpi">
            <p className="animal-kpi-label">Filter Mode</p>
            <p className="mt-2 text-lg font-semibold capitalize text-foreground">
              {selectedSpecies === "all" ? "All Types" : selectedSpecies}
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card className="farm-panel">
          <CardContent className="p-4 md:p-5">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or tag ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11 pl-10 organic-input"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto organic-btn-outline farm-inline-action">
                    <Filter className="mr-2 h-4 w-4" />
                    {selectedSpecies === "all" ? "All Types" : selectedSpecies}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSelectedSpecies("all")}>
                    All Types
                  </DropdownMenuItem>
                  {speciesOptions.map(({ value, label, Icon, color }) => (
                    <DropdownMenuItem key={value} onClick={() => setSelectedSpecies(value)}>
                      <Icon className="mr-2 h-4 w-4" style={{ color }} /> {label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        {/* Animals Grid */}
        {(!Array.isArray(filteredAnimals) || filteredAnimals.length === 0) ? (
          <Card className="farm-panel">
            <CardContent className="py-12">
              <div className="farm-empty-state flex flex-col items-center justify-center px-6 py-12">
              <div className="text-6xl mb-4 flex items-center justify-center">{getSpeciesIcon("other", "h-16 w-16 text-muted-foreground")}</div>
              <h3 className="text-lg font-semibold mb-2">No animals yet</h3>
              <p className="text-muted-foreground text-center mb-5">
                {searchQuery || selectedSpecies !== "all"
                  ? "Try different filters"
                  : "Add your first animal to get started"}
              </p>
              {!searchQuery && selectedSpecies === "all" && (
                <Button className="organic-btn-primary farm-inline-action" onClick={() => navigate("/animals/create")}>
                  <Plus className="h-4 w-4" />
                  Add Animal
                </Button>
              )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAnimals.map((animal) => (
              <Card key={animal._id} className="farm-panel farm-card-hover overflow-hidden">
                <CardContent className="p-5 md:p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 border-2 border-primary/20 shadow-sm">
                      <AvatarImage
                        src={animal.imageUrl}
                        alt={animal.name}
                        className="object-contain"
                      />
                      <AvatarFallback className="text-2xl flex items-center justify-center">
                        {getSpeciesIcon(animal.species, "h-8 w-8 text-muted-foreground")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg truncate">
                            {animal.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                          Tag ID: {animal.rfid}
                        </p>
                        </div>
                      </div>
                      <div className="mt-3 space-y-2 animal-surface p-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="capitalize">
                            {animal.species}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {animal.gender}
                          </Badge>
                          <Badge variant="outline">
                            {getAgeDisplay(animal.age, animal.ageUnit)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {animal.breed}
                        </p>
                        {animal.farmId && (
                          <div className="flex items-center gap-2 text-sm">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={animal.farmId.imageUrl} />
                              <AvatarFallback>🏡</AvatarFallback>
                            </Avatar>
                            <span className="text-muted-foreground truncate">
                              {animal.farmId.name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="farm-inline-action flex-1"
                      onClick={() => navigate(`/animals/${animal._id}`)}
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="farm-inline-action"
                      onClick={() => navigate(`/animals/${animal._id}/edit`)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="farm-inline-action"
                          onClick={() => setDeleteId(animal._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Do you want to remove this animal?
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