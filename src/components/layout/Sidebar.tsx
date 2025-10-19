import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Home,
  Music,
  Users,
  FileText,
  Settings,
  Upload,
  BarChart3,
  User,
  Building2,
  Shield,
  CheckCircle,
  Clock,
  XCircle,
  CreditCard,
  FileCheck,
  UserCheck,
  Headphones,
  LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

interface NavigationItem {
  title: string;
  url: string;
  icon: LucideIcon;
  badge?: string;
}

interface NavigationSection {
  label: string;
  items: NavigationItem[];
}

const navigationConfig: Record<string, NavigationSection[]> = {
  ARTIST: [
    {
      label: "Dashboard",
      items: [
        { title: "Overview", url: "/artist", icon: Home },
        { title: "My Profile", url: "/artist/profile", icon: User },
        { title: "Statistics", url: "/artist/stats", icon: BarChart3 },
        { title: "Performance", url: "/artist/performance", icon: BarChart3 },
      ]
    },
    {
      label: "Music Management",
      items: [
        { title: "Upload Music", url: "/artist/upload", icon: Upload },
        { title: "My Music", url: "/artist/music", icon: Music },
        { title: "Approved Tracks", url: "/artist/approved", icon: CheckCircle },
      ]
    },
    {
      label: "Account",
      items: [
        { title: "Documents", url: "/artist/documents", icon: FileText },
        { title: "Settings", url: "/artist/settings", icon: Settings },
      ]
    }
  ],
  COMPANY: [
    {
      label: "Dashboard",
      items: [
        { title: "Overview", url: "/company", icon: Home },
        { title: "Profile", url: "/company/profile", icon: Building2 },
        { title: "Statistics", url: "/company/stats", icon: BarChart3 },
      ]
    },
    {
      label: "Music Library",
      items: [
        { title: "Browse Music", url: "/company/music", icon: Music },
        { title: "Audio Player", url: "/company/player", icon: Headphones },
      ]
    },
    {
      label: "LogSheets",
      items: [
        { title: "Create LogSheet", url: "/company/logsheet/create", icon: FileText },
        { title: "My LogSheets", url: "/company/logsheets", icon: FileCheck },
      ]
    },
    {
      label: "Account",
      items: [
        { title: "Settings", url: "/company/settings", icon: Settings },
      ]
    }
  ],
  ADMIN: [
    {
      label: "Dashboard",
      items: [
        { title: "Overview", url: "/admin", icon: Home },
        { title: "Statistics", url: "/admin/stats", icon: BarChart3 },
        { title: "Performance", url: "/admin/performance", icon: BarChart3 },
      ]
    },
    {
      label: "Approval System",
      items: [
        { title: "Pending Profiles", url: "/admin/profiles/pending", icon: Clock },
        { title: "Pending Music", url: "/admin/music/pending", icon: Clock },
        { title: "License Applications", url: "/admin/licenses", icon: FileCheck },
      ]
    },
    {
      label: "Management",
      items: [
        { title: "All Users", url: "/admin/users", icon: Users },
        { title: "All Artists", url: "/admin/artists", icon: User },
        { title: "Approved Profiles", url: "/admin/profiles/approved", icon: UserCheck },
        { title: "Rejected Profiles", url: "/admin/profiles/rejected", icon: XCircle },
        { title: "All Companies", url: "/admin/companies", icon: Building2 },
        { title: "All Admins", url: "/admin/admins", icon: Shield },
        { title: "All Music", url: "/admin/music", icon: Music },
        { title: "All LogSheets", url: "/admin/logsheets", icon: FileText },
      ]
    },
    {
      label: "Finance",
      items: [
        { title: "Invoices", url: "/admin/invoices", icon: CreditCard },
        { title: "Artist Payments", url: "/admin/payments", icon: UserCheck },
      ]
    }
  ]
};

const AppSidebar: React.FC = () => {
  const { state } = useSidebar();
  const { userRole } = useAuth();
  const location = useLocation();
  const collapsed = state === 'collapsed';

  const navigation = userRole ? navigationConfig[userRole] : [];

  const isActive = (path: string) => location.pathname === path;

  const getNavCls = (path: string) => 
    isActive(path) 
      ? "bg-gradient-namsa text-primary-foreground font-medium shadow-md" 
      : "hover:bg-muted/50 text-foreground";

  if (!userRole) return null;

  return (
    <Sidebar
      className={`${collapsed ? "w-16" : "w-64"} border-r border-border bg-sidebar transition-all duration-300`}
      variant="inset"
    >
      {/* Sidebar Trigger */}
      <div className="flex justify-end p-2 md:hidden">
        <SidebarTrigger className="hover-scale" />
      </div>

      <SidebarContent className="px-2">
        {navigation.map((section, index) => (
          <SidebarGroup key={index} className="mb-4">
            {!collapsed && (
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {section.label}
              </SidebarGroupLabel>
            )}
            
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item, itemIndex) => (
                  <SidebarMenuItem key={itemIndex} className="mb-1">
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={`${getNavCls(item.url)} flex items-center rounded-lg p-3 transition-all duration-200 hover-scale`}
                      >
                        <item.icon className={`h-5 w-5 ${collapsed ? 'mx-auto' : 'mr-3'} flex-shrink-0`} />
                        {!collapsed && (
                          <div className="flex items-center justify-between w-full">
                            <span className="text-sm font-medium">{item.title}</span>
                            {item.badge && (
                              <Badge 
                                variant={item.badge === 'pending' ? 'destructive' : 'secondary'} 
                                className="text-xs animate-pulse-glow"
                              >
                                {item.badge === 'pending' ? '!' : item.badge}
                              </Badge>
                            )}
                          </div>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
