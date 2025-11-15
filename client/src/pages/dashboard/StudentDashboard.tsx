import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { DOMAIN_LABELS, STATUS_LABELS, STATUS_COLORS } from "@/lib/constants";
import type { User, Complaint } from "@/lib/types";
import { 
  Plus, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp 
} from "lucide-react";
import { format } from "date-fns";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, complaintsRes] = await Promise.all([
          api.get("/user/profile"),
          api.get("/complaint/me"),
        ]);

        if (profileRes.data.role !== "STUDENT") {
          const rolePath = profileRes.data.role.toLowerCase();
          navigate(`/dashboard/${rolePath}`);
          return;
        }

        setUser(profileRes.data);
        setComplaints(complaintsRes.data);
      } catch (error: any) {
        toast.error("Please login to access dashboard");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Calculate statistics
  const totalComplaints = complaints.length;
  const resolvedCount = complaints.filter(c => c.status === "RESOLVED").length;
  const inProgressCount = complaints.filter(c => 
    ["REVIEWED", "ASSIGNED", "WORK_IN_PROGRESS"].includes(c.status)
  ).length;
  const pendingCount = complaints.filter(c => c.status === "CREATED").length;

  // Recent complaints (last 5)
  const recentComplaints = [...complaints]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>
          <p className="text-muted-foreground">
            Track and manage your hostel complaints
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <Link to="/complaint/create">
            <Button size="lg" className="w-full sm:w-auto">
              <Plus className="h-5 w-5 mr-2" />
              Submit New Complaint
            </Button>
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalComplaints}</div>
              <p className="text-xs text-muted-foreground mt-1">
                All time submissions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Awaiting review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inProgressCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Being addressed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resolvedCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Successfully closed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Complaints */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Complaints</CardTitle>
                <CardDescription>Your latest complaint submissions</CardDescription>
              </div>
              <Link to="/complaints">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentComplaints.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No complaints yet</p>
                <Link to="/complaint/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Submit Your First Complaint
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentComplaints.map((complaint) => (
                  <Link
                    key={complaint.id}
                    to={`/complaint/${complaint.id}`}
                    className="block"
                  >
                    <div className="flex items-start justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium truncate">{complaint.subject}</h3>
                          <Badge variant="outline" className="shrink-0">
                            {DOMAIN_LABELS[complaint.domain]}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                          {complaint.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {format(new Date(complaint.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`ml-4 shrink-0 bg-${STATUS_COLORS[complaint.status]}/10 text-${STATUS_COLORS[complaint.status]} border-${STATUS_COLORS[complaint.status]}/20`}
                      >
                        {STATUS_LABELS[complaint.status]}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
