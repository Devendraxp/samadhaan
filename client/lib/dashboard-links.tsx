import { DashboardLink } from "@/components/dashboard-sidebar";
import { ReactNode } from "react";
import { Home, UserCog, ServerCog, Globe, Utensils, Users, Bus, Droplets } from "lucide-react";

type IconMap = { [k: string]: ReactNode };

const icons: IconMap = {
  home: <Home className="size-4" />,
  admin: <UserCog className="size-4" />,
  cleaning: <ServerCog className="size-4" />,
  internet: <Globe className="size-4" />,
  mess: <Utensils className="size-4" />,
  student: <Users className="size-4" />,
  transport: <Bus className="size-4" />,
  water: <Droplets className="size-4" />,
};

export const dashboardLinks: DashboardLink[] = [
  { name: "Home", href: "/dashboard/admin", icon: icons.admin },
  { name: "Cleaning", href: "/dashboard/cleaning", icon: icons.cleaning },
  { name: "Internet", href: "/dashboard/internet", icon: icons.internet },
  { name: "Mess", href: "/dashboard/mess", icon: icons.mess },
  { name: "Student", href: "/dashboard/student", icon: icons.student },
  { name: "Transport", href: "/dashboard/transport", icon: icons.transport },
  { name: "Water", href: "/dashboard/water", icon: icons.water },
];