"use client";

import React, { ReactNode, useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { type DashboardLink, DashboardSidebar } from "@/components/dashboard-sidebar";
import { Home, User, Bell } from "lucide-react";

type UserProfile = { id: string; name: string; email: string; role: string; image?: string };
const staffIcon = "/user.png";

export default function InternetLayout({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

  useEffect(() => {
    const run = async () => {
      try {
        if (!serverUrl) throw new Error("Missing server URL");
        const res = await axios.get(`${serverUrl}/user/profile?source=web`, { withCredentials: true });
        const profile: UserProfile = res?.data?.data?.user || res?.data?.data || res?.data;
        if (!profile?.role) throw new Error("Failed to load profile");
        const role = String(profile.role).toUpperCase();
        if (role !== "INTERNET") {
          toast.info(`Redirecting to ${role} dashboard`);
          router.replace(`/dashboard/${role.toLowerCase()}`);
          return;
        }
        setUser({ ...profile, image: staffIcon });
      } catch (err: unknown) {
        const msg = axios.isAxiosError(err)
          ? err.response?.data?.message || err.response?.statusText || err.message || "Unable to load profile"
          : "Unable to load profile";
        toast.error(msg);
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const links: DashboardLink[] = [
    { href: "/dashboard/internet", name: "Home", icon: <Home className="size-4" /> },
    { href: "/dashboard/internet/notifications", name: "Notifications", icon: <Bell className="size-4" /> },
];

  if (loading) return <main className="flex-1 p-4 md:p-6">Loading...</main>;
  if (!user) return <main className="flex-1 p-4 md:p-6">No user found</main>;

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <DashboardSidebar user={{ name: user.name, role: "internet", image: user.image || staffIcon }} links={links} />
      <main className="flex-1 p-4 md:p-6">{children}</main>
    </div>
  );
}