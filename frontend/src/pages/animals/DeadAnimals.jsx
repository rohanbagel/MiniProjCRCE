import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import { useUser } from "@/context/UserContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getSpeciesIcon } from "@/lib/animalIcons";
import { Input } from "@/components/ui/input";

export default function DeadAnimals() {
  const { mongoUser } = useUser();
  const [deadAnimals, setDeadAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (mongoUser) {
      fetchDeadAnimals();
    }
  }, [mongoUser]);

  const fetchDeadAnimals = async () => {
    if (!mongoUser) return;
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/animals/dead`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { farmerId: mongoUser._id }
        }
      );
      setDeadAnimals(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch records");
      setLoading(false);
    }
  };

  const filteredAnimals = deadAnimals.filter(animal => 
    animal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    animal.rfid.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout loading={loading}>
      <div className="organic-page">
        <div className="farm-shell space-y-6 p-4 md:p-6 lg:p-8">
        <section className="farm-hero p-5 md:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="text-right sm:text-left">
             <h1 className="organic-title text-4xl md:text-5xl not-italic">Memorial Records</h1>
             <p className="organic-subtitle mt-2">A respectful archive of animals that have passed.</p>
          </div>
            <Button variant="outline" className="organic-btn-outline farm-inline-action" onClick={() => navigate("/animals")}>Back to Animals</Button>
          </div>
        </section>

        <Card className="farm-panel overflow-hidden">
            <CardContent className="p-4 md:p-6">
                <div className="relative max-w-sm mb-6">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or RFID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="organic-input h-11 pl-10"
                    />
                </div>

                <div className="farm-empty-state overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-25">Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Age at Passing</TableHead>
                      <TableHead>Date of Passing</TableHead>
                      <TableHead>Cause</TableHead>
                      <TableHead className="text-right">Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAnimals.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                           No memorial records found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAnimals.map((animal) => (
                        <TableRow key={animal._id}>
                          <TableCell>
                            <Avatar className="h-10 w-10 border border-border/60">
                              <AvatarImage src={animal.imageUrl} alt={animal.name} />
                              <AvatarFallback>{getSpeciesIcon(animal.species, "h-4 w-4")}</AvatarFallback>
                            </Avatar>
                          </TableCell>
                          <TableCell className="font-medium">
                            <div>{animal.name}</div>
                            <div className="text-xs text-muted-foreground">{animal.rfid}</div>
                          </TableCell>
                          <TableCell>
                            {animal.ageAtDeath} {animal.ageUnit}
                          </TableCell>
                          <TableCell>
                            {new Date(animal.deathDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{animal.causeOfDeath || "Unknown"}</TableCell>
                          <TableCell className="text-right max-w-50 truncate">
                            {animal.notes || "-"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                </div>
            </CardContent>
        </Card>
        </div>
      </div>
    </Layout>
  );
}
