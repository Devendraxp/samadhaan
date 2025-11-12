"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type UserRole = "STUDENT" | "ADMIN" | "MESS" | "INTERNET" | "CLEANING" | "WATER" | "TRANSPORT";
type AccountStatus = "ACTIVE" | "VIEW_ONLY" | "DEACTIVATED" | "DELETED";

const ROLES: UserRole[] = ["STUDENT", "ADMIN", "MESS", "INTERNET", "CLEANING", "WATER", "TRANSPORT"];
const STATUSES: AccountStatus[] = ["ACTIVE", "VIEW_ONLY", "DEACTIVATED", "DELETED"];

interface User {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  status: AccountStatus;
}

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

export default function EditAccountPage() {
  const router = useRouter();
  const params = useParams() as { id: string };
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("STUDENT");
  const [status, setStatus] = useState<AccountStatus>("ACTIVE");
  const [password, setPassword] = useState("");

  const loadUser = async () => {
    if (!serverUrl) return toast.error("Missing server URL");
    try {
      setLoading(true);
      const res = await axios.get(`${serverUrl}/user/${id}?source=web`, { withCredentials: true });
      const u: User = res?.data?.data?.user || res?.data?.data || res?.data;
      if (!u?.id) throw new Error("User not found");
      setName(u.name || "");
      setEmail(u.email);
      setRole(u.role);
      setStatus(u.status);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to load account");
      router.replace("/dashboard/admin/accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serverUrl) return toast.error("Missing server URL");
    try {
      setSaving(true);
      // Only send password if provided
      const body: any = { name, email, role, status };
      if (password) body.password = password;
      const res = await axios.patch(`${serverUrl}/user/${id}?source=web`, body, { withCredentials: true });
      const u = res?.data?.data?.user || res?.data?.data || res?.data;
      if (!u?.id) throw new Error("Unexpected response");
      toast.success("Account updated");
      router.replace("/dashboard/admin/accounts");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to update account");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!serverUrl) return toast.error("Missing server URL");
    if (!confirm("Delete this account?")) return;
    try {
      await axios.delete(`${serverUrl}/user/${id}?source=web`, { withCredentials: true });
      toast.success("Account deleted");
      router.replace("/dashboard/admin/accounts");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to delete account");
    }
  };

  if (loading) return <div className="p-4 text-sm">Loading...</div>;

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold mb-4">Edit Account</h1>
      <Card className="p-4">
        <form className="space-y-4" onSubmit={onSave}>
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" />
          </div>
          <div className="space-y-2">
            <Label>New password (optional)</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep current" />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v: UserRole) => setRole(v)}>
              <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v: AccountStatus) => setStatus(v)}>
              <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>Save</Button>
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={saving}>
              Cancel
            </Button>
            <div className="flex-1" />
            <Button type="button" variant="destructive" onClick={onDelete} disabled={saving}>
              Delete
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}