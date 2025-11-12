"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

type ComplaintStatus =
  | "CREATED"
  | "REVIEWED"
  | "ASSIGNED"
  | "WORK_IN_PROGRESS"
  | "RESOLVED"
  | "ARCHIVED"
  | "CANCELED"
  | "DELETED";

interface Complaint {
  id: string;
  subject: string;
  description: string;
  mediaLink: string | null;
  domain: string;
  anonymous: boolean;
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
  complainer?: { id: string; name: string };
}

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
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

export default function AdminKanbanPage() {
  const [loading, setLoading] = useState(false);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [activeTab, setActiveTab] = useState<ComplaintStatus>("CREATED");
  const [busyIds, setBusyIds] = useState<Record<string, boolean>>({});

  const grouped = useMemo(() => {
    const map: Record<ComplaintStatus, Complaint[]> = {
      CREATED: [],
      REVIEWED: [],
      ASSIGNED: [],
      WORK_IN_PROGRESS: [],
      RESOLVED: [],
      ARCHIVED: [],
      CANCELED: [],
      DELETED: [],
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

  const patchStatus = async (id: string, newStatus: ComplaintStatus) => {
    if (!serverUrl) {
      toast.error("Missing server URL");
      return;
    }
    setBusyIds((b) => ({ ...b, [id]: true }));
    try {
      const res = await axios.patch(
        `${serverUrl}/complaint/${id}?source=web`,
        { status: newStatus },
        { withCredentials: true }
      );
      const updated: Complaint | undefined = res?.data?.data;
      if (!updated) {
        toast.error("Update returned no data");
        return;
      }
      setComplaints((prev) => prev.map((c) => (c.id === id ? updated : c)));
      toast.success(`Status set to ${newStatus}`);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to update status");
    } finally {
      setBusyIds((b) => ({ ...b, [id]: false }));
    }
  };

  const permanentlyDelete = async (id: string) => {
    if (!serverUrl) {
      toast.error("Missing server URL");
      return;
    }
    if (!confirm("Delete permanently? This cannot be undone.")) return;
    setBusyIds((b) => ({ ...b, [id]: true }));
    try {
      await axios.delete(`${serverUrl}/complaint/${id}?source=web`, { withCredentials: true });
      setComplaints((prev) => prev.filter((c) => c.id !== id));
      toast.success("Deleted permanently");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Permanent delete failed");
    } finally {
      setBusyIds((b) => ({ ...b, [id]: false }));
    }
  };

  const moveNext = (c: Complaint) => {
    const idx = LIVE_STATUSES.indexOf(c.status);
    if (idx === -1 || c.status === "RESOLVED") {
      toast.message("Already at final step");
      return;
    }
    const next = LIVE_STATUSES[idx + 1];
    if (next) patchStatus(c.id, next);
  };

  const actionsFor = (c: Complaint) => {
    const busy = !!busyIds[c.id];
    return (
      <div className="flex flex-wrap gap-1">
        {c.status !== "RESOLVED" && (
          <Button className="p-2 m-2"  variant="secondary" disabled={busy} onClick={() => moveNext(c)}>
            Next
          </Button>
        )}
        {c.status !== "CREATED" && (
          <Button className="p-2 m-2"  size="xs" variant="outline" disabled={busy} onClick={() => patchStatus(c.id, "ARCHIVED")}>
            Archive
          </Button>
        )}
        <Button className="p-2 m-2" size="xs" variant="destructive" disabled={busy} onClick={() => patchStatus(c.id, "CANCELED")}>
          Cancel
        </Button>
        <Button className="p-2 m-2"  variant="ghost" disabled={busy} onClick={() => patchStatus(c.id, "DELETED")}>
          Delete
        </Button>
        {c.status === "DELETED" && (
          <Button size="xs" variant="destructive" disabled={busy} onClick={() => permanentlyDelete(c.id)}>
            Delete permanently
          </Button>
        )}
      </div>
    );
  };

  const renderList = (status: ComplaintStatus) => {
    const list = grouped[status] || [];
    if (list.length === 0) {
      return <div className="text-sm text-muted-foreground p-4">No complaints</div>;
    }
    return (
      <ScrollArea className="h-[65vh]">
        <div className="space-y-3 p-1">
          {list
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((c) => (
              <Card key={c.id} className="p-3 space-y-2 border border-muted/60">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{c.subject}</div>
                    <div className="text-xs text-muted-foreground">
                      {c.domain} • {c.anonymous ? "Anonymous" : c.complainer?.name || "User"}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded border text-xs font-medium shrink-0 ${statusColor(c.status)}`}>
                    {c.status.replaceAll("_", " ")}
                  </span>
                </div>
                <p className="text-xs line-clamp-3">{c.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">{new Date(c.createdAt).toLocaleString()}</span>
                  <div className="flex items-center gap-2">
                    <Link href={`/complaint/${c.id}`}>
                      <Button size="xs" className="p-2 m-2"  variant="outline">Details</Button>
                    </Link>
                    {actionsFor(c)}
                  </div>
                </div>
              </Card>
            ))}
        </div>
      </ScrollArea>
    );
  };

  const archivedCount = grouped.ARCHIVED.length;
  const canceledCount = grouped.CANCELED.length;
  const deletedCount = grouped.DELETED.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Admin Dashboard</h1>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/admin/archived">
            <Button size="sm" variant="secondary">Archived ({archivedCount})</Button>
          </Link>
          <Link href="/dashboard/admin/canceled">
            <Button size="sm" variant="secondary">Canceled ({canceledCount})</Button>
          </Link>
          <Link href="/dashboard/admin/deleted">
            <Button size="sm" variant="secondary">Deleted ({deletedCount})</Button>
          </Link>
          <Button size="sm" variant="outline" onClick={fetchAll} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ComplaintStatus)} className="w-full">
        <TabsList className="flex flex-wrap">
          {LIVE_STATUSES.map((s) => (
            <TabsTrigger key={s} value={s} className="text-xs">
              {s.replaceAll("_", " ")} ({grouped[s]?.length || 0})
            </TabsTrigger>
          ))}
        </TabsList>

        {LIVE_STATUSES.map((s) => (
          <TabsContent key={s} value={s} className="mt-4">
            {loading && s === activeTab ? <div className="p-4 text-sm">Loading...</div> : renderList(s)}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}