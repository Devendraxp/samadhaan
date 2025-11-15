import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import type { Complaint, ComplaintStatus, Domain, Notification, NotificationType, User } from "@/lib/types";
import { DOMAIN_LABELS, STATUS_COLORS, STATUS_LABELS } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Bell,
  BellPlus,
  Eye,
  Loader2,
  RefreshCcw,
  Trash2,
} from "lucide-react";

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null) {
    const apiError = error as ApiError;
    if (apiError.response?.data?.message) {
      return apiError.response.data.message;
    }
  }
  return fallback;
};

const STAFF_STATUS_FLOW: ComplaintStatus[] = [
  "CREATED",
  "REVIEWED",
  "ASSIGNED",
  "WORK_IN_PROGRESS",
  "RESOLVED",
];

interface StaffDashboardProps {
  domain: Domain;
}

const StaffDashboard = ({ domain }: StaffDashboardProps) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("complaints");
  const [refreshing, setRefreshing] = useState(false);

  const domainLabel = DOMAIN_LABELS[domain];

  const loadComplaints = useCallback(async () => {
    try {
      const response = await api.get<Complaint[]>("/complaint");
      setComplaints(response.data.filter((complaint) => complaint.domain === domain));
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load complaints"));
    }
  }, [domain]);

  const loadNotifications = useCallback(async () => {
    try {
      const response = await api.get<Notification[]>(`/notification/domain/${domain}`);
      setNotifications(response.data);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load notifications"));
    }
  }, [domain]);

  const bootstrap = useCallback(async () => {
    setLoading(true);
    try {
      const profileResponse = await api.get<User>("/user/profile");
      const profile = profileResponse.data;

      if (profile.role !== domain) {
        toast.error("You don't have access to this dashboard");
        navigate(`/dashboard/${profile.role.toLowerCase()}`);
        return;
      }

      setUser(profile);
      await Promise.all([loadComplaints(), loadNotifications()]);
    } catch (error) {
      toast.error(getErrorMessage(error, "Please login to continue"));
      navigate("/login");
    } finally {
      setLoading(false);
    }
  }, [domain, loadComplaints, loadNotifications, navigate]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadComplaints(), loadNotifications()]);
    setRefreshing(false);
  };

  const advanceStatus = async (complaintId: string, direction: "forward" | "back" = "forward") => {
    const complaint = complaints.find((item) => item.id === complaintId);
    if (!complaint) return;

    const currentIndex = STAFF_STATUS_FLOW.indexOf(complaint.status);
    if (currentIndex === -1) return;

    const nextIndex = direction === "forward" ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex < 0 || nextIndex >= STAFF_STATUS_FLOW.length) return;

    const nextStatus = STAFF_STATUS_FLOW[nextIndex];

    try {
      await api.patch(`/complaint/${complaintId}`, { status: nextStatus });
      toast.success(`Complaint moved to ${STATUS_LABELS[nextStatus]}`);
      await loadComplaints();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update complaint"));
    }
  };

  const metrics = useMemo(() => {
    const resolved = complaints.filter((c) => c.status === "RESOLVED").length;
    const pending = complaints.filter((c) => c.status === "CREATED").length;
    const inProgress = complaints.filter((c) => ["REVIEWED", "ASSIGNED", "WORK_IN_PROGRESS"].includes(c.status)).length;

    return {
      total: complaints.length,
      resolved,
      pending,
      inProgress,
    };
  }, [complaints]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-12">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <p className="text-sm text-muted-foreground">{format(new Date(), "PPP")}</p>
            <h1 className="text-3xl font-bold">{domainLabel} Operations</h1>
            <p className="text-muted-foreground">
              Manage complaints and publish domain-specific notifications
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/complaints")}>View Public Complaints</Button>
            <Button onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />Refreshing
                </>
              ) : (
                <>
                  <RefreshCcw className="mr-2 h-4 w-4" />Refresh
                </>
              )}
            </Button>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 lg:w-1/2">
            <TabsTrigger value="complaints">Complaints</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="complaints" className="space-y-6">
            <ComplaintsOverview metrics={metrics} />
            <StaffComplaintsBoard
              complaints={complaints.filter((complaint) => STAFF_STATUS_FLOW.includes(complaint.status))}
              onView={(id) => navigate(`/complaint/${id}`)}
              onAdvance={(id) => advanceStatus(id, "forward")}
              onRewind={(id) => advanceStatus(id, "back")}
            />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <NotificationManager
              domain={domain}
              notifications={notifications}
              onRefresh={loadNotifications}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

interface OverviewProps {
  metrics: {
    total: number;
    pending: number;
    inProgress: number;
    resolved: number;
  };
}

const ComplaintsOverview = ({ metrics }: OverviewProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <SummaryCard title="Total" value={metrics.total} description="Domain complaints" icon={<Bell className="h-4 w-4" />} />
    <SummaryCard title="Pending" value={metrics.pending} description="Awaiting review" icon={<AlertCircle className="h-4 w-4 text-yellow-500" />} />
    <SummaryCard title="In Progress" value={metrics.inProgress} description="Being addressed" icon={<Loader2 className="h-4 w-4 text-blue-500" />} />
    <SummaryCard title="Resolved" value={metrics.resolved} description="Closed complaints" icon={<Bell className="h-4 w-4 text-green-500" />} />
  </div>
);

interface SummaryCardProps {
  title: string;
  value: number;
  description: string;
  icon: ReactNode;
}

const SummaryCard = ({ title, value, description, icon }: SummaryCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

interface BoardProps {
  complaints: Complaint[];
  onView: (id: string) => void;
  onAdvance: (id: string) => void;
  onRewind: (id: string) => void;
}

const StaffComplaintsBoard = ({ complaints, onView, onAdvance, onRewind }: BoardProps) => (
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
    {STAFF_STATUS_FLOW.map((status) => {
      const items = complaints.filter((complaint) => complaint.status === status);
      return (
        <Card key={status} className="flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">{STATUS_LABELS[status]}</CardTitle>
            <CardDescription>{items.length} complaint(s)</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-3">
            {items.length === 0 ? (
              <EmptyColumn />
            ) : (
              items.map((complaint) => (
                <div key={complaint.id} className="rounded-lg border border-border p-3 space-y-3 text-sm">
                  <div className="space-y-1">
                    <p className="font-semibold line-clamp-2">{complaint.subject}</p>
                    <p className="text-muted-foreground text-xs line-clamp-3">{complaint.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{format(new Date(complaint.createdAt), "PP")}</span>
                      <span>&middot;</span>
                      <span>
                        {complaint.anonymous
                          ? "Anonymous"
                          : complaint.createdBy?.name || complaint.createdBy?.email || "Unknown"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {status !== "CREATED" && (
                      <Button size="sm" variant="secondary" className="flex-1" onClick={() => onRewind(complaint.id)}>
                        <ArrowLeft className="mr-1 h-3 w-3" />Back
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => onView(complaint.id)}>
                      <Eye className="h-3 w-3" />
                    </Button>
                    {status !== "RESOLVED" && (
                      <Button size="sm" className="flex-1" onClick={() => onAdvance(complaint.id)}>
                        Next<ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      );
    })}
  </div>
);

const EmptyColumn = () => (
  <div className="flex h-24 items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground">
    No complaints in this stage
  </div>
);

interface NotificationManagerProps {
  domain: Domain;
  notifications: Notification[];
  onRefresh: () => Promise<void>;
}

const NotificationManager = ({ domain, notifications, onRefresh }: NotificationManagerProps) => (
  <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle>Domain Notifications</CardTitle>
            <CardDescription>Updates sent to residents for this service</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={() => { void onRefresh(); }}>
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-sm">
            <AlertCircle className="mx-auto mb-2 h-6 w-6" />
            No notifications yet
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div key={notification.id} className="rounded-lg border border-border p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{notification.title}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{notification.description}</p>
                  </div>
                  <Badge variant="outline">{notification.type}</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span>{format(new Date(notification.createdAt), "PPpp")}</span>
                  <span>&middot;</span>
                  <span>By {notification.createdBy?.name || "System"}</span>
                  {notification.mediaLink && (
                    <a
                      href={notification.mediaLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline"
                    >
                      View Attachment
                    </a>
                  )}
                </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="w-full"
                    onClick={async () => {
                      if (!confirm("Delete this notification?")) return;
                      try {
                        await api.delete(`/notification/${notification.id}`);
                        toast.success("Notification deleted");
                        await onRefresh();
                      } catch (error) {
                        toast.error(getErrorMessage(error, "Failed to delete notification"));
                      }
                    }}
                  >
                  <Trash2 className="mr-2 h-4 w-4" />Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>

    <DomainNotificationForm domain={domain} onSuccess={onRefresh} />
  </div>
);

interface DomainNotificationFormProps {
  domain: Domain;
  onSuccess: () => Promise<void>;
}

const DomainNotificationForm = ({ domain, onSuccess }: DomainNotificationFormProps) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "UPDATE" as NotificationType,
  });
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("description", formData.description);
      payload.append("type", formData.type);
      payload.append("domain", domain);
      if (file) {
        payload.append("file", file);
      }

      await api.post("/notification", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Notification published");
      setFormData({ title: "", description: "", type: "UPDATE" });
      setFile(null);
      await onSuccess();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to publish notification"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Notification</CardTitle>
        <CardDescription>Share updates for your domain</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              required
              value={formData.title}
              onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <select
              id="type"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={formData.type}
              onChange={(event) => setFormData((prev) => ({ ...prev, type: event.target.value as NotificationType }))}
            >
              <option value="ALERT">Alert</option>
              <option value="UPDATE">Update</option>
              <option value="ANNOUNCEMENT">Announcement</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              required
              rows={4}
              value={formData.description}
              onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Attachment (optional)</Label>
            <Input
              id="file"
              type="file"
              accept="image/*"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
            />
            {file && <p className="text-xs text-muted-foreground">{file.name}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <BellPlus className="mr-2 h-4 w-4" />
            )}
            Publish Notification
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default StaffDashboard;
