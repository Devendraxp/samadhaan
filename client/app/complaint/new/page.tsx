"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ComplaintDomain } from "@/types/complaint";

const DOMAINS: ComplaintDomain[] = ["WATER", "MESS", "INTERNET", "CLEANING", "TRANSPORT"];

export default function NewComplaintPage() {
  const router = useRouter();
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [domain, setDomain] = useState<ComplaintDomain>(DOMAINS[0]);
  const [anonymous, setAnonymous] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serverUrl) {
      toast.error("Missing NEXT_PUBLIC_SERVER_URL");
      return;
    }
    if (!subject.trim() || !description.trim()) {
      toast.error("Subject and description are required");
      return;
    }
    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append("subject", subject.trim());
      fd.append("description", description.trim());
      fd.append("domain", domain);
      fd.append("anonymous", String(anonymous));
      if (file) fd.append("file", file);

      const res = await axios.post(`${serverUrl}/complaint?source=web`, fd, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      const created = res?.data?.data as { id?: string } | undefined;
      toast.success(res?.data?.message || "Complaint created");
      router.push(created?.id ? `/complaint/${created.id}` : "/dashboard/student");
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message || err.response?.statusText || "Failed to create complaint"
        : "Failed to create complaint";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Create Complaint</h1>
          <p className="text-sm text-muted-foreground">
            Give a clear subject and detailed description. Attach an image if helpful.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-8 rounded-xl border bg-card p-6 shadow-sm">
          <div className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Short, clear summary"
                maxLength={120}
              />
              <div className="text-[11px] text-muted-foreground">{subject.length}/120</div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue, location, impact..."
                className="min-h-44 resize-vertical rounded-md"
              />
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>{description.length} chars</span>
                <span>Be respectful.</span>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="domain">Domain</Label>
                <select
                  id="domain"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value as ComplaintDomain)}
                >
                  {DOMAINS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end gap-2">
                <input
                  id="anonymous"
                  type="checkbox"
                  className="h-4 w-4 accent-primary"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                />
                <Label htmlFor="anonymous">Submit anonymously</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Attachment (optional)</Label>
              <Input
                id="file"
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              {file && <div className="text-xs text-muted-foreground">Selected: {file.name}</div>}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit"}
            </Button>
            <Button type="button" variant="outline" disabled={submitting} onClick={() => router.back()}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={submitting}
              onClick={() => {
                setSubject("");
                setDescription("");
                setAnonymous(false);
                setFile(null);
                setDomain(DOMAINS[0]);
              }}
            >
              Reset
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}