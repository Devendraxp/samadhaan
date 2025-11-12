"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const DOMAIN = "CLEANING";
const TYPES = ["ALERT", "UPDATE", "ANNOUNCEMENT"] as const;

export default function NewCleaningNotificationPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [type, setType] = useState<typeof TYPES[number] | "">("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !type || !description) {
      toast.error("Fill all fields.");
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("domain", DOMAIN);
      fd.append("type", type);
      fd.append("description", description);
      if (file) fd.append("file", file);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/notification?source=web`,
        fd,
        { withCredentials: true }
      );
      if (res?.data?.data?.id) {
        toast.success("Created");
        router.push("/dashboard/cleaning/notifications");
      } else toast.error("Unexpected response.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || "Failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <button onClick={() => router.back()} className="mb-4 text-sm text-sky-600 hover:underline">
        ← Back
      </button>
      <h1 className="text-xl font-semibold mb-4">New {DOMAIN} Notification</h1>
      <form onSubmit={submit} className="space-y-4">
        <input
          className="w-full rounded border px-3 py-2 text-sm"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input disabled value={DOMAIN} className="w-full rounded border px-3 py-2 text-sm bg-zinc-100" />
          <select
            className="w-full rounded border px-3 py-2 text-sm"
            value={type}
            onChange={(e) => setType(e.target.value as typeof TYPES[number])}
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
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block text-sm"
        />
        <button
          disabled={submitting}
          className="px-4 py-2 rounded bg-sky-600 text-white text-sm hover:bg-sky-700 disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Create"}
        </button>
      </form>
    </div>
  );
}