import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { DOMAIN_LABELS, STATUS_LABELS, STATUS_COLORS } from "@/lib/constants";
import type { Complaint, ComplaintStatus, Domain } from "@/lib/types";
import { Plus, Clock, Loader2, RefreshCcw, Search, SlidersHorizontal } from "lucide-react";
import { format } from "date-fns";

export default function Complaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [domainFilter, setDomainFilter] = useState<Domain | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | "ALL">("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchComplaints = useCallback(async () => {
    try {
      const response = await api.get<Complaint[]>("/complaint");
      setComplaints(response.data);
    } catch (error: unknown) {
      const message =
        typeof error === "object" && error && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(message || "Failed to fetch complaints");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchComplaints();
  };

  const filteredComplaints = useMemo(() => {
    return complaints.filter((complaint) => {
      const matchesDomain = domainFilter === "ALL" || complaint.domain === domainFilter;
      const matchesStatus = statusFilter === "ALL" || complaint.status === statusFilter;
      const matchesSearch =
        searchTerm.trim().length === 0 ||
        complaint.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesDomain && matchesStatus && matchesSearch;
    });
  }, [complaints, domainFilter, statusFilter, searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading complaints...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-12">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold mb-2">All Complaints</h1>
            <p className="text-muted-foreground">
              View and track all submitted complaints
            </p>
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
            <Link to="/complaint/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Complaint
              </Button>
            </Link>
          </div>
        </div>

        <Card className="mb-8">
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
                  placeholder="Search by subject or description"
                  className="pl-9"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Domain</Label>
              <Select value={domainFilter} onValueChange={(value) => setDomainFilter(value as Domain | "ALL")}>
                <SelectTrigger>
                  <SelectValue placeholder="All domains" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Domains</SelectItem>
                  {Object.keys(DOMAIN_LABELS).map((domain) => (
                    <SelectItem key={domain} value={domain}>
                      {DOMAIN_LABELS[domain as Domain]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ComplaintStatus | "ALL")}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  {Object.keys(STATUS_LABELS).map((status) => (
                    <SelectItem key={status} value={status}>
                      {STATUS_LABELS[status as ComplaintStatus]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {filteredComplaints.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No complaints found</p>
              <Link to="/complaint/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Submit Your First Complaint
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredComplaints.map((complaint) => (
              <Link key={complaint.id} to={`/complaint/${complaint.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="mb-2">{complaint.subject}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {complaint.description}
                        </CardDescription>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`ml-4 bg-${STATUS_COLORS[complaint.status]}/10 text-${STATUS_COLORS[complaint.status]} border-${STATUS_COLORS[complaint.status]}/20`}
                      >
                        {STATUS_LABELS[complaint.status]}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">{DOMAIN_LABELS[complaint.domain]}</Badge>
                        <span>
                          {complaint.anonymous
                            ? "By: Anonymous"
                            : `By: ${
                                complaint.complainer?.name ||
                                complaint.complainer?.email ||
                                complaint.createdBy?.name ||
                                complaint.createdBy?.email ||
                                "Unknown"
                              }`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {format(new Date(complaint.createdAt), "MMM d, yyyy")}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
