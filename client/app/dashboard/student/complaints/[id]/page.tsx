"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import type { Complaint } from "@/types/complaint";

export default function ComplaintDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id?.toString();
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      if (!serverUrl || !id) return;
      try {
        setLoading(true);
        const res = await axios.get(`${serverUrl}/complaint/${id}?source=web`, {
          withCredentials: true,
        });
        const data = res?.data?.data as Complaint | undefined;
        if (!data) {
          const msg = res?.data?.message || "Not found";
          toast.error(msg);
          setComplaint(null);
          return;
        }
        setComplaint(data);
      } catch (err) {
        const msg =
          axios.isAxiosError(err)
            ? err.response?.data?.message || err.response?.statusText || "Failed to load complaint"
            : "Failed to load complaint";
        toast.error(msg);
        setComplaint(null);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [id, serverUrl]);

  if (loading) return <div>Loading...</div>;
  if (!complaint) return <div>Complaint not found.</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Complaint details</h2>
      <div className="rounded-md border p-4 space-y-2">
        <div className="text-lg font-medium">{complaint.subject}</div>
        <div className="text-sm text-muted-foreground">
          {complaint.domain} • {complaint.status.replaceAll("_", " ")} •{" "}
          {new Date(complaint.createdAt).toLocaleString()}
        </div>
        <p className="whitespace-pre-wrap">{complaint.description}</p>
        {complaint.mediaLink ? (
          <div className="mt-2">
            <a
              className="text-blue-600 underline"
              href={complaint.mediaLink}
              target="_blank"
              rel="noreferrer"
            >
              View attachment
            </a>
          </div>
        ) : null}
      </div>

      <div className="rounded-md border">
        <div className="p-3 border-b font-medium">Responses</div>
        {complaint.responses.length === 0 ? (
          <div className="p-3 text-sm text-muted-foreground">No responses yet.</div>
        ) : (
          complaint.responses.map((r) => (
            <div key={r.id} className="p-3 border-b last:border-b-0">
              <div className="text-sm">{r.content}</div>
              <div className="text-xs text-muted-foreground">
                {r.responder?.name || "Unknown"} • {new Date(r.createdAt).toLocaleString()}
              </div>
              {r.mediaLink ? (
                <div className="mt-1">
                  <a
                    className="text-blue-600 underline text-xs"
                    href={r.mediaLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View attachment
                  </a>
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}