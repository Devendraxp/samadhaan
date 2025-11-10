"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ email, password });
  };

  return (
    <div className="auth-screen hero-bg">
      <div className="auth-card-wrapper">
        <Card className="w-full max-w-md rounded-xl shadow-lg border border-transparent bg-white/90 backdrop-blur">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-bold">Welcome Back!</CardTitle>
            <CardDescription>Sign in to continue to Samadhaan</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2 w-90">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot" className="text-xs text-primary hover:underline">Forgot?</Link>
                </div>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full">Sign In</Button>
            </form>
            <p className="mt-4 text-sm text-center">
              New here? <Link href="/signup" className="text-primary hover:underline">Create account</Link>
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-170 bg-building" aria-hidden />
    </div>
  );
}