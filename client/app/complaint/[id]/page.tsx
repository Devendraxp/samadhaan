"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Complaint, Response } from "@/types/complaint";

type UserRole = "STUDENT" | "ADMIN" | "MESS" | "INTERNET" | "CLEANING" | "WATER" | "TRANSPORT";
const staffRoles: UserRole[] = ["MESS", "INTERNET", "CLEANING", "WATER", "TRANSPORT"];

const responseBorder = (role?: UserRole) => {
  if (role === "ADMIN") return "border-green-500 bg-green-50 dark:bg-green-950/40";
  if (role && staffRoles.includes(role)) return "border-blue-500 bg-blue-50 dark:bg-blue-950/40";
  return "border-muted";
};

export default function PublicComplaintDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);

  const [respContent, setRespContent] = useState("");
  const [respFile, setRespFile] = useState<File | null>(null);
  const [respSubmitting, setRespSubmitting] = useState(false);

  const loadComplaint = useCallback(async () => {
    if (!serverUrl || !id) return;
    try {
      setLoading(true);
      const res = await axios.get(`${serverUrl}/complaint/${id}?source=web`, { withCredentials: true });
      const data = res?.data?.data as Complaint | undefined;
      if (!data) {
        toast.error(res?.data?.message || "Not found");
        setComplaint(null);
        return;
      }
      setComplaint(data);
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message || err.response?.statusText || "Failed to load complaint"
        : "Failed to load complaint";
      toast.error(msg);
      setComplaint(null);
    } finally {
      setLoading(false);
    }
  }, [id, serverUrl]);

  useEffect(() => {
    loadComplaint();
  }, [loadComplaint]);

  const submitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serverUrl) {
      toast.error("Missing NEXT_PUBLIC_SERVER_URL");
      return;
    }
    if (!complaint) {
      toast.error("Complaint not loaded");
      return;
    }
    if (!respContent.trim()) {
      toast.error("Response content required");
      return;
    }
    try {
      setRespSubmitting(true);
      const fd = new FormData();
      fd.append("complaintId", complaint.id);
      fd.append("content", respContent.trim());
      if (respFile) fd.append("file", respFile);
      const res = await axios.post(`${serverUrl}/response?source=web`, fd, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(res?.data?.message || "Response submitted");
      const created = res?.data?.data as Response | undefined;
      if (created) {
        setComplaint((prev) => (prev ? { ...prev, responses: [...prev.responses, created] } : prev));
      } else {
        await loadComplaint();
      }
      setRespContent("");
      setRespFile(null);
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message || err.response?.statusText || "Failed to submit response"
        : "Failed to submit response";
      toast.error(msg);
    } finally {
      setRespSubmitting(false);
    }
  };

  if (loading) return <div className="py-12 text-center text-sm">Loading...</div>;
  if (!complaint) return <div className="py-12 text-center text-sm">Complaint not found.</div>;

  const complainerDisplay = complaint.anonymous
    ? "Anonymous"
    : `${complaint.complainer?.name || "Unknown"} (${complaint.complainer?.email || "No email"})`;

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold tracking-tight">Complaint</h1>
          <span className="inline-flex items-center rounded-md border px-2 py-1 text-[11px] font-semibold bg-muted">
            {complaint.status.replaceAll("_", " ")}
          </span>
        </div>

        {/* Layout: left (content) / right (meta) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main content like a post */}
          <main className="lg:col-span-8 space-y-6">
            <article className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
              <h2 className="text-2xl font-semibold">{complaint.subject}</h2>

              <div className="text-sm leading-relaxed whitespace-pre-wrap">{complaint.description}</div>

              {complaint.mediaLink && (
                <div>
                  <a
                    href={complaint.mediaLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-primary underline"
                  >
                    View attachment
                  </a>
                </div>
              )}
            </article>

            {/* Responses (comments) */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold">Responses ({complaint.responses.length})</h3>
              <div className="rounded-xl border overflow-hidden">
                {complaint.responses.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground">No responses yet.</div>
                ) : (
                  complaint.responses.map((r) => {
                    const role = (r.responder?.role || "STUDENT") as UserRole;
                    return (
                      <div
                        key={r.id}
                        className={`p-4 space-y-2 border-b last:border-b-0 border-l-4 ${responseBorder(role)}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">
                            {r.responder?.name || "Unknown"}{" "}
                            <span className="text-muted-foreground font-normal">
                              ({r.responder?.email || "No email"})
                            </span>
                          </div>
                          <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-1 rounded bg-muted">
                            {role}
                          </span>
                        </div>
                        <div className="text-sm whitespace-pre-wrap">{r.content}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {new Date(r.createdAt).toLocaleString()}
                        </div>
                        {r.mediaLink && (
                          <a
                            href={r.mediaLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-primary underline"
                          >
                            View attachment
                          </a>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            {/* Add response (comment box) */}
            <section className="rounded-xl border bg-card p-6 space-y-4 shadow-sm">
              <h3 className="text-lg font-semibold">Add a response</h3>
              <form onSubmit={submitResponse} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="response-content" className="text-sm font-medium">
                    Content
                  </label>
                  <Textarea
                    id="response-content"
                    className="min-h-40 resize-vertical rounded-md"
                    value={respContent}
                    onChange={(e) => setRespContent(e.target.value)}
                    placeholder="Write your response..."
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="response-file" className="text-sm font-medium">
                    Attachment (optional)
                  </label>
                  <Input
                    id="response-file"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setRespFile(e.target.files?.[0] || null)}
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="submit" disabled={respSubmitting} size="sm">
                    {respSubmitting ? "Submitting..." : "Submit"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={respSubmitting}
                    onClick={() => {
                      setRespContent("");
                      setRespFile(null);
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </form>
            </section>
          </main>

          {/* Meta sidebar (right) */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 space-y-4">
              <div className="rounded-xl border bg-card p-5">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Domain</span>
                    <span className="font-medium">{complaint.domain}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span className="font-medium">
                      {new Date(complaint.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border p-5 bg-blue-50/60 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
                <div className="text-xs uppercase text-muted-foreground mb-1">Complainer</div>
                <div className="text-sm font-semibold">
                  {complainerDisplay}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}