"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

const DOMAINS = ["MESS", "INTERNET", "CLEANING", "WATER", "TRANSPORT"] as const;
const TYPES = ["ALERT", "UPDATE", "ANNOUNCEMENT"] as const;

type Notification = {
  id: string;
  title: string;
  description: string;
  domain: string | null;
  type: string;
  mediaLink?: string | null;
};

export default function EditNotificationPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<Notification | null>(null);

  const [title, setTitle] = useState("");
  const [domain, setDomain] = useState<typeof DOMAINS[number] | "">("");
  const [type, setType] = useState<typeof TYPES[number] | "">("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/notification/${id}?source=web`,
          { withCredentials: true }
        );
        const data = res?.data?.data as Notification | undefined;
        if (data && mounted) {
          setItem(data);
          setTitle(data.title || "");
          setDomain(
            (data.domain?.toUpperCase() as typeof DOMAINS[number]) || ""
          );
          setType((data.type?.toUpperCase() as typeof TYPES[number]) || "");
          setDescription(data.description || "");
        } else {
          toast.error("Not found.");
        }
      } catch (err: any) {
        const msg =
          err?.response?.data?.message || err.message || "Load failed.";
        toast.error(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !domain || !type || !description) {
      toast.error("Fill all fields.");
      return;
    }
    setSaving(true);
    try {
      // Update uses JSON body (PUT route doesn't accept file upload middleware)
      const body = {
        title,
        domain,
        type,
        description,
      };
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/notification/${id}?source=web`,
        body,
        { withCredentials: true }
      );
      if (res?.data?.data?.id) {
        toast.success("Updated");
        router.push("/dashboard/admin/notifications");
      } else {
        toast.error("Unexpected response.");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err.message || "Update failed.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4 text-sm text-zinc-600">Loading…</div>;
  if (!item) return <div className="p-4 text-sm text-zinc-600">Not found.</div>;

  return (
    <div className="max-w-xl mx-auto p-4">
      <button
        onClick={() => router.back()}
        className="mb-4 text-sm text-sky-600 hover:underline"
      >
        ← Back
      </button>
      <h1 className="text-xl font-semibold mb-4">Edit Notification</h1>
      <form onSubmit={handleSave} className="space-y-4">
        <input
          className="w-full rounded border px-3 py-2 text-sm"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            className="w-full rounded border px-3 py-2 text-sm"
            value={domain}
            onChange={(e) =>
              setDomain((e.target.value.toUpperCase() as typeof DOMAINS[number]) || "")
            }
          >
            <option value="">Select domain</option>
            {DOMAINS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            className="w-full rounded border px-3 py-2 text-sm"
            value={type}
            onChange={(e) =>
              setType((e.target.value.toUpperCase() as typeof TYPES[number]) || "")
            }
          >
            <option value="">Select type</option>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <textarea
          className="w-full rounded border px-3 py-2 text-sm min-h-40"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
        />

        {item.mediaLink ? (
          <div className="text-xs">
            Current media:
            <img
              src={item.mediaLink}
              alt="current"
              className="mt-2 h-24 w-auto rounded object-cover"
            />
          </div>
        ) : null}

        {/* Media update not supported on PUT route without upload middleware */}

        <button
          disabled={saving}
          className="px-4 py-2 rounded bg-sky-600 text-white text-sm hover:bg-sky-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}