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

export default function NotificationDetailPage() {
  const params = useParams() as { id?: string };
  const router = useRouter();
  const id = params?.id;
  const [item, setItem] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);
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
          const msg = "Unexpected response shape from server.";
          setError(msg);
          toast.error(msg);
        }
      } catch (err: any) {
        console.error(err);
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

  return (
    <div className="container mx-auto p-4">
      <button
        onClick={() => router.back()}
        className="mb-4 text-sm text-sky-600 hover:underline"
      >
        ← Back
      </button>

      {loading ? (
        <div className="text-sm text-zinc-600">Loading…</div>
      ) : error ? (
        <div className="text-sm text-zinc-600">Failed to load.</div>
      ) : !item ? (
        <div className="text-sm text-zinc-600">Notification not found.</div>
      ) : (
        <div className="max-w-3xl p-6 border rounded shadow-sm">
          <h2 className="text-2xl font-semibold mb-2">{item.title}</h2>
          <div className="text-sm text-zinc-600 mb-4">
            Domain: {item.domain} • Type: {item.type} •{" "}
            {new Date(item.createdAt).toLocaleString()}
          </div>

          <div className="prose mb-4 text-zinc-800 whitespace-pre-wrap">
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
              href="/notifications"
              className="inline-flex items-center px-3 py-1.5 bg-zinc-100 rounded hover:bg-zinc-200 text-sm"
            >
              Back to notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}