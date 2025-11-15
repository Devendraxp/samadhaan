import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api, createFormData } from "@/lib/api";
import { toast } from "sonner";
import { DOMAIN_LABELS, STATUS_LABELS, STATUS_COLORS } from "@/lib/constants";
import type { Complaint, Response, Domain, ComplaintStatus, User } from "@/lib/types";
import { ArrowLeft, Clock, Send, Loader2, Save, Trash2 } from "lucide-react";
import { format } from "date-fns";

export default function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [responseContent, setResponseContent] = useState("");
  const [responseFile, setResponseFile] = useState<File | null>(null);
  const [editData, setEditData] = useState({
    subject: "",
    description: "",
    domain: "WATER" as Domain,
    status: "CREATED" as ComplaintStatus,
  });

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (isAxiosError(error)) {
      return (error.response?.data as { message?: string } | undefined)?.message || fallback;
    }
    return fallback;
  };

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      const [profileRes, complaintRes, responsesRes] = await Promise.all([
        api.get<User>("/user/profile").catch(() => null),
        api.get<Complaint>(`/complaint/${id}`),
        api.get<Response[]>(`/response/complaint/${id}`),
      ]);

      if (profileRes) {
        setProfile(profileRes.data);
      }

      setComplaint(complaintRes.data);
      setResponses(responsesRes.data);
      setEditData({
        subject: complaintRes.data.subject,
        description: complaintRes.data.description,
        domain: complaintRes.data.domain,
        status: complaintRes.data.status,
      });
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to fetch complaint"));
      if (isAxiosError(error) && error.response?.status === 404) {
        navigate("/complaints");
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!responseContent.trim()) {
      toast.error("Please enter a response");
      return;
    }

    if (!id) return;

    setSubmitting(true);

    try {
      const response = await api.post(
        "/response",
        createFormData({
          complaintId: id,
          content: responseContent,
          file: responseFile ?? undefined,
        }),
        {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        }
      );
      
      setResponses([...responses, response.data]);
      setResponseContent("");
      setResponseFile(null);
      toast.success("Response submitted successfully!");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to submit response"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateComplaint = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!id) return;
    setUpdating(true);
    try {
      await api.patch(`/complaint/${id}`, {
        subject: editData.subject,
        description: editData.description,
        domain: editData.domain,
        status: editData.status,
      });
      toast.success("Complaint updated successfully");
      await loadData();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update complaint"));
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteComplaint = async () => {
    if (!id || !confirm("Delete this complaint?")) return;
    setDeleting(true);
    try {
      await api.delete(`/complaint/${id}`);
      toast.success("Complaint deleted");
      navigate("/complaints");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete complaint"));
    } finally {
      setDeleting(false);
    }
  };

  const canManage = useMemo(() => {
    if (!profile || !complaint) return false;
    if (profile.role === "ADMIN") return true;
    if (profile.role !== "STUDENT") return true;

    const sameId = complaint.createdBy?.id
      ? profile.id === complaint.createdBy.id
      : false;

    const complainerEmailMatch = complaint.complainer?.email
      ? profile.email === complaint.complainer.email
      : false;

    const createdByEmailMatch = complaint.createdBy?.email
      ? profile.email === complaint.createdBy.email
      : false;

    return sameId || complainerEmailMatch || createdByEmailMatch;
  }, [profile, complaint]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading complaint...</div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Complaint not found</p>
          <Button onClick={() => navigate("/complaints")}>Back to Complaints</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-12">
      <div className="container mx-auto max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/complaints")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Complaints
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{complaint.subject}</CardTitle>
                <CardDescription className="flex items-center gap-4 text-base">
                  <Badge variant="outline">{DOMAIN_LABELS[complaint.domain]}</Badge>
                  <span>
                    By: {complaint.anonymous
                      ? "Anonymous"
                      : complaint.complainer?.name ||
                        complaint.complainer?.email ||
                        complaint.createdBy?.name ||
                        complaint.createdBy?.email ||
                        "Unknown"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {format(new Date(complaint.createdAt), "MMM d, yyyy 'at' h:mm a")}
                  </span>
                </CardDescription>
              </div>
              <Badge
                variant="secondary"
                className={`bg-${STATUS_COLORS[complaint.status]}/10 text-${STATUS_COLORS[complaint.status]} border-${STATUS_COLORS[complaint.status]}/20`}
              >
                {STATUS_LABELS[complaint.status]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-foreground whitespace-pre-wrap mb-4">
              {complaint.description}
            </p>
            {complaint.mediaLink && (
              <img
                src={complaint.mediaLink}
                alt="Complaint attachment"
                className="rounded-lg max-w-full h-auto"
              />
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {canManage && (
            <Card>
              <CardHeader>
                <CardTitle>Edit Complaint</CardTitle>
                <CardDescription>Update the complaint details or change its status.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleUpdateComplaint}>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={editData.subject}
                      onChange={(event) => setEditData((prev) => ({ ...prev, subject: event.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      rows={5}
                      value={editData.description}
                      onChange={(event) => setEditData((prev) => ({ ...prev, description: event.target.value }))}
                      required
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Domain</Label>
                      <Select
                        value={editData.domain}
                        onValueChange={(value) => setEditData((prev) => ({ ...prev, domain: value as Domain }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
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
                      <Select
                        value={editData.status}
                        onValueChange={(value) => setEditData((prev) => ({ ...prev, status: value as ComplaintStatus }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(STATUS_LABELS).map((status) => (
                            <SelectItem key={status} value={status}>
                              {STATUS_LABELS[status as ComplaintStatus]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 md:flex-row">
                    <Button type="submit" className="flex-1" disabled={updating}>
                      {updating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Save Changes
                    </Button>
                    <Button type="button" variant="destructive" className="md:w-48" onClick={handleDeleteComplaint} disabled={deleting}>
                      {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                      Delete Complaint
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <h2 className="text-2xl font-bold">Responses ({responses.length})</h2>

          {responses.map((response) => (
            <Card key={response.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">
                      {response.responder.name}
                    </CardTitle>
                    <CardDescription>
                      <Badge variant="outline" className="mr-2">
                        {response.responder.role}
                      </Badge>
                      {format(new Date(response.createdAt), "MMM d, yyyy 'at' h:mm a")}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-foreground whitespace-pre-wrap mb-4">
                  {response.content}
                </p>
                {response.mediaLink && (
                  <img
                    src={response.mediaLink}
                    alt="Response attachment"
                    className="rounded-lg max-w-full h-auto"
                  />
                )}
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardHeader>
              <CardTitle>Add a Response</CardTitle>
              <CardDescription>
                Share your thoughts or updates on this complaint
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitResponse} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="response">Your Response</Label>
                  <Textarea
                    id="response"
                    placeholder="Type your response here..."
                    value={responseContent}
                    onChange={(e) => setResponseContent(e.target.value)}
                    required
                    disabled={submitting}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responseFile">Attachment (Optional)</Label>
                  <Input
                    id="responseFile"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setResponseFile(e.target.files?.[0] || null)}
                    disabled={submitting}
                  />
                </div>

                <Button type="submit" disabled={submitting}>
                  <Send className="h-4 w-4 mr-2" />
                  {submitting ? "Submitting..." : "Submit Response"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
