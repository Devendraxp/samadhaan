"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import type { Complaint, ComplaintStatus } from "@/types/complaint";

type Grouped = Record<ComplaintStatus, Complaint[]>;

const STATUSES: ComplaintStatus[] = [
  "CREATED",
  "REVIEWED",
  "ASSIGNED",
  "WORK_IN_PROGRESS",
  "RESOLVED",
  "ARCHIVED",
  "CANCELED",
  "DELETED",
];

export const useComplaints = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

  const fetchAll = useCallback(async () => {
    if (!serverUrl) {
      const msg = "Missing NEXT_PUBLIC_SERVER_URL";
      setError(msg);
      toast.error(msg);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${serverUrl}/complaint/me?source=web`, {
        withCredentials: true,
      });
      const data = res?.data?.data as Complaint[] | undefined;
      if (!Array.isArray(data)) {
        const msg = res?.data?.message || "Unexpected response from server";
        setError(msg);
        toast.error(msg);
        setComplaints([]);
        return;
      }
      setComplaints(data);
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message ||
          err.response?.statusText ||
          "Failed to fetch complaints"
        : "Failed to fetch complaints";
      setError(msg);
      toast.error(msg);
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  }, [serverUrl]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const grouped: Grouped = useMemo(() => {
    const base: Grouped = Object.fromEntries(
      STATUSES.map((s) => [s, []])
    ) as unknown as Grouped;
    for (const c of complaints) {
      if (!base[c.status]) {
        base[c.status] = [];
      }
      base[c.status].push(c);
    }
    return base;
  }, [complaints]);

  const byStatus = useCallback(
    (status: ComplaintStatus) => complaints.filter((c) => c.status === status),
    [complaints]
  );

  return { complaints, grouped, byStatus, loading, error, refetch: fetchAll };
};
