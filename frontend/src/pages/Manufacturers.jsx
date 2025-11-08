import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  TrendingUp, 
  Users, 
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ManufacturerDashboard = () => {
  const navigate = useNavigate();

  const mockEnquiries = [
    { 
      id: "ENQ001",
      reseller: "BuildPro Construction", 
      project: "Residential Complex",
      materials: "Cement, Steel, Bricks",
      quantity: "Large scale",
      status: "pending",
      date: "2 hours ago"
    },
    { 
      id: "ENQ002",
      reseller: "Metro Builders", 
      project: "Bridge Construction",
      materials: "Cement, Sand",
      quantity: "Medium scale",
      status: "pending",
      date: "5 hours ago"
    },
    { 
      id: "ENQ003",
      reseller: "Urban Developers", 
      project: "Road Construction",
      materials: "Sand, Aggregates",
      quantity: "Large scale",
      status: "accepted",
      date: "1 day ago"
    }
  ];

  const mockInventory = [
    { 
      product: "Cement (50kg bags)", 
      stock: 12500,
      demand: "high",
      recommendation: "Increase price by 3-5%",
      action: "restock"
    },
    { 
      product: "Steel Bars (TMT)", 
      stock: 3200,
      demand: "medium",
      recommendation: "Maintain current price",
      action: "monitor"
    },
    { 
      product: "Construction Sand", 
      stock: 8900,
      demand: "low",
      recommendation: "Reduce price by 5-8%",
      action: "clearance"
    }
  ];

  const mockClients = [
    { name: "BuildPro Construction", orders: 45, revenue: "₹45.2L", priority: "high" },
    { name: "Metro Builders", orders: 38, revenue: "₹38.5L", priority: "high" },
    { name: "Urban Developers", orders: 29, revenue: "₹29.8L", priority: "medium" },
    { name: "Skyline Projects", orders: 22, revenue: "₹22.1L", priority: "medium" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold text-foreground">Manufacturer Portal</h1>
            </div>
            <div className="text-sm text-muted-foreground">Welcome back, Manufacturer</div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Enquiries</p>
                <p className="text-3xl font-bold text-card-foreground">12</p>
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Orders</p>
                <p className="text-3xl font-bold text-card-foreground">28</p>
              </div>
              <Package className="h-8 w-8 text-success" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue (Month)</p>
                <p className="text-3xl font-bold text-card-foreground">₹125L</p>
              </div>
              <TrendingUp className="h-8 w-8 text-accent" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Clients</p>
                <p className="text-3xl font-bold text-card-foreground">156</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </Card>
        </div>

        <Tabs defaultValue="enquiries" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="enquiries">Enquiries</TabsTrigger>
            <TabsTrigger value="inventory">Inventory AI</TabsTrigger>
            <TabsTrigger value="clients">Top Clients</TabsTrigger>
          </TabsList>

          {/* Enquiries Tab */}
          <TabsContent value="enquiries" className="space-y-4">
            {mockEnquiries.map((enquiry) => (
              <Card key={enquiry.id} className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-card-foreground">{enquiry.reseller}</h4>
                      <Badge variant={enquiry.status === "pending" ? "secondary" : "default"}>
                        {enquiry.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Project: {enquiry.project}</p>
                    <p className="text-sm text-muted-foreground">Materials: {enquiry.materials}</p>
                    <p className="text-sm text-muted-foreground">Scale: {enquiry.quantity}</p>
                    <p className="text-xs text-muted-foreground mt-2">{enquiry.date}</p>
                  </div>
                  {enquiry.status === "pending" && (
                    <div className="flex gap-2">
                      <Button variant="outline">View Details</Button>
                      <Button>Accept</Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </TabsContent>

          {/* Inventory Optimization Tab */}
          <TabsContent value="inventory" className="space-y-4">
            <Card className="p-6 bg-primary/5 border-primary/20">
              <h3 className="text-lg font-semibold text-card-foreground mb-2">AI Inventory Insights</h3>
              <p className="text-sm text-muted-foreground">
                Smart recommendations based on demand analysis and market trends
              </p>
            </Card>
            
            {mockInventory.map((item, index) => (
              <Card key={index} className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-card-foreground">{item.product}</h4>
                    <p className="text-sm text-muted-foreground mt-1">Current Stock: {item.stock} units</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={
                        item.demand === "high" ? "default" : 
                        item.demand === "medium" ? "secondary" : 
                        "outline"
                      }>
                        {item.demand} demand
                      </Badge>
                      {item.action === "restock" && (
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      )}
                      {item.action === "monitor" && (
                        <CheckCircle className="h-4 w-4 text-success" />
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-card-foreground">{item.recommendation}</p>
                    <Button size="sm" className="mt-2">
                      {item.action === "restock" ? "Restock Now" : 
                       item.action === "clearance" ? "Start Clearance" : 
                       "Monitor"}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          {/* Top Clients Tab */}
          <TabsContent value="clients" className="space-y-4">
            <Card className="p-6 bg-success/5 border-success/20">
              <h3 className="text-lg font-semibold text-card-foreground mb-2">Priority Client Intelligence</h3>
              <p className="text-sm text-muted-foreground">
                High-value clients for strategic partnerships and proactive outreach
              </p>
            </Card>
            
            {mockClients.map((client, index) => (
              <Card key={index} className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-card-foreground">{client.name}</h4>
                      <Badge variant={client.priority === "high" ? "default" : "secondary"}>
                        {client.priority} priority
                      </Badge>
                    </div>
                    <div className="flex gap-6 text-sm text-muted-foreground">
                      <span>{client.orders} orders</span>
                      <span>Total: {client.revenue}</span>
                    </div>
                  </div>
                  <Button variant="outline">Contact Client</Button>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ManufacturerDashboard;
