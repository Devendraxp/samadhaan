"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { toast } from "sonner";

type Notification = {
  id: string;
  title: string;
  description: string;
  domain: string | null;
  type: string;
  mediaLink?: string | null;
  createdAt: string;
};

const DOMAIN = "INTERNET";

export default function InternetNotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/notification/domain/${DOMAIN}?source=web`,
        { withCredentials: true }
      );
      if (Array.isArray(res?.data?.data)) {
        setItems(res.data.data);
        setError(null);
      } else {
        const msg = "Unexpected response.";
        setError(msg);
        toast.error(msg);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || "Failed.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">{DOMAIN} Notifications</h1>
        <Link
          href="/dashboard/internet/notifications/new"
          className="px-3 py-1.5 text-sm rounded bg-sky-600 text-white hover:bg-sky-700"
        >
          + New
        </Link>
      </div>
      {loading ? (
        <div className="text-sm text-zinc-600">Loading…</div>
      ) : error ? (
        <div className="text-sm text-red-600">{error}</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-zinc-600">No notifications.</div>
      ) : (
        <div className="space-y-3">
          {items.map((n) => (
            <div key={n.id} className="border rounded p-4 flex justify-between gap-4">
              <div className="min-w-0">
                <div className="font-medium">{n.title}</div>
                <div className="text-xs text-zinc-600">
                  {n.type} • {new Date(n.createdAt).toLocaleString()}
                </div>
                <div className="mt-2 text-sm text-zinc-700 line-clamp-2">{n.description}</div>
              </div>
              <div className="flex flex-col gap-2">
                <Link
                  href={`/dashboard/internet/notifications/${n.id}`}
                  className="px-3 py-1.5 text-xs rounded bg-zinc-100 hover:bg-zinc-200"
                >
                  View
                </Link>
                <Link
                  href={`/dashboard/internet/notifications/${n.id}/edit`}
                  className="px-3 py-1.5 text-xs rounded bg-zinc-100 hover:bg-zinc-200"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}