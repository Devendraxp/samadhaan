import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";
import { Loader2, Trash2, ArrowLeft, Save } from "lucide-react";

import { api } from "@/lib/api";
import type { Domain, Notification, NotificationType } from "@/lib/types";
import { DOMAIN_LABELS, NOTIFICATION_TYPE_LABELS, STAFF_DOMAINS } from "@/lib/constants";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export default function NotificationDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [notification, setNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    domain: "" as "" | Domain,
    type: "UPDATE" as NotificationType,
  });

  const loadNotification = useCallback(async () => {
    if (!id) return;
    try {
      await api.get("/user/profile");
      const response = await api.get<Notification>(`/notification/${id}`);
      setNotification(response.data);
      setFormData({
        title: response.data.title,
        description: response.data.description,
        domain: (response.data.domain as Domain | undefined) || "",
        type: response.data.type,
      });
    } catch (error: unknown) {
      const message =
        typeof error === "object" && error && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(message || "Unable to load notification");
      navigate("/login");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadNotification();
  }, [loadNotification]);

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!id) return;
    setSaving(true);
    try {
      await api.put(`/notification/${id}`, {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        domain: formData.domain || undefined,
      });
      toast.success("Notification updated");
      await loadNotification();
    } catch (error: unknown) {
      const message =
        typeof error === "object" && error && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(message || "Failed to update notification");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm("Delete this notification?")) return;
    setDeleting(true);
    try {
      await api.delete(`/notification/${id}`);
      toast.success("Notification deleted");
      navigate("/notifications");
    } catch (error: unknown) {
      const message =
        typeof error === "object" && error && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(message || "Failed to delete notification");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!notification) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <Button variant="ghost" className="w-fit" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />Back to notifications
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Badge variant="secondary">{NOTIFICATION_TYPE_LABELS[notification.type]}</Badge>
              <span className="text-sm text-muted-foreground">
                {format(new Date(notification.createdAt), "PPpp")} &middot; {notification.createdBy?.name || "System"}
              </span>
            </div>
            <CardTitle className="text-3xl">{notification.title}</CardTitle>
            <CardDescription>{notification.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Domain: {notification.domain ? DOMAIN_LABELS[notification.domain] : "All"}</p>
            <p>Last updated: {format(new Date(notification.updatedAt), "PPpp")}</p>
            {notification.mediaLink && (
              <a href={notification.mediaLink} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                View attachment
              </a>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Edit Notification</CardTitle>
            <CardDescription>Update the details and share refreshed information.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleUpdate}>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  required
                  onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={5}
                  value={formData.description}
                  required
                  onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Domain</Label>
                  <Select
                    value={formData.domain || ""}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, domain: value as Domain | "" }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All domains" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Domains</SelectItem>
                      {STAFF_DOMAINS.map((domain) => (
                        <SelectItem key={domain} value={domain}>
                          {DOMAIN_LABELS[domain]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value as NotificationType }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(NOTIFICATION_TYPE_LABELS).map((type) => (
                        <SelectItem key={type} value={type}>
                          {NOTIFICATION_TYPE_LABELS[type as NotificationType]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-2 md:flex-row">
                <Button type="submit" className="flex-1" disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Changes
                </Button>
                <Button type="button" variant="destructive" className="md:w-40" onClick={handleDelete} disabled={deleting}>
                  {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                  Delete
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
