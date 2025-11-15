import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";
import { isAxiosError } from "axios";

import { api } from "@/lib/api";
import { DOMAIN_LABELS, NOTIFICATION_TYPE_LABELS, STAFF_DOMAINS } from "@/lib/constants";
import type { Domain, Notification, NotificationType, User } from "@/lib/types";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, RefreshCcw, Search, SlidersHorizontal } from "lucide-react";

const allDomainOption = "ALL" as const;
const allTypeOption = "ALL" as const;

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [domainFilter, setDomainFilter] = useState<typeof allDomainOption | Domain>(allDomainOption);
  const [typeFilter, setTypeFilter] = useState<typeof allTypeOption | NotificationType>(allTypeOption);
  const [searchTerm, setSearchTerm] = useState("");

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (isAxiosError(error)) {
      return (error.response?.data as { message?: string } | undefined)?.message || fallback;
    }
    return fallback;
  };

  const loadData = useCallback(async () => {
    try {
      const profileResponse = await api.get<User>("/user/profile");
      setUser(profileResponse.data);
      const notificationsResponse = await api.get<Notification[]>("/notification");
      setNotifications(notificationsResponse.data);
    } catch (error) {
      toast.error(getErrorMessage(error, "Please login to view notifications"));
      if (isAxiosError(error) && error.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const matchesDomain =
        domainFilter === allDomainOption || (notification.domain || "") === domainFilter;
      const matchesType = typeFilter === allTypeOption || notification.type === typeFilter;
      const matchesSearch =
        searchTerm.trim().length === 0 ||
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesDomain && matchesType && matchesSearch;
    });
  }, [notifications, domainFilter, typeFilter, searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Stay updated</p>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">Browse alerts and announcements across all domains.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
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
            {user?.role === "ADMIN" && (
              <Button variant="secondary" onClick={() => navigate("/dashboard/admin")}>Manage</Button>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <SlidersHorizontal className="h-4 w-4" />
              Refine results
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by title or description"
                  className="pl-9"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Domain</Label>
              <Select value={domainFilter} onValueChange={(value) => setDomainFilter(value as Domain | typeof allDomainOption)}>
                <SelectTrigger>
                  <SelectValue placeholder="All domains" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={allDomainOption}>All Domains</SelectItem>
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
              <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as NotificationType | typeof allTypeOption)}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={allTypeOption}>All Types</SelectItem>
                  {Object.keys(NOTIFICATION_TYPE_LABELS).map((type) => (
                    <SelectItem key={type} value={type}>
                      {NOTIFICATION_TYPE_LABELS[type as NotificationType]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No notifications match your filters.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredNotifications.map((notification) => (
              <Card key={notification.id} className="flex flex-col justify-between">
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant="secondary">{NOTIFICATION_TYPE_LABELS[notification.type]}</Badge>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(notification.createdAt), "PPpp")}
                    </p>
                  </div>
                  <CardTitle className="text-xl">{notification.title}</CardTitle>
                  <CardDescription className="line-clamp-3">
                    {notification.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-2">
                  <div className="flex flex-col text-sm text-muted-foreground">
                    <span>
                      Domain: {notification.domain ? DOMAIN_LABELS[notification.domain] : "All"}
                    </span>
                    <span>By {notification.createdBy?.name || "System"}</span>
                  </div>
                  <Button variant="outline" onClick={() => navigate(`/notifications/${notification.id}`)}>
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
