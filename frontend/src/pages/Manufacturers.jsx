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
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getStoredUser } from "@/lib/auth";

const ManufacturerDashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [manufacturerId, setManufacturerId] = useState(null);
  const [pendingEnquiriesCount, setPendingEnquiriesCount] = useState(0);
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);
  const [revenueMonth, setRevenueMonth] = useState("₹0");
  const [totalClients, setTotalClients] = useState(0);

  const [enquiries, setEnquiries] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [topClients, setTopClients] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      // ProtectedRoute already verified authentication and role
      const currentUser = getStoredUser();
      if (!currentUser) {
        console.error('[Manufacturers] No user found after ProtectedRoute check');
        setLoading(false);
        return;
      }
      
      console.log('[Manufacturers] User authenticated:', currentUser.email, 'Role:', currentUser.role);
      setUser(currentUser);
      
      console.log('[Manufacturers] Loading manufacturer data for user:', currentUser.email);
      await fetchAll(currentUser);
      setLoading(false);
    };

    const fetchAll = async (currentUser) => {
      try {
        console.log('[Manufacturers] Fetching manufacturer for user ID:', currentUser.id);
        
        // 1) Find manufacturer owned by current user
        const { data: manuList, error: manuErr } = await supabase
          .from("manufacturers")
          .select("id, total_clients")
          .eq("owner_user_id", currentUser.id);
        
        if (manuErr) {
          console.error('[Manufacturers] Error fetching manufacturer:', manuErr);
          // Continue anyway - show empty dashboard
          return;
        }
        
        console.log('[Manufacturers] Found manufacturers:', manuList?.length || 0);
        
        const manuId = manuList?.[0]?.id || null;
        if (!manuId) {
          console.warn('[Manufacturers] No manufacturer found, creating default...');
          // Create a default manufacturer for this user if none exists
          const { data: newManu, error: createErr } = await supabase
            .from("manufacturers")
            .insert([{
              name: `${currentUser.name}'s Manufacturing Co`,
              email: currentUser.email,
              phone: '+91-XXX-XXX-XXXX',
              address: 'India',
              website: '',
              product_combination: 'General Manufacturing',
              price_combination: 'Competitive pricing',
              revenue: 0,
              total_clients: 0,
              owner_user_id: currentUser.id
            }])
            .select()
            .single();
            
          if (createErr) {
            console.error('[Manufacturers] Error creating manufacturer:', createErr);
            // Show empty dashboard anyway
            return;
          }
          
          console.log('[Manufacturers] Created new manufacturer:', newManu.id);
          setManufacturerId(newManu.id);
          setTotalClients(0);
          return; // No existing data to fetch
        }
        
        console.log('[Manufacturers] Using manufacturer ID:', manuId);
        setManufacturerId(manuId);
        setTotalClients(manuList[0]?.total_clients || 0);

        // 2) Revenue (latest month)
        const { data: revRows, error: revErr } = await supabase
          .from("manufacturer_revenue_by_month")
          .select("month, amount")
          .eq("manufacturer_id", manuId)
          .order("month", { ascending: false })
          .limit(1);
        
        if (revErr) {
          console.error('[Manufacturers] Error fetching revenue:', revErr);
        }
        
        const amount = revRows?.[0]?.amount || 0;
        setRevenueMonth(new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount));

      // 3) Pending enquiries count and list
      const { data: enqCountRows } = await supabase
        .from("manufacturer_enquiries")
        .select("id", { count: "exact", head: true })
        .eq("manufacturer_id", manuId)
        .eq("status", "pending");
      setPendingEnquiriesCount(enqCountRows?.length ?? 0); // head:true returns no rows; fallback below
      const { count: enqCount } = await supabase
        .from("manufacturer_enquiries")
        .select("*, id", { count: "exact" })
        .eq("manufacturer_id", manuId)
        .eq("status", "pending")
        .limit(1);
      if (typeof enqCount === "number") setPendingEnquiriesCount(enqCount);

      const { data: enqList } = await supabase
        .from("manufacturer_enquiries")
        .select("id, customer_name, subject, message, status, created_at")
        .eq("manufacturer_id", manuId)
        .order("created_at", { ascending: false })
        .limit(10);
      setEnquiries(
        (enqList || []).map((e) => ({
          id: e.id,
          reseller: e.customer_name || "Customer",
          project: e.subject || "—",
          materials: e.message?.slice(0, 80) || "—",
          quantity: "—",
          status: e.status,
          date: new Date(e.created_at).toLocaleString(),
        }))
      );

      // 4) Active orders count
      const activeStatuses = ["pending", "confirmed", "shipped"];
      const { count: ordCount } = await supabase
        .from("manufacturer_orders")
        .select("id", { count: "exact" })
        .eq("manufacturer_id", manuId)
        .in("status", activeStatuses);
      setActiveOrdersCount(ordCount || 0);

      // 5) Inventory list
      const { data: inv } = await supabase
        .from("manufacturer_inventory")
        .select("product_name, quantity, location")
        .eq("manufacturer_id", manuId)
        .order("product_name", { ascending: true })
        .limit(20);
      setInventory(
        (inv || []).map((x) => ({
          product: x.product_name || "—",
          stock: x.quantity || 0,
          demand: "—",
          recommendation: "",
          action: "monitor",
        }))
      );

      // 6) Top customers
      const { data: tops } = await supabase
        .from("manufacturer_top_customers")
        .select("customer_name, total_orders, total_revenue")
        .eq("manufacturer_id", manuId)
        .order("total_revenue", { ascending: false })
        .limit(10);
      setTopClients(
        (tops || []).map((t) => ({
          name: t.customer_name,
          orders: t.total_orders,
          revenue: new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 1 }).format(t.total_revenue || 0),
          priority: (t.total_revenue || 0) > 1000000 ? "high" : "medium",
        }))
      );
      } catch (error) {
        console.error('[Manufacturers] Unexpected error in fetchAll:', error);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading manufacturer dashboard...</p>
        </div>
      </div>
    );
  }

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
            <div className="text-sm text-muted-foreground"> 
              Welcome back, {user?.name || "Manufacturer"}
            </div>
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
                <p className="text-3xl font-bold text-card-foreground">{pendingEnquiriesCount}</p>
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Orders</p>
                <p className="text-3xl font-bold text-card-foreground">{activeOrdersCount}</p>
              </div>
              <Package className="h-8 w-8 text-success" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue (Month)</p>
                <p className="text-3xl font-bold text-card-foreground">{revenueMonth}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-accent" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Clients</p>
                <p className="text-3xl font-bold text-card-foreground">{totalClients}</p>
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
            {enquiries.map((enquiry) => (
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
            
            {inventory.map((item, index) => (
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
            
            {topClients.map((client, index) => (
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
