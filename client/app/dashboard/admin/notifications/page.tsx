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

export default function AdminNotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/notification?source=web`,
        { withCredentials: true }
      );
      if (Array.isArray(res?.data?.data)) {
        setItems(res.data.data);
        setError(null);
      } else {
        const msg = "Unexpected response shape.";
        setError(msg);
        toast.error(msg);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err.message || "Failed loading notifications.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this notification?")) return;
    setDeletingId(id);
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/notification/${id}?source=web`,
        { withCredentials: true }
      );
      toast.success("Deleted");
      setItems((prev) => prev.filter((n) => n.id !== id));
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err.message || "Delete failed.";
      toast.error(msg);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Manage Notifications</h1>
        <Link
          href="/dashboard/admin/notifications/new"
          className="px-4 py-2 rounded bg-sky-600 text-white text-sm hover:bg-sky-700"
        >
          + New Notification
        </Link>
      </div>

      {loading ? (
        <div className="text-sm text-zinc-600">Loading…</div>
      ) : error ? (
        <div className="text-sm text-red-600">{error}</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-zinc-600">No notifications yet.</div>
      ) : (
        <div className="space-y-3">
          {items.map((n) => (
            <div
              key={n.id}
              className="border rounded p-4 flex justify-between gap-4"
            >
              <div className="min-w-0">
                <div className="font-medium">{n.title}</div>
                <div className="text-xs text-zinc-600">
                  {n.domain} • {n.type} • {new Date(n.createdAt).toLocaleString()}
                </div>
                <div className="mt-2 text-sm text-zinc-700 line-clamp-2">
                  {n.description}
                </div>
                {n.mediaLink ? (
                  <div className="mt-2">
                    <img
                      src={n.mediaLink}
                      alt="media"
                      className="h-20 w-auto rounded object-cover"
                    />
                  </div>
                ) : null}
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <Link
                  href={`/dashboard/admin/notifications/${n.id}/edit`}
                  className="px-3 py-1.5 text-xs rounded bg-zinc-100 hover:bg-zinc-200"
                >
                  Edit
                </Link>
                <button
                  disabled={deletingId === n.id}
                  onClick={() => handleDelete(n.id)}
                  className="px-3 py-1.5 text-xs rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {deletingId === n.id ? "Deleting…" : "Delete"}
                </button>
                <Link
                  href={`/dashboard/student/notifications/${n.id}`}
                  className="px-3 py-1.5 text-xs rounded bg-sky-600 text-white hover:bg-sky-700"
                >
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}