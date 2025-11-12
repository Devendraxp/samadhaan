"use client";

import Link from "next/link";
import { useComplaints } from "@/hooks/use-complaints";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ComplaintStatus } from "@/types/complaint";

const STATUSES: ComplaintStatus[] = [
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

export default function StudentHomePage() {
  const { complaints, grouped, loading } = useComplaints();

  if (loading) {
    return <div>Loading...</div>;
  }

  const recent = [...complaints].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Actions top-right */}
      <div className="flex items-center justify-end gap-2">
        <Link href="/complaint/new">
          <Button size="sm">New complaint</Button>
        </Link>
        <Link href="/complaint">
          <Button size="sm" variant="secondary">Live complaints</Button>
        </Link>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-4">My complaints summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STATUSES.map((s) => {
            const count = grouped[s]?.length ?? 0;
            return (
              <Card key={s} className="p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded border text-xs font-medium ${statusColor(s)}`}>
                    {s.replaceAll("_", " ")}
                  </span>
                  <span className="text-2xl font-bold">{count}</span>
                </div>
                <div className="mt-4 flex gap-2">
                  <Link href={`/dashboard/student/complaints/status/${encodeURIComponent(s)}`}>
                    <Button size="sm" variant="secondary">View all</Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Recent complaints</h2>
        <div className="rounded-md border">
          <div className="grid grid-cols-6 gap-2 p-3 text-sm font-medium border-b bg-muted/30">
            <div className="col-span-2">Subject</div>
            <div>Domain</div>
            <div>Status</div>
            <div>Created</div>
            <div className="text-right">Action</div>
          </div>
          {recent.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">No complaints yet.</div>
          ) : (
            recent.map((c) => (
              <div key={c.id} className="grid grid-cols-6 gap-2 p-3 border-b last:border-b-0 items-center text-sm">
                <div className="col-span-2 truncate" title={c.subject}>{c.subject}</div>
                <div>{c.domain}</div>
                <div>
                  <span className={`px-2 py-1 rounded border text-xs font-medium ${statusColor(c.status)}`}>
                    {c.status.replaceAll("_", " ")}
                  </span>
                </div>
                <div>{new Date(c.createdAt).toLocaleString()}</div>
                <div className="text-right">
                  <Link href={`/dashboard/student/complaints/${c.id}`}>
                    <Button size="sm" variant="outline">View details</Button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}