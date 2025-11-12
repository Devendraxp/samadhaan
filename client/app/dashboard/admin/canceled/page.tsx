"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

type ComplaintStatus = "CREATED" | "REVIEWED" | "ASSIGNED" | "WORK_IN_PROGRESS" | "RESOLVED" | "ARCHIVED" | "CANCELED" | "DELETED";

interface Complaint {
  id: string;
  subject: string;
  description: string;
  domain: string;
  anonymous: boolean;
  status: ComplaintStatus;
  createdAt: string;
  complainer?: { id: string; name: string };
}

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

export default function CanceledComplaintsPage() {
  const [loading, setLoading] = useState(false);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const grouped = useMemo(() => {
    const map: Record<ComplaintStatus, Complaint[]> = {
      CREATED: [], REVIEWED: [], ASSIGNED: [], WORK_IN_PROGRESS: [], RESOLVED: [], ARCHIVED: [], CANCELED: [], DELETED: [],
    };
    complaints.forEach((c) => map[c.status]?.push(c));
    return map;
  }, [complaints]);

  const fetchAll = async () => {
    if (!serverUrl) {
      toast.error("Missing server URL");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get(`${serverUrl}/complaint?source=web`, { withCredentials: true });
      const raw = res?.data?.data;
      if (!Array.isArray(raw)) {
        toast.error("Unexpected response for complaints list");
        setComplaints([]);
        return;
      }
      setComplaints(raw as Complaint[]);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const softDelete = async (id: string) => {
    if (!serverUrl) {
      toast.error("Missing server URL");
      return;
    }
    try {
      const res = await axios.patch(`${serverUrl}/complaint/${id}?source=web`, { status: "DELETED" }, { withCredentials: true });
      const updated: Complaint | undefined = res?.data?.data;
      if (!updated) {
        toast.error("Update returned no data");
        return;
      }
      setComplaints((prev) => prev.map((c) => (c.id === id ? updated : c)));
      toast.success("Moved to deleted");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to delete");
    }
  };

  const list = grouped.CANCELED;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Canceled complaints</h1>
        <Button size="sm" variant="outline" onClick={fetchAll} disabled={loading}>Refresh</Button>
      </div>
      {loading ? (
        <div className="p-4 text-sm">Loading...</div>
      ) : list.length === 0 ? (
        <div className="p-4 text-sm text-muted-foreground">No canceled complaints.</div>
      ) : (
        <ScrollArea className="h-[70vh]">
          <div className="space-y-3">
            {list
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((c) => (
                <Card key={c.id} className="p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium truncate">{c.subject}</div>
                    <div className="text-[10px] text-muted-foreground">{new Date(c.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {c.domain} • {c.anonymous ? "Anonymous" : c.complainer?.name || "User"}
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/complaint/${c.id}`}>
                      <Button size="xs" className="p-2 m-2" variant="outline">Details</Button>
                    </Link>
                    <Button size="xs" className="p-2 m-2" variant="ghost" onClick={() => softDelete(c.id)}>
                      Move to Deleted
                    </Button>
                  </div>
                </Card>
              ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}