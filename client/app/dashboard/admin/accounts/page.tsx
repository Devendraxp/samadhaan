"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type UserRole = "STUDENT" | "ADMIN" | "MESS" | "INTERNET" | "CLEANING" | "WATER" | "TRANSPORT";
type AccountStatus = "ACTIVE" | "VIEW_ONLY" | "DEACTIVATED" | "DELETED";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
}

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

export default function AdminAccountsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const fetchUsers = async () => {
    if (!serverUrl) {
      toast.error("Missing server URL");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get(`${serverUrl}/user?source=web`, { withCredentials: true });
      const payload = res?.data?.data || res?.data;
      if (!Array.isArray(payload)) throw new Error("Unexpected users response");
      setUsers(payload);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    if (!q) return users;
    const term = q.toLowerCase();
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(term) ||
        (u.name || "").toLowerCase().includes(term) ||
        u.role.toLowerCase().includes(term) ||
        u.status.toLowerCase().includes(term)
    );
  }, [q, users]);

  const onDelete = async (id: string) => {
    if (!serverUrl) return toast.error("Missing server URL");
    if (!confirm("Delete this account?")) return;
    try {
      await axios.delete(`${serverUrl}/user/${id}?source=web`, { withCredentials: true });
      toast.success("Account deleted");
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to delete account");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Accounts</h1>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search by name, email, role, status"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-64"
          />
          <Link href="/dashboard/admin/accounts/new">
            <Button>Create account</Button>
          </Link>
          <Button variant="outline" onClick={fetchUsers} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="p-4 text-sm">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="p-4 text-sm text-muted-foreground">No accounts found</div>
      ) : (
        <div className="grid gap-3">
          {filtered
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((u) => (
              <Card key={u.id} className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium truncate">{u.name || "Unnamed"}</div>
                  <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary">{u.role}</Badge>
                    <Badge variant={u.status === "ACTIVE" ? "default" : "outline"}>{u.status}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/dashboard/admin/accounts/${u.id}`}>
                    <Button variant="outline" size="sm">Edit</Button>
                  </Link>
                  <Button variant="destructive" size="sm" onClick={() => onDelete(u.id)}>
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}