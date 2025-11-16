import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CheckCircle2, 
  Clock, 
  Users, 
  FileText,
  ArrowRight,
  Bell,
  Shield
} from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Complaint } from "@/lib/types";

export default function Landing() {
  const [stats, setStats] = useState({
    totalComplaints: 0,
    resolvedComplaints: 0,
    activeUsers: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/complaint");
  const complaints: Complaint[] = response.data || [];
        setStats({
          totalComplaints: complaints.length,
          resolvedComplaints: complaints.filter((c) => c.status === "RESOLVED").length,
          activeUsers: 0, // Would need separate endpoint
        });
      } catch (error) {
        // Stats not available
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-background" />
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Your Voice Matters
            </h1>
            <p className="mb-8 text-xl text-muted-foreground">
              Streamline hostel complaint management with real-time tracking, instant notifications, 
              and efficient resolution workflows.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/complaints">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Browse Complaints
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">{stats.totalComplaints}</div>
              <div className="text-muted-foreground">Total Complaints</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-success mb-2">{stats.resolvedComplaints}</div>
              <div className="text-muted-foreground">Resolved</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-accent mb-2">5</div>
              <div className="text-muted-foreground">Service Domains</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A comprehensive solution for managing hostel complaints efficiently
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <FileText className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Easy Filing</CardTitle>
                <CardDescription>
                  Submit complaints quickly with optional anonymity and file attachments
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <Clock className="h-12 w-12 text-accent mb-4" />
                <CardTitle>Real-time Tracking</CardTitle>
                <CardDescription>
                  Monitor complaint status from creation to resolution with live updates
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <Bell className="h-12 w-12 text-warning mb-4" />
                <CardTitle>Instant Notifications</CardTitle>
                <CardDescription>
                  Stay informed with domain-specific alerts and announcements
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-success mb-4" />
                <CardTitle>Role-based Access</CardTitle>
                <CardDescription>
                  Streamlined workflows for students, staff, and administrators
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <CheckCircle2 className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Efficient Resolution</CardTitle>
                <CardDescription>
                  Organized kanban boards and status workflows for quick action
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="h-12 w-12 text-accent mb-4" />
                <CardTitle>Secure & Private</CardTitle>
                <CardDescription>
                  Anonymous complaint option and role-based data access control
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-accent/5 to-background">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join our community and experience hassle-free complaint management
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/complaints">
                <Button size="lg" variant="secondary">
                  View Complaints
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="lg">
                  Create Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
