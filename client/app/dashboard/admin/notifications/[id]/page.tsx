"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
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

export default function AdminNotificationDetailPage() {
  const { id } = useParams() as { id?: string };
  const router = useRouter();
  const [item, setItem] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      const msg = "Missing notification id.";
      setError(msg);
      toast.error(msg);
      setLoading(false);
      return;
    }
    let mounted = true;
    const fetchOne = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/notification/${id}?source=web`,
          { withCredentials: true }
        );
        if (!mounted) return;
        if (res?.data?.data) {
          setItem(res.data.data);
          setError(null);
        } else {
          const msg = "Unexpected response shape.";
            setError(msg);
          toast.error(msg);
        }
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          err.message ||
          "Failed to load notification.";
        setError(msg);
        toast.error(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchOne();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm("Delete this notification?")) return;
    setDeleting(true);
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/notification/${id}?source=web`,
        { withCredentials: true }
      );
      toast.success("Deleted");
      router.push("/dashboard/admin/notifications");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err.message || "Delete failed.";
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <button
        onClick={() => router.back()}
        className="mb-4 text-sm text-sky-600 hover:underline"
      >
        ← Back
      </button>

      {loading ? (
        <div className="text-sm text-zinc-600">Loading…</div>
      ) : error ? (
        <div className="text-sm text-red-600">Failed: {error}</div>
      ) : !item ? (
        <div className="text-sm text-zinc-600">Not found.</div>
      ) : (
        <div className="border rounded p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-2xl font-semibold">{item.title}</h2>
            <div className="flex gap-2">
              <Link
                href={`/dashboard/admin/notifications/${item.id}/edit`}
                className="px-3 py-1.5 text-xs rounded bg-zinc-100 hover:bg-zinc-200"
              >
                Edit
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-3 py-1.5 text-xs rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
          <div className="text-sm text-zinc-600 mt-1">
            Domain: {item.domain} • Type: {item.type} •{" "}
            {new Date(item.createdAt).toLocaleString()}
          </div>
          <div className="prose mt-4 whitespace-pre-wrap text-zinc-800">
            {item.description}
          </div>
          {item.mediaLink ? (
            <div className="mt-4">
              <img
                src={item.mediaLink}
                alt="notification media"
                className="max-w-full rounded"
              />
            </div>
          ) : null}
          <div className="mt-6">
            <Link
              href="/dashboard/admin/notifications"
              className="inline-flex items-center px-3 py-1.5 bg-zinc-100 rounded hover:bg-zinc-200 text-sm"
            >
              Back to list
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}