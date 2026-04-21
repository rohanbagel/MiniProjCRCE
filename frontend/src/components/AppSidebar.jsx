import { Calendar, Home, Tractor, Beef, Syringe, LogOut, User, Activity, Moon, Sun, Globe, Bell, Sprout, Store, Package, Coins, ChevronRight, ChevronUp, TrendingUp, DollarSign, LineChart, AlertCircle, Radio, Video, Stethoscope, Briefcase, Fingerprint } from "lucide-react"
import { useUser } from "../context/UserContext"
import { useTheme } from "../context/ThemeContext"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useLocation, useNavigate, Link } from "react-router-dom"
import { LanguageToggle } from "./LanguageToggle"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar"

// Simplified farmer navigation — only core tabs shown
const navGroups = [
  {
    label: "My Farm",
    items: [
      { title: "Home", url: "/dashboard", icon: Home },
      {
        title: "Farms",
        url: "/farms",
        icon: Tractor,
        subItems: [
          { title: "My Farm", url: "/farms" },
          { title: "Add Farm", url: "/farms/create" },
          // { title: "Watch My Farm", url: "/farm-monitoring" },
          // { title: "Farm Boundary", url: "/geofencing", icon: Radio },
          // { title: "Herd Watch", url: "/herd-watch" },
        ],
      },
      {
        title: "Animals",
        url: "/animals",
        icon: Beef,
        subItems: [
          { title: "My Animals", url: "/animals" },
          { title: "Add Animal", url: "/animals/create" },
        ],
      },
    ],
  },
  {
    label: "Health & Care",
    items: [
      { title: "Shot Schedule", url: "/calendar", icon: Calendar },
      // { title: "Animal Health", url: "/live-vitals", icon: Activity },
      // { title: "Disease AI", url: "/disease-detector", icon: Stethoscope },
      { title: "Alerts", url: "/alerts", icon: Bell },
      // { title: "Emergency Help", url: "/emergency", icon: AlertCircle },
      // { title: "Production Tracking", url: "/bi/production", icon: Package },
    ],
  },
  {
    label: "Help & Info",
    items: [
      // { title: "Aadhaar Verify", url: "/aadhaar-verify", icon: Fingerprint },
      { title: "Govt Help", url: "/schemes", icon: Sprout },
      // { title: "Insights", url: "/insights", icon: LineChart },
      // { title: "Video Report", url: "/video-summary", icon: Video },
    ],
  },
];

export function AppSidebar() {
  const { user, mongoUser, logout, setIsBusinessMode } = useUser();
  const { theme, setTheme } = useTheme();
  const { state, isMobile, setOpen } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();

  const isDark =
    theme === "dark" ||
    (theme === "system" && typeof window !== "undefined"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : false);

  const sidebarColors = isDark
    ? {
        "--sidebar": "#121812",
        "--sidebar-foreground": "#a8c0a8",
        "--sidebar-border": "#223022",
        "--sidebar-accent": "#1a251a",
        "--sidebar-accent-foreground": "#d2e3d2",
        "--sidebar-primary": "#5e8c5e",
        "--sidebar-primary-foreground": "#edf5ed",
      }
    : {
        "--sidebar": "#1e2d1e",
        "--sidebar-foreground": "#c8ddc8",
        "--sidebar-border": "#2f4a2f",
        "--sidebar-accent": "#2a3b2a",
        "--sidebar-accent-foreground": "#dbebdb",
        "--sidebar-primary": "#3a6b3a",
        "--sidebar-primary-foreground": "#e8f4e8",
      };

  const isActive = (url, hasChildren = false) => {
    if (location.pathname === url) return true;
    if (hasChildren) return location.pathname.startsWith(url + '/');
    return false;
  };

  const isGroupOpen = (item) => {
    if (isActive(item.url, true)) return true;
    if (item.subItems) {
      return item.subItems.some(sub => location.pathname === sub.url);
    }
    return false;
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleSidebarMouseEnter = () => {
    if (!isMobile) {
      setOpen(true);
    }
  };

  const handleSidebarMouseLeave = () => {
    if (!isMobile) {
      setOpen(false);
    }
  };

  return (
    <Sidebar
      collapsible="icon"
      onMouseEnter={handleSidebarMouseEnter}
      onMouseLeave={handleSidebarMouseLeave}
      className="[&_[data-sidebar=sidebar]]:scrollbar-thin [&_[data-sidebar=sidebar]]:scrollbar-track-transparent [&_[data-sidebar=sidebar]]:scrollbar-thumb-[#335133] hover:[&_[data-sidebar=sidebar]]:scrollbar-thumb-[#4b6e4b] [&_[data-sidebar=sidebar]]:scrollbar-thumb-rounded-full"
      style={sidebarColors}
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel
            className="py-4 mb-2 text-xl font-semibold"
            style={{ color: "#e9f3e9", fontFamily: "Fraunces, serif", fontStyle: "italic" }}
          >
            पशु पहचान
          </SidebarGroupLabel>
        </SidebarGroup>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.2em] text-[#8fb08f] font-semibold">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) =>
                  item.subItems ? (
                    <Collapsible key={item.title} asChild defaultOpen={isGroupOpen(item)} className="group/collapsible">
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            isActive={isActive(item.url, true)}
                            className={cn(
                              "cursor-pointer text-[#c8ddc8] hover:bg-[#2a3a2a] hover:text-[#ecf7ec] rounded-md",
                              state === "expanded" && isActive(item.url, true) && "border-l-[3px] border-[#3a6b3a] bg-[#294029] text-[#ecf7ec] pl-2"
                            )}
                          >
                            <item.icon />
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.subItems.map((sub) => (
                              <SidebarMenuSubItem key={sub.url}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={location.pathname === sub.url}
                                >
                                  <Link to={sub.url}>{sub.title}</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  ) : (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.url, true)}
                        className={cn(
                          "text-[#c8ddc8] hover:bg-[#2a3a2a] hover:text-[#ecf7ec] rounded-md",
                          state === "expanded" && isActive(item.url, true) && "border-l-[3px] border-[#3a6b3a] bg-[#294029] text-[#ecf7ec] pl-2"
                        )}
                      >
                        <Link to={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground outline-none ring-0"
                >
                  <Avatar className="h-8 w-8 rounded-full">
                    <AvatarImage src={mongoUser?.imageUrl || user?.photoURL || user?.profilePicture || user?.avatar} alt={mongoUser?.fullName || user?.displayName || user?.name || "User"} />
                    <AvatarFallback className="rounded-full">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  {state === "expanded" && (
                    <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                      <span className="truncate font-semibold">{mongoUser?.fullName || user?.displayName || user?.name || "My Account"}</span>
                    </div>
                  )}
                  {state === "expanded" && <ChevronUp className="ml-auto h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg mb-2"
                side={state === "collapsed" ? "right" : "bottom"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center w-full cursor-pointer py-2 px-3">
                    <User className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>My Profile</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => { setIsBusinessMode(true); navigate('/business'); }} className="cursor-pointer py-2 px-3">
                  <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Business Dashboard</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer py-2 px-3">
                  {theme === "dark" ? <Sun className="mr-2 h-4 w-4 text-muted-foreground" /> : <Moon className="mr-2 h-4 w-4 text-muted-foreground" />}
                  <span>Change Look ({theme === 'dark' ? 'Light' : 'Dark'})</span>
                </DropdownMenuItem>

                <LanguageToggle>
                  <DropdownMenuItem className="cursor-pointer w-full py-2 px-3" onSelect={(e) => e.preventDefault()}>
                    <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Language</span>
                  </DropdownMenuItem>
                </LanguageToggle>

                <DropdownMenuSeparator className="my-1" />

                <DropdownMenuItem onClick={logout} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer py-2 px-3">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span className="font-medium text-destructive">Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
