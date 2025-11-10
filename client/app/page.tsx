"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center px-6 py-24 hero-bg">
      {/* Clouds */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="cloud cloud-a" />
        <div className="cloud cloud-b" />
        <div className="cloud cloud-c" />
      </div>

      <div className="relative z-10 max-w-4xl space-y-8">
        <h1 className="text-3xl sm:text-5xl font-bold leading-tight">
          The <span className="text-primary">Hostel Management</span> & Complaint
          Solution for IIIT Nagpur
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Register Your complaint, Track, Get a faster solution and Real time Alerts and notification from staff
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/signup">Register</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>

      {/* Floating badges (sample) */}
      <div className="hidden md:block absolute bottom-44 left-1/2 -translate-x-1/2 z-10 space-x-3">
        <span className="badge">Register Complaint</span>
        <span className="badge">Track Progress</span>
        <span className="badge">Get Faster Solution</span>
      </div>

      {/* Building background */}
      <div className="absolute bottom-0 left-0 right-0 h-64 md:h-170 bg-building" aria-hidden />
    </main>
  );
}
