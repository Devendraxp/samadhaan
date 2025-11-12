"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
};

const studentIcon = "https://cdn-icons-png.flaticon.com/512/3625/3625049.png";

export default function StudentProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

  useEffect(() => {
    const run = async () => {
      if (!serverUrl) {
        toast.error("Missing NEXT_PUBLIC_SERVER_URL");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await axios.get(`${serverUrl}/user/profile?source=web`, {
          withCredentials: true,
        });
        const profile = res?.data?.data?.user || res?.data?.data || res?.data;
        if (!profile?.role) {
          toast.error("Failed to load profile");
          setUser(null);
          return;
        }
        setUser({
          id: profile.id,
          name: profile.name,
          email: profile.email,
            role: String(profile.role),
          image: profile.image || studentIcon,
        });
      } catch (err) {
        const msg = axios.isAxiosError(err)
          ? err.response?.data?.message || err.response?.statusText || "Failed to load profile"
          : "Failed to load profile";
        toast.error(msg);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [serverUrl]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Profile not found.</div>;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold">My Profile</h1>
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.image} alt={user.name} />
            <AvatarFallback>{user.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-lg font-medium">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-xs uppercase text-muted-foreground">User ID</p>
            <p className="text-sm font-mono break-all">{user.id}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase text-muted-foreground">Role</p>
            <p className="text-sm">{user.role}</p>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          This profile is read-only. Contact administration to request changes.
        </div>
      </Card>
    </div>
  );
}