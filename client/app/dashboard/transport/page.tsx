"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  domain: string; // "TRANSPORT"
  anonymous: boolean;
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
  complainer?: { id: string; name: string };
}

const DOMAIN = "TRANSPORT";
const SHOW_STATUSES: ComplaintStatus[] = ["REVIEWED", "ASSIGNED", "WORK_IN_PROGRESS", "RESOLVED"];
const FLOW: ComplaintStatus[] = ["REVIEWED", "ASSIGNED", "WORK_IN_PROGRESS", "RESOLVED"];
const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

const statusColor = (s: ComplaintStatus) =>
  s === "REVIEWED"
    ? "bg-indigo-100 text-indigo-700 border-indigo-200"
    : s === "ASSIGNED"
    ? "bg-amber-100 text-amber-700 border-amber-200"
    : s === "WORK_IN_PROGRESS"
    ? "bg-purple-100 text-purple-700 border-purple-200"
    : s === "RESOLVED"
    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
    : "bg-gray-100 text-gray-700 border-gray-200";

export default function TransportHomePage() {
  const [loading, setLoading] = useState(false);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<ComplaintStatus>("REVIEWED");

  const fetchAll = async () => {
    if (!serverUrl) return toast.error("Missing server URL");
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

  const grouped = useMemo(() => {
    const by: Record<ComplaintStatus, Complaint[]> = {
      REVIEWED: [],
      ASSIGNED: [],
      WORK_IN_PROGRESS: [],
      RESOLVED: [],
      CREATED: [],
      ARCHIVED: [],
      CANCELED: [],
      DELETED: [],
    };
    complaints
      .filter((c) => c.domain === DOMAIN && SHOW_STATUSES.includes(c.status))
      .forEach((c) => by[c.status].push(c));
    SHOW_STATUSES.forEach((s) =>
      by[s].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    );
    return by;
  }, [complaints]);

  const moveNext = async (c: Complaint) => {
    if (!serverUrl) return toast.error("Missing server URL");
    const idx = FLOW.indexOf(c.status);
    if (idx === -1 || c.status === "RESOLVED") return;
    const next = FLOW[idx + 1];
    if (!next) return;
    setBusy((b) => ({ ...b, [c.id]: true }));
    try {
      const res = await axios.patch(
        `${serverUrl}/complaint/${c.id}?source=web`,
        { status: next },
        { withCredentials: true }
      );
      const updated: Complaint | undefined = res?.data?.data;
      if (!updated) return toast.error("Update returned no data");
      setComplaints((prev) => prev.map((x) => (x.id === c.id ? updated : x)));
      toast.success(`Moved to ${next}`);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to update status");
    } finally {
      setBusy((b) => ({ ...b, [c.id]: false }));
    }
  };

  const renderColumn = (status: ComplaintStatus) => {
    const list = grouped[status] || [];
    if (loading && status === activeTab) return <div className="p-4 text-sm">Loading...</div>;
    if (list.length === 0) return <div className="p-4 text-sm text-muted-foreground">No complaints.</div>;
    return (
      <ScrollArea className="h-[70vh]">
        <div className="space-y-3">
          {list.map((c) => (
            <Card key={c.id} className="p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-medium truncate">{c.subject}</div>
                  <div className="text-xs text-muted-foreground">
                    {c.anonymous ? "Anonymous" : c.complainer?.name || "User"}
                  </div>
                </div>
                <span className={`px-2 py-1 rounded border text-xs font-medium ${statusColor(c.status)}`}>
                  {c.status.replaceAll("_", " ")}
                </span>
              </div>
              <p className="text-xs line-clamp-3">{c.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">
                  {new Date(c.createdAt).toLocaleString()}
                </span>
                <div className="flex items-center gap-2">
                  <Link href={`/complaint/${c.id}`}>
                    <Button className="p-2 m-2" size="xs" variant="outline">
                      View details
                    </Button>
                  </Link>
                  <Button
                    className="p-2 m-2"
                    size="xs"
                    variant="secondary"
                    disabled={busy[c.id] || c.status === "RESOLVED"}
                    onClick={() => moveNext(c)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Transport • Kanban</h1>
        <Button className="p-2 m-2" size="sm" variant="outline" onClick={fetchAll} disabled={loading}>
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ComplaintStatus)} className="w-full">
        <TabsList className="flex flex-wrap">
          {SHOW_STATUSES.map((s) => (
            <TabsTrigger key={s} value={s} className="text-xs">
              {s.replaceAll("_", " ")} ({grouped[s]?.length || 0})
            </TabsTrigger>
          ))}
        </TabsList>
        {SHOW_STATUSES.map((s) => (
          <TabsContent key={s} value={s} className="mt-4">
            {renderColumn(s)}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}