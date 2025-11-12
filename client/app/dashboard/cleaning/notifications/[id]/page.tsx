"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

const DOMAIN = "CLEANING";

type Notification = {
  id: string;
  title: string;
  description: string;
  domain: string | null;
  type: string;
  mediaLink?: string | null;
  createdAt: string;
};

export default function CleaningNotificationDetailPage() {
  const { id } = useParams() as { id?: string };
  const router = useRouter();
  const [item, setItem] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/notification/${id}?source=web`,
          { withCredentials: true }
        );
        const data = res?.data?.data;
        if (data && mounted) {
          if (data.domain?.toUpperCase() !== DOMAIN) {
            toast.error("Domain mismatch.");
            router.replace("/dashboard/cleaning/notifications");
            return;
          }
          setItem(data);
        } else toast.error("Not found.");
      } catch (err: any) {
        toast.error(err?.response?.data?.message || err.message || "Load failed.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [id, router]);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <button onClick={() => router.back()} className="mb-4 text-sm text-sky-600 hover:underline">
        ← Back
      </button>
      {loading ? (
        <div className="text-sm text-zinc-600">Loading…</div>
      ) : !item ? (
        <div className="text-sm text-zinc-600">Not found.</div>
      ) : (
        <div className="border rounded p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-2xl font-semibold">{item.title}</h2>
            <Link
              href={`/dashboard/cleaning/notifications/${item.id}/edit`}
              className="px-3 py-1.5 text-xs rounded bg-zinc-100 hover:bg-zinc-200"
            >
              Edit
            </Link>
          </div>
          <div className="text-sm text-zinc-600 mt-1">
            Domain: {DOMAIN} • Type: {item.type} • {new Date(item.createdAt).toLocaleString()}
          </div>
          <div className="prose mt-4 whitespace-pre-wrap text-zinc-800">{item.description}</div>
          {item.mediaLink ? (
            <div className="mt-4">
              <img src={item.mediaLink} alt="media" className="max-w-full rounded" />
            </div>
          ) : null}
          <div className="mt-6">
            <Link
              href="/dashboard/cleaning/notifications"
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