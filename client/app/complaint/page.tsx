"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { Complaint, ComplaintStatus } from "@/types/complaint";

const LIVE_STATUSES: ComplaintStatus[] = [
  "CREATED",
  "REVIEWED",
  "ASSIGNED",
  "WORK_IN_PROGRESS",
  "RESOLVED",
];

const statusColor = (s: ComplaintStatus) => {
  switch (s) {
    case "CREATED":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "REVIEWED":
      return "bg-indigo-100 text-indigo-700 border-indigo-200";
    case "ASSIGNED":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "WORK_IN_PROGRESS":
      return "bg-purple-100 text-purple-700 border-purple-200";
    case "RESOLVED":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "ARCHIVED":
      return "bg-gray-100 text-gray-700 border-gray-200";
    case "CANCELED":
      return "bg-rose-100 text-rose-700 border-rose-200";
    case "DELETED":
      return "bg-neutral-100 text-neutral-700 border-neutral-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

export default function AllComplaintsPublicPage() {
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      if (!serverUrl) {
        toast.error("Missing NEXT_PUBLIC_SERVER_URL");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await axios.get(`${serverUrl}/complaint?source=web`, {
          withCredentials: true,
        });
        const data = res?.data?.data as Complaint[] | undefined;
        if (!Array.isArray(data)) {
          toast.error(res?.data?.message || "Unexpected response from server");
          setComplaints([]);
          return;
        }
        setComplaints(data);
      } catch (err) {
        const msg = axios.isAxiosError(err)
          ? err.response?.data?.message ||
            err.response?.statusText ||
            "Failed to fetch complaints"
          : "Failed to fetch complaints";
        toast.error(msg);
        setComplaints([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [serverUrl]);

  const liveComplaints = useMemo(
    () => complaints.filter((c) => LIVE_STATUSES.includes(c.status)),
    [complaints]
  );

  if (loading) return <div className="py-12 text-center text-sm">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2 m-4">
        <h1 className="text-2xl font-semibold tracking-tight">All Live Complaints</h1>
        <Link href="/complaint/new">
          <Button size="sm">Create new</Button>
        </Link>
      </div>

      {liveComplaints.length === 0 ? (
        <div className="p-6 text-sm text-muted-foreground border rounded-md bg-muted/30">
          No live complaints.
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <div className="grid grid-cols-7 gap-2 px-4 py-3 text-xs font-medium border-b bg-muted/40 uppercase tracking-wide">
            <div className="col-span-2">Subject</div>
            <div>Domain</div>
            <div>Status</div>
            <div>Complainer</div>
            <div>Created</div>
            <div className="text-right">Action</div>
          </div>
          {liveComplaints.map((c) => {
            const complainer =
              c.anonymous
                ? "Anonymous"
                : `${c.complainer?.name || "Unknown"} (${c.complainer?.email || "No email"})`;
            return (
              <div
                key={c.id}
                className="grid grid-cols-7 gap-2 px-4 py-3 text-sm items-center border-b last:border-b-0 hover:bg-muted/30 transition"
              >
                <div className="col-span-2 truncate" title={c.subject}>
                  <span className="font-medium">{c.subject}</span>
                </div>
                <div className="text-xs font-mono">{c.domain}</div>
                <div>
                  <span
                    className={`px-2 py-1 rounded border text-[10px] font-semibold ${statusColor(
                      c.status
                    )}`}
                  >
                    {c.status.replaceAll("_", " ")}
                  </span>
                </div>
                <div className="text-xs truncate max-w-[160px]" title={complainer}>
                  {complainer}
                </div>
                <div className="text-xs">
                  {new Date(c.createdAt).toLocaleDateString()}{" "}
                  <span className="text-muted-foreground">
                    {new Date(c.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-right">
                  <Link href={`/complaint/${c.id}`}>
                    <Button size="xs" className="p-2 m-2" variant="outline">
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}