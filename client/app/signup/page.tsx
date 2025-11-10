"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ name, email, password });
  };

  return (
    <div className="auth-screen hero-bg">
      <div className="auth-card-wrapper">
        <Card className="w-full max-w-md rounded-xl shadow-lg border border-transparent bg-white/90 backdrop-blur">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-bold">Create Account</CardTitle>
            <CardDescription>Join the hostel management platform</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4 w-90">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" minLength={8} value={password} onChange={e => setPassword(e.target.value)} required />
                <p className="text-xs text-muted-foreground">At least 8 characters</p>
              </div>
              <Button type="submit" className="w-full">Create Account</Button>
            </form>
            <p className="mt-4 text-sm text-center">
              Have an account? <Link href="/login" className="text-primary hover:underline">Login</Link>
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-170 bg-building" aria-hidden />
    </div>
  );
}