"use client";

import Link from "next/link";
import { useComplaints } from "@/hooks/use-complaints";
import { Button } from "@/components/ui/button";

export default function ComplaintsListPage() {
  const { complaints, loading } = useComplaints();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (complaints.length === 0) {
    return <div>No complaints found.</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">All my complaints</h2>
      <div className="rounded-md border">
        {complaints.map((c) => (
          <div key={c.id} className="flex items-center justify-between p-3 border-b last:border-b-0">
            <div className="min-w-0">
              <div className="font-medium truncate">{c.subject}</div>
              <div className="text-xs text-muted-foreground">
                {c.domain} • {c.status.replaceAll("_", " ")} • {new Date(c.createdAt).toLocaleString()}
              </div>
            </div>
            <Link href={`/dashboard/student/complaints/${c.id}`}>
              <Button size="sm" variant="outline">View details</Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}