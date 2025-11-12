"use client";

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
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
const ROLES: UserRole[] = ["STUDENT", "ADMIN", "MESS", "INTERNET", "CLEANING", "WATER", "TRANSPORT"];

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

export default function NewAccountPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("STUDENT");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serverUrl) return toast.error("Missing server URL");
    if (!email || !name || !password) return toast.error("Name, email and password are required");
    try {
      setBusy(true);
      await axios.post(
        `${serverUrl}/user?source=web`,
        { name, email, role, password },
        { withCredentials: true }
      );
      toast.success("Account created");
      router.replace("/dashboard/admin/accounts");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to create account");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold mb-4">Create Account</h1>
      <Card className="p-4">
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Strong password" />
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
          <div className="flex gap-2">
            <Button type="submit" disabled={busy}>Create</Button>
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={busy}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}