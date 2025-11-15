import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Menu, LogOut, User } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { User as UserType } from "@/lib/types";

export const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("/user/profile");
        setUser(response.data);
      } catch (error) {
        // Not logged in
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      setUser(null);
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const NavLinks = ({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) => {
    const dashboardPath = user?.role ? `/dashboard/${user.role.toLowerCase()}` : "/dashboard";

    if (!user) {
      return (
        <>
          <Link to="/login" onClick={onNavigate}>
            <Button variant={mobile ? "ghost" : "ghost"} className="w-full justify-start">
              Login
            </Button>
          </Link>
          <Link to="/signup" onClick={onNavigate}>
            <Button variant={mobile ? "default" : "default"} className="w-full justify-start">
              Sign Up
            </Button>
          </Link>
        </>
      );
    }

    return (
      <>
        <Link to={dashboardPath} onClick={onNavigate}>
          <Button
            variant={mobile ? "ghost" : "ghost"}
            className="w-full justify-start"
            disabled={!user.role}
          >
            Dashboard
          </Button>
        </Link>
        <Link to="/complaints" onClick={onNavigate}>
          <Button variant={mobile ? "ghost" : "ghost"} className="w-full justify-start">
            Complaints
          </Button>
        </Link>
        <Link to="/notifications" onClick={onNavigate}>
          <Button variant={mobile ? "ghost" : "ghost"} className="w-full justify-start">
            Notifications
          </Button>
        </Link>
        <Link to="/profile" onClick={onNavigate}>
          <Button variant={mobile ? "ghost" : "ghost"} className="w-full justify-start">
            <User className="h-4 w-4 mr-2" />
            Profile
          </Button>
        </Link>
        <Button
          variant={mobile ? "ghost" : "ghost"}
          onClick={() => {
            handleLogout();
            onNavigate?.();
          }}
          className="w-full justify-start"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </>
    );
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Samadhaan
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-2">
          {!loading && <NavLinks />}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col space-y-4 mt-8">
                {!loading && <NavLinks mobile onNavigate={() => {}} />}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};
