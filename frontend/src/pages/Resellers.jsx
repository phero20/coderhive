import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  FileText,
  TrendingUp,
  ShoppingCart,
  Clock,
  IndianRupee,
  ArrowLeft,
  Send,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/ui/use-toast";

const ResellerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projectType, setProjectType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [materialsOpen, setMaterialsOpen] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [user, setUser] = useState(null);
  const [address, setAddress] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) setUser(JSON.parse(stored));
    } catch {}
  }, []);

  const projectTypes = [
    { value: "house", label: "House Construction" },
    { value: "bridge", label: "Bridge" },
    { value: "road", label: "Road" },
  ];

  const materialsOptions = [
    "Cement",
    "Sand",
    "Steel TMT",
    "Bricks",
    "Aggregates",
    "Concrete",
  ];

  const mockMaterials = [
    {
      name: "Cement (50kg)",
      price: "₹385",
      trend: "up",
      change: "+2.3%",
      bestTime: "Now",
      manufacturer: "UltraTech",
    },
    {
      name: "Steel TMT (per ton)",
      price: "₹62,500",
      trend: "down",
      change: "-1.5%",
      bestTime: "Wait 3 days",
      manufacturer: "TATA Steel",
    },
    {
      name: "Sand (per ton)",
      price: "₹850",
      trend: "up",
      change: "+5.2%",
      bestTime: "Buy soon",
      manufacturer: "Local Quarry",
    },
    {
      name: "Bricks (1000 pcs)",
      price: "₹4,200",
      trend: "stable",
      change: "0%",
      bestTime: "Anytime",
      manufacturer: "RedBrick Co",
    },
  ];

  const [candidates, setCandidates] = useState([]);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerateQuotation = async () => {
    try {
      setLoading(true);
      setSummary("");
      setCandidates([]);
      const payload = {
        project_type: projectType || "",
        address: address || "",
        materials: selectedMaterials,
        quantity: quantity || "",
      };
      const res = await axios.post(
        "http://localhost:8012/v1/smart-quote/prepare-simple",
        payload
      );
      setSummary(res.data.summary || "");
      setCandidates(res.data.candidates || []);
      toast({
        title: "Quotation Generated",
        description: "Smart quotations are ready for review",
        variant: "success",
      });
    } catch (e) {
      toast({
        title: "Failed to generate",
        description: "Please ensure the backend is running on :8000",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/60 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/")}> 
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold text-foreground">
                Reseller Portal
              </h1>
            </div>
            <div className="text-sm text-muted-foreground"> 
              Welcome back, {user?.name || "Reseller"}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="quotation" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid">
            <TabsTrigger value="quotation" className="gap-2">
              <FileText className="h-4 w-4" />
              Smart Quotation
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              Live Marketplace
            </TabsTrigger>
          </TabsList>

          {/* Smart Quotation Tab */}
          <TabsContent value="quotation" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-card-foreground">
                Generate Smart Quotation
              </h2>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <Label htmlFor="project">Project Type</Label>
                  <Select value={projectType} onValueChange={setProjectType}>
                    <SelectTrigger id="project" className="mt-1">
                      <SelectValue placeholder="Select a project type" />
                    </SelectTrigger>
                    <SelectContent>
                      {projectTypes.map((pt) => (
                        <SelectItem key={pt.value} value={pt.value}>
                          {pt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="quantity">Estimated Quantity</Label>
                  <Input
                    id="quantity"
                    placeholder="e.g., 1000 sq ft, 500 meters"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    placeholder="Enter site address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-6">
                <Label>Materials</Label>
                <div className="relative mt-1">
                  <button
                    type="button"
                    className="flex h-10 w-full items-center justify-between rounded-md border border-border bg-white text-foreground px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    onClick={() => setMaterialsOpen((o) => !o)}
                  >
                    <div className="flex flex-wrap gap-2 text-left">
                      {selectedMaterials.length === 0 ? (
                        <span className="text-muted-foreground">Select materials</span>
                      ) : (
                        selectedMaterials.map((m) => (
                          <span
                            key={m}
                            className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                          >
                            {m}
                            <span
                              className="cursor-pointer opacity-70 hover:opacity-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedMaterials((prev) => prev.filter((x) => x !== m));
                              }}
                            >
                              ×
                            </span>
                          </span>
                        ))
                      )}
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </button>
                  {materialsOpen && (
                    <>
                      {/* Backdrop to close on outside click */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setMaterialsOpen(false)}
                      />
                      <div className="absolute z-50 mt-2 w-full rounded-md border border-border bg-white text-foreground p-2 shadow-lg">
                        <div className="max-h-56 overflow-auto space-y-1">
                          {materialsOptions.map((opt) => {
                            const checked = selectedMaterials.includes(opt);
                            return (
                              <label
                                key={opt}
                                className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                              >
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 accent-primary"
                                  checked={checked}
                                  onChange={(e) => {
                                    setSelectedMaterials((prev) =>
                                      e.target.checked
                                        ? Array.from(new Set([...prev, opt]))
                                        : prev.filter((x) => x !== opt)
                                    );
                                  }}
                                />
                                <span>{opt}</span>
                              </label>
                            );
                          })}
                        </div>
                        <div className="mt-2 flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setMaterialsOpen(false)}>
                            Close
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <Button
                onClick={handleGenerateQuotation}
                className="w-full md:w-auto"
                disabled={loading}
              >
                <Send className="mr-2 h-4 w-4" />
                {loading ? "Generating..." : "Generate AI Quotation"}
              </Button>
            </Card>

            {/* Quotations Results */}
            <div className="grid gap-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Available Quotations
                </h3>
                {summary ? (
                  <Badge>AI Verified</Badge>
                ) : (
                  <Badge variant="secondary"></Badge>
                )}
              </div>
              {summary && !summary.startsWith("SmartQuotation (fallback)") && (
                <Card className="p-4">
                  <pre className="whitespace-pre-wrap text-sm text-muted-foreground">{summary}</pre>
                </Card>
              )}
              {candidates.map((c, index) => (
                <Card
                  key={index}
                  className="p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-card-foreground">
                        {c.vendor_name}
                      </h4>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <IndianRupee className="h-4 w-4" />
                          {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(c.landed_cost)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {`${Math.max(1, Math.floor((c.eta_minutes || 0) / (60 * 24)))} days`}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Distance: {c.distance_km} km
                      </p>
                    </div>
                    <Button variant={index === 0 ? "default" : "outline"}>
                      {index === 0 ? "Best Deal" : "Select"}
                    </Button>
                  </div>
                </Card>
              ))}
              {!loading && candidates.length === 0 && (
                <Card className="p-4">
                  <div className="text-sm text-muted-foreground">Click "Generate AI Quotation" to fetch live quotations.</div>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Live Marketplace Tab */}
          <TabsContent value="marketplace" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-card-foreground">
                Live Material Prices
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Real-time prices with AI-powered buy/sell signals
              </p>

              <div className="space-y-4">
                {mockMaterials.map((material, index) => (
                  <Card
                    key={index}
                    className="p-4 border-l-4"
                    style={{
                      borderLeftColor:
                        material.trend === "up"
                          ? "hsl(var(--success))"
                          : material.trend === "down"
                          ? "hsl(var(--destructive))"
                          : "hsl(var(--muted))",
                    }}
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-card-foreground">
                          {material.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Supplier: {material.manufacturer}
                        </p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div>
                          <div className="text-2xl font-bold text-card-foreground">
                            {material.price}
                          </div>
                          <div
                            className={`text-sm flex items-center gap-1 ${
                              material.trend === "up"
                                ? "text-success"
                                : material.trend === "down"
                                ? "text-destructive"
                                : "text-muted-foreground"
                            }`}
                          >
                            <TrendingUp className="h-4 w-4" />
                            {material.change}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">
                            Best time to buy
                          </div>
                          <div className="font-semibold text-card-foreground">
                            {material.bestTime}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ResellerDashboard;
