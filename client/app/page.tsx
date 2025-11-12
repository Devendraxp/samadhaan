"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Complaint, ComplaintStatus } from "@/types/complaint";

export default function HomePage() {
  return (
    <>
      <main className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center px-6 pt-24 pb-56 md:pb-72 hero-bg">
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
        <div
          className="absolute -bottom-20 sm:-bottom-24 md:-bottom-28 lg:-bottom-32 left-0 right-0 h-56 sm:h-64 md:h-80 lg:h-[28rem] bg-building"
          aria-hidden
        />
      </main>

      {/* Stats section */}
      <StatsSection />
    </>
  );
}

const EXCLUDED: ComplaintStatus[] = ["ARCHIVED", "CANCELED", "DELETED"];

// Simple animated counter using requestAnimationFrame
function AnimatedNumber({ value, start, duration = 1200 }: { value: number; start: boolean; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    if (!start) return;
    setDisplay(0);
    startTime.current = null;

    const step = (ts: number) => {
      if (!startTime.current) startTime.current = ts;
      const progress = Math.min((ts - startTime.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setDisplay(Math.round(value * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, start, duration]);

  return <span>{display.toLocaleString()}</span>;
}

function useInView<T extends HTMLElement>(options?: IntersectionObserverInit) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setInView(true);
          }
        });
      },
      { threshold: 0.25, root: null, rootMargin: "0px", ...options }
    );
    io.observe(el);
    return () => io.unobserve(el);
  }, [options]);

  return { ref, inView } as const;
}

function StatsSection() {
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.2 });

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!serverUrl) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await axios.get(`${serverUrl}/complaint?source=web`, {
          withCredentials: true,
        });
        const data = res?.data?.data as Complaint[] | undefined;
        if (mounted && Array.isArray(data)) setComplaints(data);
      } catch {
        if (mounted) setComplaints([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [serverUrl]);

  const {
    totalActive,
    assignedPlusWip,
    resolvedTotal,
    last7DaysReceived,
    last7DaysResolved,
  } = useMemo(() => {
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    const valid = complaints.filter((c) => !EXCLUDED.includes(c.status));
    const totalActive = valid.length;
    const assignedPlusWip = valid.filter((c) => c.status === "ASSIGNED" || c.status === "WORK_IN_PROGRESS").length;
    const resolvedTotal = valid.filter((c) => c.status === "RESOLVED").length;

    const last7DaysReceived = valid.filter((c) => new Date(c.createdAt).getTime() >= sevenDaysAgo).length;
    const last7DaysResolved = valid.filter(
      (c) => c.status === "RESOLVED" && new Date(c.updatedAt).getTime() >= sevenDaysAgo
    ).length;

    return { totalActive, assignedPlusWip, resolvedTotal, last7DaysReceived, last7DaysResolved };
  }, [complaints]);

  return (
    <section ref={ref} className="bg-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-20 mt-30">
        <div className="mx-auto max-w-6xl space-y-10">
          <header className="space-y-2 text-center">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">At a glance</h2>
            <p className="text-sm text-muted-foreground">Live stats from the complaint system</p>
          </header>

          {/* Top 3 big numbers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <Card className="p-6 flex flex-col items-center justify-center">
              <div className="text-muted-foreground text-xs uppercase tracking-wide">Total complaints</div>
              <div className="mt-2 text-5xl sm:text-6xl font-extrabold tabular-nums">
                <AnimatedNumber value={totalActive} start={inView && !loading} />
              </div>
            </Card>

            <Card className="p-6 flex flex-col items-center justify-center">
              <div className="text-muted-foreground text-xs uppercase tracking-wide">Assigned or In Progress</div>
              <div className="mt-2 text-5xl sm:text-6xl font-extrabold tabular-nums">
                <AnimatedNumber value={assignedPlusWip} start={inView && !loading} />
              </div>
            </Card>

            <Card className="p-6 flex flex-col items-center justify-center">
              <div className="text-xs uppercase tracking-wide text-emerald-600 dark:text-emerald-400 font-semibold">
                Resolved
              </div>
              <div className="mt-2 text-5xl sm:text-6xl font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400">
                <AnimatedNumber value={resolvedTotal} start={inView && !loading} />
              </div>
            </Card>
          </div>

          {/* Last 7 days */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <Card className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-muted-foreground text-xs uppercase tracking-wide">Received (last 7 days)</div>
                <div className="text-4xl sm:text-5xl font-extrabold tabular-nums">
                  <AnimatedNumber value={last7DaysReceived} start={inView && !loading} />
                </div>
              </div>
              <div className="text-xs text-muted-foreground">Newly created complaints</div>
            </Card>

            <Card className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-xs uppercase tracking-wide text-emerald-600 dark:text-emerald-400 font-semibold">
                  Resolved (last 7 days)
                </div>
                <div className="text-4xl sm:text-5xl font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400">
                  <AnimatedNumber value={last7DaysResolved} start={inView && !loading} />
                </div>
              </div>
              <div className="text-xs text-muted-foreground">Marked as resolved</div>
            </Card>
          </div>

          <div className="flex justify-center pt-2">
            <Button asChild size="lg" className="px-8">
              <Link href="/complaint">See all complaints</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
