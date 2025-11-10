"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
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

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <header className="relative z-50">
      {/* Announcement bar */}
      <nav className="bg-white/80 backdrop-blur border-b">
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

            <Button asChild variant="outline" className="hidden md:inline-flex">
              <Link href="/signup">SignUp</Link>
            </Button>
            <Button asChild variant="ghost" className="hidden md:inline-flex">
              <Link href="/login">Log In</Link>
            </Button>

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
          <div className="md:hidden border-t bg-white px-4 pb-4 space-y-3">
            <Link href="#product" className="block py-2">Product</Link>
            <Link href="#about" className="block py-2">About</Link>
            <Link href="#resources" className="block py-2">Resources</Link>
            <Link href="#contact" className="block py-2">Contact</Link>
            <div className="flex gap-2 pt-2">
              <Button asChild className="flex-1">
                <Link href="/signup">Get in touch</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}