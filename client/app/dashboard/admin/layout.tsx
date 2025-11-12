"use client";

import React, { ReactNode, useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { type DashboardLink, DashboardSidebar } from "@/components/dashboard-sidebar";
import { Home, ListCheck, Archive, Ban, Trash2, Bell, Users } from "lucide-react";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: string; // "ADMIN"
  image?: string;
};

const adminIcon = "/user.png";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

  useEffect(() => {
    const run = async () => {
      try {
        if (!serverUrl) throw new Error("Missing server URL");
        const res = await axios.get(`${serverUrl}/user/profile?source=web`, {
          withCredentials: true,
        });

        const profile: UserProfile =
          res?.data?.data?.user || res?.data?.data || res?.data;

        if (!profile?.role) throw new Error("Failed to load profile");

        const role = String(profile.role).toUpperCase();

        if (role !== "ADMIN") {
          toast.info(`Redirecting to ${role} dashboard`);
          router.replace(`/dashboard/${role.toLowerCase()}`);
          return;
        }

        setUser({ ...profile, image: adminIcon });
      } catch (err: unknown) {
        const msg =
          axios.isAxiosError(err)
            ? err.response?.data?.message ||
              err.response?.statusText ||
              err.message ||
              "Unable to load profile"
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
    { href: "/dashboard/admin", name: "Complaints", icon: <ListCheck className="size-4" /> },
    { href: "/dashboard/admin/notifications", name: "Notifications", icon: <Bell className="size-4" /> },
    { href: "/dashboard/admin/accounts", name: "Accounts", icon: <Users className="size-4" /> },
    { href: "/dashboard/admin/archived", name: "Archived", icon: <Archive className="size-4" /> },
    { href: "/dashboard/admin/canceled", name: "Canceled", icon: <Ban className="size-4" /> },
    { href: "/dashboard/admin/deleted", name: "Deleted", icon: <Trash2 className="size-4" /> },
  ];

  if (loading) {
    return <main className="flex-1 p-4 md:p-6">Loading...</main>;
  }

  if (!user) {
    return <main className="flex-1 p-4 md:p-6">No user found</main>;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <DashboardSidebar
        user={{ name: user.name, role: "admin", image: user.image || adminIcon }}
        links={links}
      />
      <main className="flex-1 p-4 md:p-6">{children}</main>
    </div>
  );
}
