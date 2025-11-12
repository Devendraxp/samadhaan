"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { toast } from "sonner";

type Notification = {
  id: string;
  userId: string;
  title: string;
  description: string;
  domain: string;
  type: string;
  mediaLink?: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/notification?source=web`,
          { withCredentials: true }
        );
        if (!mounted) return;
        if (res?.data?.data && Array.isArray(res.data.data)) {
          setItems(res.data.data);
          setError(null);
        } else {
          const msg = "Unexpected response shape from server.";
          setError(msg);
          toast.error(msg);
        }
      } catch (err: any) {
        console.error(err);
        const msg = err?.response?.data?.message || err.message || "Failed to load notifications.";
        setError(msg);
        toast.error(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchNotifications();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Notifications</h1>

      {loading ? (
        <div className="text-sm text-zinc-600">Loading notifications…</div>
      ) : error ? (
        <div className="text-sm text-zinc-600">Failed to load notifications.</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-zinc-600">No notifications found.</div>
      ) : (
        <div className="grid gap-4">
          {items.map((n) => (
            <div
              key={n.id}
              className="p-4 border rounded shadow-sm flex justify-between items-start"
            >
              <div className="pr-4">
                <div className="text-lg font-medium">{n.title}</div>
                <div className="text-sm text-zinc-600">
                  {n.domain} • {new Date(n.createdAt).toLocaleString()}
                </div>
                <div className="mt-2 text-sm text-zinc-700 line-clamp-3">
                  {n.description}
                </div>
              </div>

              <div className="ml-4 flex-shrink-0">
                <Link
                  href={`/dashboard/student/notifications/${n.id}`}
                  className="inline-flex items-center px-3 py-1.5 bg-sky-600 text-white rounded hover:bg-sky-700"
                >
                  View details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}