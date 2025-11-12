"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useComplaints } from "@/hooks/use-complaints";
import { Button } from "@/components/ui/button";
import type { ComplaintStatus } from "@/types/complaint";

export default function ComplaintsByStatusPage() {
  const params = useParams<{ status: string }>();
  const raw = (params?.status || "").toString();
  const status = raw.toUpperCase().replaceAll("-", "_") as ComplaintStatus;

  const { complaints, loading } = useComplaints();

  const filtered = useMemo(
    () => complaints.filter((c) => c.status === status),
    [complaints, status]
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Complaints: {status.replaceAll("_", " ")}</h2>
      {filtered.length === 0 ? (
        <div>No complaints with status {status}.</div>
      ) : (
        <div className="rounded-md border">
          {filtered.map((c) => (
            <div key={c.id} className="flex items-center justify-between p-3 border-b last:border-b-0">
              <div className="min-w-0">
                <div className="font-medium truncate">{c.subject}</div>
                <div className="text-xs text-muted-foreground">
                  {c.domain} • {new Date(c.createdAt).toLocaleString()}
                </div>
              </div>
              <Link href={`/dashboard/student/complaints/${c.id}`}>
                <Button size="sm" variant="outline">View details</Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}