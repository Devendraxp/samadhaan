"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Adjust endpoint if your API uses a different path
      const res = await axios.post(
        `${serverUrl}/auth/register?source=web`,
        { name, email, password },
        { withCredentials: true }
      );
      const payload = res?.data?.data;
      const role = payload?.user?.role;
      toast.success(res?.data?.message || "Logged in successfully.");

      const target = role
        ? `/dashboard/${String(role).toLowerCase()}`
        : "/dashboard";
      router.push(target);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const msg =
          err.response?.data?.message ||
          err.response?.statusText ||
          "Registration failed";
        toast.error(msg);
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen hero-bg pb-48 md:pb-64">
      <div className="auth-card-wrapper">
        <Card className="w-full max-w-md rounded-xl shadow-lg bg-card/80 supports-[backdrop-filter]:bg-card/60 border border-border backdrop-blur">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-bold">Create Account</CardTitle>
            <CardDescription>
              Join the hostel management platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4 w-90">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  At least 8 characters
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating..." : "Create Account"}
              </Button>
            </form>
            <p className="mt-4 text-sm text-center">
              Have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Login
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
      <div
        className="absolute -bottom-16 md:-bottom-24 left-0 right-0 h-48 md:h-64 bg-building"
        aria-hidden
      />
    </div>
  );
}
