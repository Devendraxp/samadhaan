"use client";

import React, { ReactNode, useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { type DashboardLink, DashboardSidebar } from "@/components/dashboard-sidebar";
import { Home, User, ClipboardList, Bell } from "lucide-react";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: string; // e.g. "STUDENT"
  image?: string;
};

const studentIcon = "https://cdn-icons-png.flaticon.com/512/3625/3625049.png";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

  useEffect(() => {
    const run = async () => {
      try {
        const res = await axios.get(`${serverUrl}/user/profile?source=web`, {
          withCredentials: true,
        });

        const profile: UserProfile =
          res?.data?.data?.user || res?.data?.data || res?.data;

        if (!profile?.role) throw new Error("Failed to load profile");

        const role = String(profile.role).toUpperCase();

        if (role !== "STUDENT") {
          toast.info(`Redirecting to ${role} dashboard`);
          router.replace(`/dashboard/${role.toLowerCase()}`);
          return;
        }

        setUser({
          ...profile,
          image: studentIcon,
        });
      } catch (err: unknown) {
        const msg =
          axios.isAxiosError(err)
            ? err.response?.data?.message ||
              err.response?.statusText ||
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


type IconMap = { [k: string]: ReactNode };

const icons: IconMap = {
  home: <Home className="size-4" />,
  user: <User className="size-4" />,
  complaints: <ClipboardList className="size-4" />,
  notifications: <Bell className="size-4" />,
};

  const links: DashboardLink[] = [
    { href: "/dashboard/student", name: "Home", icon: icons.home },
    { href: "/dashboard/student/profile", name: "Profile", icon: icons.user },
    { href: "/dashboard/student/complaints", name: "My complaints", icon: icons.complaints },
    { href: "/dashboard/student/notifications", name: "Notifications", icon: icons.notifications },
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
        user={{ name: user.name, role: "student", image: user.image || studentIcon }}
        links={links}
      />
      <main className="flex-1 p-4 md:p-6">{children}</main>
    </div>
  );
}