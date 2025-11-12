"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun, Menu, X } from "lucide-react";
import { useTheme } from "next-themes";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  // auth state
  const [authed, setAuthed] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const checkAuth = async () => {
      if (!serverUrl) return;
      try {
        const res = await axios.get(`${serverUrl}/user/profile?source=web`, {
          withCredentials: true,
        });
        const profile = res?.data?.data?.user || res?.data?.data || res?.data;
        if (profile?.role) {
          setAuthed(true);
          setRole(String(profile.role));
        } else {
          setAuthed(false);
          setRole(null);
        }
      } catch {
        setAuthed(false);
        setRole(null);
      }
    };
    checkAuth();
  }, [serverUrl]);

  const dashboardHref = useMemo(() => {
    return role ? `/dashboard/${String(role).toLowerCase()}` : "/dashboard";
  }, [role]);

  const handleLogout = async () => {
    if (!serverUrl) {
      toast.error("Missing NEXT_PUBLIC_SERVER_URL");
      return;
    }
    try {
      await axios.post(`${serverUrl}/user/logout?source=web`, null, { withCredentials: true });
    } catch {
      try {
        await axios.post(`${serverUrl}/auth/logout?source=web`, null, { withCredentials: true });
      } catch (err) {
        const msg = axios.isAxiosError(err)
          ? err.response?.data?.message || err.response?.statusText || "Failed to logout"
          : "Failed to logout";
        toast.error(msg);
      }
    } finally {
      setAuthed(false);
      setRole(null);
      toast.success("Logged out");
      router.push("/login");
      router.refresh();
    }
  };

  if (!mounted) return null;

  return (
    <header className="relative z-50">
      {/* Navbar */}
      <nav className="bg-background/80 supports-[backdrop-filter]:bg-background/60 backdrop-blur border-b border-border">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">Samadhaan</span>
          </Link>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {authed ? (
              <>
                <Button asChild variant="outline" className="hidden md:inline-flex">
                  <Link href={dashboardHref}>Dashboard</Link>
                </Button>
                <Button variant="ghost" className="hidden md:inline-flex" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="outline" className="hidden md:inline-flex">
                  <Link href="/signup">SignUp</Link>
                </Button>
                <Button asChild variant="ghost" className="hidden md:inline-flex">
                  <Link href="/login">Log In</Link>
                </Button>
              </>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setOpen(o => !o)}
              aria-label="Toggle menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        {/* Mobile sheet */}
        {open && (
          <div className="md:hidden border-t border-border bg-background px-4 pb-4 space-y-3">
            <Link href="#product" className="block py-2">Product</Link>
            <Link href="#about" className="block py-2">About</Link>
            <Link href="#resources" className="block py-2">Resources</Link>
            <Link href="#contact" className="block py-2">Contact</Link>
            <div className="flex gap-2 pt-2">
              {authed ? (
                <>
                  <Button asChild className="flex-1" onClick={() => setOpen(false)}>
                    <Link href={dashboardHref}>Dashboard</Link>
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={handleLogout}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild className="flex-1" onClick={() => setOpen(false)}>
                    <Link href="/signup">Get in touch</Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                    <Link href="/login">Sign In</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}